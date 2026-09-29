import MarkdownIt from 'markdown-it'

const markdown = new MarkdownIt({ html: false, linkify: true, breaks: false })
export function markdownToHtml(source: string): string { return markdown.render(source) }

function inline(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return (node.textContent || '').replace(/\s+/g, ' ')
  if (!(node instanceof HTMLElement)) return ''
  const text = Array.from(node.childNodes).map(inline).join('')
  switch (node.tagName.toLowerCase()) {
    case 'br': return '  \n'
    case 'strong': case 'b': return `**${text}**`
    case 'em': case 'i': return `*${text}*`
    case 's': case 'del': return `~~${text}~~`
    case 'code': return `\`${text.replace(/`/g, '\\`')}\``
    case 'a': return `[${text || node.getAttribute('href') || ''}](${node.getAttribute('href') || ''})`
    case 'img': return `![${node.getAttribute('alt') || ''}](${node.getAttribute('src') || ''})`
    default: return text
  }
}

function block(node: Node, depth = 0): string {
  if (node.nodeType === Node.TEXT_NODE) return (node.textContent || '').trim() ? inline(node) : ''
  if (!(node instanceof HTMLElement)) return ''
  const tag = node.tagName.toLowerCase()
  if (/^h[1-6]$/.test(tag)) return `${'#'.repeat(Number(tag[1]))} ${inline(node).trim()}\n\n`
  if (tag === 'pre') return `\`\`\`\n${node.textContent?.replace(/\n$/, '') || ''}\n\`\`\`\n\n`
  if (tag === 'hr') return '---\n\n'
  if (tag === 'ul' || tag === 'ol') {
    return Array.from(node.children).filter(child => child.tagName.toLowerCase() === 'li').map((child, index) => {
      const nested = Array.from(child.children).filter(element => ['ul', 'ol'].includes(element.tagName.toLowerCase()))
      const content = Array.from(child.childNodes).filter(part => !(part instanceof HTMLElement && ['ul', 'ol'].includes(part.tagName.toLowerCase()))).map(inline).join('').trim()
      return `${'  '.repeat(depth)}${tag === 'ol' ? `${index + 1}.` : '-'} ${content}\n${nested.map(item => block(item, depth + 1)).join('')}`
    }).join('') + (depth ? '' : '\n')
  }
  if (tag === 'blockquote') return inline(node).trim().split('\n').map(line => `> ${line}`).join('\n') + '\n\n'
  if (tag === 'table') {
    const rows = Array.from(node.querySelectorAll('tr')).map(row => Array.from(row.children).map(cell => inline(cell).trim()))
    if (!rows.length) return ''
    const header = rows[0]
    return `| ${header.join(' | ')} |\n| ${header.map(() => '---').join(' | ')} |\n${rows.slice(1).map(row => `| ${row.join(' | ')} |`).join('\n')}\n\n`
  }
  if (tag === 'p') return `${inline(node).trim()}\n\n`
  if (tag === 'div' || tag === 'section' || tag === 'article' || tag === 'body' || tag === 'main') return Array.from(node.childNodes).map(child => block(child, depth)).join('')
  return `${inline(node).trim()}\n\n`
}

export function htmlToMarkdown(source: string): string {
  const doc = new DOMParser().parseFromString(source, 'text/html')
  doc.querySelectorAll('script,style,template,noscript').forEach(node => node.remove())
  return block(doc.body).replace(/\n{3,}/g, '\n\n').trim()
}
