import { dump, load } from 'js-yaml'

export function yamlToProperties(text: string, separator: '=' | ':', sortKeys: boolean, unicodeEscape: boolean): string {
  const data = load(text)
  if (!data || typeof data !== 'object') throw new Error('YAML 根节点需要是对象或数组')
  const entries: [string, string][] = []
  const visit = (value: unknown, prefix: string) => {
    if (Array.isArray(value)) value.forEach((item, index) => visit(item, `${prefix}[${index}]`))
    else if (value && typeof value === 'object') Object.entries(value).forEach(([key, item]) => visit(item, prefix ? `${prefix}.${key}` : key))
    else entries.push([prefix, value == null ? '' : String(value)])
  }
  visit(data, '')
  if (sortKeys) entries.sort(([a], [b]) => a.localeCompare(b))
  const escape = (value: string) => unicodeEscape ? [...value].map(char => char.codePointAt(0)! > 127 ? [...char].map(unit => `\\u${unit.charCodeAt(0).toString(16).padStart(4, '0')}`).join('') : char).join('') : value
  return entries.map(([key, value]) => `${escape(key)}${separator}${escape(value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n'))}`).join('\n')
}

function decode(value: string): string {
  return value.replace(/\\u([0-9a-fA-F]{4})|\\([nrt\\:= ])/g, (_, code: string | undefined, special: string | undefined) => {
    if (code) return String.fromCharCode(parseInt(code, 16))
    if (special === 'n') return '\n'
    if (special === 'r') return '\r'
    if (special === 't') return '\t'
    return special ?? ''
  })
}

export function propertiesToYaml(text: string, indent: number): string {
  const root: Record<string, unknown> = {}
  const logicalLines: string[] = []
  for (const line of text.split(/\r?\n/)) {
    if (logicalLines.length && /(?<!\\)(?:\\\\)*\\$/.test(logicalLines[logicalLines.length - 1])) {
      logicalLines[logicalLines.length - 1] = logicalLines[logicalLines.length - 1].slice(0, -1) + line.trimStart()
    } else logicalLines.push(line)
  }
  for (const line of logicalLines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('!')) continue
    const separator = line.search(/(?<!\\)[=:]/)
    if (separator < 0) throw new Error(`缺少键值分隔符：${line}`)
    const key = decode(line.slice(0, separator).trim())
    const value = decode(line.slice(separator + 1).trim())
    const parts = key.replace(/\[(\d+)\]/g, '.$1').split('.')
    let target = root
    parts.slice(0, -1).forEach(part => {
      if (!target[part] || typeof target[part] !== 'object') target[part] = {}
      target = target[part] as Record<string, unknown>
    })
    target[parts[parts.length - 1]] = value
  }
  const restoreArrays = (value: unknown): unknown => {
    if (!value || typeof value !== 'object') return value
    const entries = Object.entries(value).map(([key, item]) => [key, restoreArrays(item)] as const)
    const ordered = [...entries].sort(([a], [b]) => Number(a) - Number(b))
    if (ordered.length && ordered.every(([key], index) => key === String(index))) {
      return ordered.map(([, item]) => item)
    }
    return Object.fromEntries(entries)
  }
  return dump(restoreArrays(root), { indent, noRefs: true, lineWidth: -1 })
}
