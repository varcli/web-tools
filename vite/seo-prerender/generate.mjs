import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import ts from 'typescript'
import { loadEnv } from 'vite'

const root = process.cwd()
const output = resolve(root, 'dist')
const env = loadEnv('production', root, 'VITE_')
const siteTitle = env.VITE_APP_TITLE?.trim() || 'Web-Tools'
const siteDescription = env.VITE_APP_DESC?.trim() || '一个轻量的在线工具箱'
const productionDomain = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim()
const siteUrl = (env.VITE_APP_SITE_URL?.trim() || (productionDomain ? `https://${productionDomain}` : 'https://tools.varcli.com')).replace(/\/+$/, '')
if (!/^https?:\/\/[^/]+$/.test(siteUrl)) throw new Error(`无效的 VITE_APP_SITE_URL：${siteUrl}`)

function sourceFile(name) {
  return readFile(resolve(root, name), 'utf8').then(text => ts.createSourceFile(name, text, ts.ScriptTarget.Latest))
}

function property(object, name) {
  if (!ts.isObjectLiteralExpression(object)) return undefined
  return object.properties.find(item => ts.isPropertyAssignment(item) && (ts.isIdentifier(item.name) || ts.isStringLiteral(item.name)) && item.name.text === name)?.initializer
}

function stringProperty(object, name) {
  const value = property(object, name)
  return value && ts.isStringLiteral(value) ? value.text : ''
}

function normalizePath(url) {
  const path = url.split(/[?#]/)[0].replace(/\/+$/, '') || '/'
  if (!path.startsWith('/') || path.includes('..')) throw new Error(`无效的工具路由：${url}`)
  return path
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char])
}

function catalogFrom(source) {
  const declaration = source.statements.find(item => ts.isFunctionDeclaration(item) && item.name?.text === 'getToolsCate')
  const result = declaration?.body?.statements.find(ts.isReturnStatement)?.expression
  if (!result || !ts.isArrayLiteralExpression(result)) throw new Error('无法读取 getToolsCate() 的分类清单')
  return result.elements.map(category => {
    const list = property(category, 'list')
    if (!list || !ts.isArrayLiteralExpression(list)) throw new Error('工具分类缺少 list')
    return {
      title: stringProperty(category, 'title'),
      tools: list.elements.map(tool => ({
        title: stringProperty(tool, 'title'),
        description: stringProperty(tool, 'desc'),
        url: stringProperty(tool, 'url'),
      })),
    }
  })
}

function routesFrom(source) {
  const declaration = source.statements.find(item => ts.isVariableStatement(item) && item.declarationList.declarations.some(entry => entry.name.getText(source) === 'constantRoute'))
  const routes = declaration?.declarationList.declarations.find(entry => entry.name.getText(source) === 'constantRoute')?.initializer
  if (!routes || !ts.isArrayLiteralExpression(routes)) throw new Error('无法读取 constantRoute 路由清单')
  const result = new Map()
  for (const record of routes.elements) {
    const path = stringProperty(record, 'path')
    if (!path || path.includes(':')) continue
    const meta = property(record, 'meta')
    result.set(normalizePath(path), {
      title: stringProperty(meta, 'title'),
      description: stringProperty(meta, 'description'),
      keywords: stringProperty(meta, 'keywords'),
    })
  }
  return result
}

function setMeta(html, attribute, name, value) {
  const safeValue = escapeHtml(value)
  const pattern = new RegExp(`(<meta ${attribute}="${name}" content=")[^"]*(")`)
  if (!pattern.test(html)) throw new Error(`index.html 缺少 ${name} 元信息`)
  return html.replace(pattern, (_, start, end) => `${start}${safeValue}${end}`)
}

