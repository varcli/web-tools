import * as XLSX from 'xlsx'
import { dump, load } from 'js-yaml'

export type SourceFormat = 'json' | 'xml' | 'yaml' | 'csv' | 'excel'
export type TargetFormat = SourceFormat | 'sql'
export interface ConvertOptions {
  delimiter: string
  indent: number
  includeHeader: boolean
  flatten: boolean
  rootName: string
  tableName: string
}

function parseCell(value: string): unknown {
  if (value === '') return ''
  if (value === 'true') return true
  if (value === 'false') return false
  if (value === 'null') return null
  if (/^-?(?:0|[1-9]\d*)(?:\.\d+)?$/.test(value)) return Number(value)
  return value
}

export function parseCsv(text: string, delimiter: string): string[][] {
  if (!delimiter) throw new Error('分隔符不能为空')
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false
  for (let index = 0; index < text.length; index++) {
    const char = text[index]
    if (char === '"') {
      if (quoted && text[index + 1] === '"') { cell += '"'; index++ }
      else if (!quoted && cell !== '') cell += char
      else quoted = !quoted
    } else if (!quoted && text.startsWith(delimiter, index)) {
      row.push(cell); cell = ''; index += delimiter.length - 1
    } else if (!quoted && (char === '\n' || char === '\r')) {
      row.push(cell); rows.push(row); row = []; cell = ''
      if (char === '\r' && text[index + 1] === '\n') index++
    } else cell += char
  }
  if (quoted) throw new Error('CSV 引号未闭合')
  if (cell !== '' || row.length) { row.push(cell); rows.push(row) }
  return rows
}

function xmlValue(element: Element): unknown {
  if (!element.children.length) {
    const type = element.getAttribute('data-type')
    if (type === 'object') return {}
    if (type === 'null') return null
    if (type === 'boolean') return element.textContent === 'true'
    if (type === 'number') return Number(element.textContent)
    if (type === 'string') return element.textContent ?? ''
    return parseCell(element.textContent ?? '')
  }
  const result: Record<string, unknown> = {}
  for (const child of Array.from(element.children)) {
    if (child.getAttribute('data-array-empty') === 'true') {
      if (child.getAttribute('data-array-item') === 'true') {
        if (!Array.isArray(result[child.tagName])) result[child.tagName] = []
        ;(result[child.tagName] as unknown[]).push([])
      } else result[child.tagName] = []
      continue
    }
    const value = xmlValue(child)
    if (child.getAttribute('data-array-item') === 'true') {
      if (!Array.isArray(result[child.tagName])) result[child.tagName] = []
      ;(result[child.tagName] as unknown[]).push(value)
      continue
    }
    if (!(child.tagName in result)) result[child.tagName] = value
    else if (Array.isArray(result[child.tagName])) (result[child.tagName] as unknown[]).push(value)
    else result[child.tagName] = [result[child.tagName], value]
  }
  return result
}

function parseXml(text: string): unknown {
  const doc = new DOMParser().parseFromString(text, 'application/xml')
  if (doc.querySelector('parsererror')) throw new Error('XML 格式错误，请检查标签是否闭合')
  if (doc.documentElement.getAttribute('data-array-root') === 'true') {
    return Array.from(doc.documentElement.children).filter(child => child.tagName === 'item').map(child => child.getAttribute('data-array-empty') === 'true' ? [] : xmlValue(child))
  }
  return xmlValue(doc.documentElement)
}

export function parseSource(format: SourceFormat, text: string, options: ConvertOptions, file?: ArrayBuffer): unknown {
  if (format === 'excel') {
    if (!file) throw new Error('请上传 Excel 文件')
    const workbook = XLSX.read(file, { type: 'array' })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    if (!sheet) throw new Error('Excel 文件没有可读取的工作表')
    return XLSX.utils.sheet_to_json(sheet, { defval: null })
  }
  if (!text.trim()) throw new Error('请先输入或上传内容')
  if (format === 'json') return JSON.parse(text) as unknown
  if (format === 'yaml') return load(text)
  if (format === 'xml') return parseXml(text)
  const rows = parseCsv(text, options.delimiter)
  if (!rows.length) return []
  const headers = options.includeHeader ? rows.shift()! : rows[0].map((_, index) => `column${index + 1}`)
  return rows.map(row => Object.fromEntries(headers.map((header, index) => [header, parseCell(row[index] ?? '')])))
}

function flattenRecord(value: Record<string, unknown>, prefix = ''): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const [key, item] of Object.entries(value)) {
    const name = prefix ? `${prefix}.${key}` : key
    if (item && typeof item === 'object' && !Array.isArray(item)) Object.assign(result, flattenRecord(item as Record<string, unknown>, name))
    else result[name] = item && typeof item === 'object' ? JSON.stringify(item) : item
  }
  return result
}

function toRows(value: unknown, flatten: boolean): { rows: Record<string, unknown>[]; headers: string[] } {
  const items = Array.isArray(value) ? value : [value]
  const rows = items.map(item => {
    const record = item && typeof item === 'object' && !Array.isArray(item) ? item as Record<string, unknown> : { value: item }
    return flatten ? flattenRecord(record) : Object.fromEntries(Object.entries(record).map(([key, cell]) => [key, cell && typeof cell === 'object' ? JSON.stringify(cell) : cell]))
  })
  return { rows, headers: [...new Set(rows.flatMap(row => Object.keys(row)))] }
}

function csvCell(value: unknown, delimiter: string): string {
  const text = value === null || value === undefined ? '' : String(value)
  return text.includes(delimiter) || /["\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

function xmlEscape(value: unknown): string {
  return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
}

function toXml(value: unknown, name: string, depth: number, indent: number): string {
  if (!/^[A-Za-z_][\w.-]*$/.test(name)) throw new Error(`XML 标签名无效：${name}`)
  const padding = ' '.repeat(depth * indent)
  if (Array.isArray(value)) {
    if (!value.length) return `${padding}<${name} data-array-empty="true"/>\n`
    return value.map(item => toXml(item, name, depth, indent).replace(`<${name}`, `<${name} data-array-item="true"`)).join('')
  }
  if (value && typeof value === 'object') {
    const children = Object.entries(value).map(([key, item]) => toXml(item, key, depth + 1, indent)).join('')
    return `${padding}<${name} data-type="object">\n${children}${padding}</${name}>\n`
  }
  const type = value === null ? 'null' : typeof value
  return `${padding}<${name} data-type="${type}">${xmlEscape(value)}</${name}>\n`
}

function toSql(value: unknown, options: ConvertOptions): string {
  const { rows, headers } = toRows(value, options.flatten)
  if (!rows.length) return ''
  if (!/^[A-Za-z_][\w]*$/.test(options.tableName)) throw new Error('SQL 表名只允许字母、数字和下划线，且不能以数字开头')
  const column = (name: string) => `\`${name.replace(/\`/g, '\`\`')}\``
  const literal = (cell: unknown) => cell === null || cell === undefined ? 'NULL' : typeof cell === 'number' && Number.isFinite(cell) ? String(cell) : typeof cell === 'boolean' ? (cell ? 'TRUE' : 'FALSE') : `'${String(cell).replace(/'/g, "''")}'`
  return rows.map(row => `INSERT INTO ${column(options.tableName)} (${headers.map(column).join(', ')}) VALUES (${headers.map(header => literal(row[header])).join(', ')});`).join('\n')
}

export function convert(value: unknown, target: TargetFormat, options: ConvertOptions): { text: string; blob?: Blob } {
  if (target === 'json') return { text: JSON.stringify(value, null, options.indent) }
  if (target === 'yaml') return { text: dump(value, { indent: options.indent, noRefs: true, lineWidth: -1 }) }
  if (target === 'xml') {
    const arrayRoot = Array.isArray(value)
    const content = arrayRoot ? (value.length ? { item: value } : {}) : value
    const xml = toXml(content, options.rootName || 'root', 0, options.indent)
    const marked = arrayRoot ? xml.replace(/^<([^>]+)>/, '<$1 data-array-root="true">') : xml
    return { text: `<?xml version="1.0" encoding="UTF-8"?>\n${marked}` }
  }
  if (target === 'sql') return { text: toSql(value, options) }
  const { rows, headers } = toRows(value, options.flatten)
  if (target === 'csv') {
    const lines = options.includeHeader ? [headers.map(header => csvCell(header, options.delimiter)).join(options.delimiter)] : []
    rows.forEach(row => lines.push(headers.map(header => csvCell(row[header], options.delimiter)).join(options.delimiter)))
    return { text: lines.join('\n') }
  }
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(rows, { header: headers }), 'Sheet1')
  const bytes = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer
  return { text: `已生成 Excel 文件（${rows.length} 行）`, blob: new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }) }
}