function pageHtml(template, path, title, description, keywords, content) {
  const fullTitle = path === '/' ? `${siteTitle} - ${siteDescription}` : `${title} - ${siteTitle}`
  const canonical = `${siteUrl}${path === '/' ? '/' : `${path}/`}`
  let html = template.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(fullTitle)}</title>`)
  html = setMeta(html, 'name', 'keywords', keywords)
  html = setMeta(html, 'name', 'description', description)
  html = setMeta(html, 'property', 'og:title', fullTitle)
  html = setMeta(html, 'property', 'og:site_name', siteTitle)
  html = setMeta(html, 'property', 'og:description', description)
  html = setMeta(html, 'property', 'og:url', canonical)
  html = html.replace(/(<link rel="canonical" href=")[^"]*(")/, (_, start, end) => `${start}${escapeHtml(canonical)}${end}`)
  if (!html.includes('<div id="app"></div>')) throw new Error('index.html 缺少空的 #app 容器')
  const style = '<style id="static-page-style">.static-page{box-sizing:border-box;max-width:1080px;margin:48px auto;padding:0 24px;font:16px/1.7 system-ui,sans-serif;color:#17233b}.static-page h1{font-size:32px;line-height:1.3}.static-page h2{margin-top:32px;font-size:22px}.static-page p{color:#50617a}.static-page a{color:#2878e8;text-decoration:none}.static-page ul{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;list-style:none;padding:0}.static-page li{padding:12px 16px;border:1px solid #dce6f5;border-radius:12px}.static-page small{display:block;color:#50617a}</style>'
  return html.replace('</head>', `${style}</head>`).replace('<div id="app"></div>', `<div id="app"><main class="static-page">${content}</main></div>`)
}

function toolList(tools) {
  return `<ul>${tools.map(tool => `<li><a href="${escapeHtml(normalizePath(tool.url))}/">${escapeHtml(tool.title)}</a><small>${escapeHtml(tool.description)}</small></li>`).join('')}</ul>`
}

async function main() {
  const [catalogSource, routerSource, template] = await Promise.all([
    sourceFile('src/components/Tools/tools.ts'),
    sourceFile('src/router/router.ts'),
    readFile(join(output, 'index.html'), 'utf8'),
  ])
  const categories = catalogFrom(catalogSource)
  const routes = routesFrom(routerSource)
  const tools = new Map()
  for (const category of categories) {
    for (const tool of category.tools) {
      const path = normalizePath(tool.url)
      if (!routes.has(path)) throw new Error(`工具 ${tool.title} 缺少路由：${path}`)
      if (!tools.has(path)) tools.set(path, { ...tool, category: category.title })
    }
  }

  for (const [path, tool] of tools) {
    const meta = routes.get(path)
    const title = meta.title || tool.title
    const description = meta.description || tool.description || siteDescription
    const related = [...tools.values()].filter(item => item.category === tool.category && normalizePath(item.url) !== path).slice(0, 6)
    const content = `<a href="/">全部工具</a><h1>${escapeHtml(title)}</h1><p>${escapeHtml(description)}</p>${related.length ? `<h2>相关工具</h2>${toolList(related)}` : ''}`
    const target = join(output, path.slice(1))
    await mkdir(target, { recursive: true })
    await writeFile(join(target, 'index.html'), pageHtml(template, path, title, description, meta.keywords || tool.title, content))
  }

  const about = routes.get('/about')
  if (!about) throw new Error('缺少关于页路由')
  const aboutContent = `<a href="/">全部工具</a><h1>关于 ${escapeHtml(siteTitle)}</h1><p>${escapeHtml(siteTitle)} 是一个轻量的在线工具箱，汇集开发运维、文本处理、图片处理、数据图表等常用工具，打开页面即可使用。</p>`
  await mkdir(join(output, 'about'), { recursive: true })
  await writeFile(join(output, 'about', 'index.html'), pageHtml(template, '/about', about.title || '关于', about.description || siteDescription, about.keywords, aboutContent))

  const homeContent = `<h1>${escapeHtml(siteDescription)}</h1><p>集合多种实用工具，开箱即用，简单高效。</p>${categories.map(category => `<section><h2>${escapeHtml(category.title)}</h2>${toolList(category.tools)}</section>`).join('')}`
  await writeFile(join(output, 'index.html'), pageHtml(template, '/', siteTitle, routes.get('/')?.description || siteDescription, routes.get('/')?.keywords || '', homeContent))
  console.log(`[seo-prerender] Node.js 已生成 ${tools.size + 2} 个静态 HTML 页面，无需浏览器`)
}

await main()
