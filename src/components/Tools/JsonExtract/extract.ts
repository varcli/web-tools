import { JSONPath } from 'jsonpath-plus'

export function queryJsonPath(value: unknown, path: string): unknown[] {
  if (!path.trim().startsWith('$')) throw new Error('JSONPath 必须以 $ 开头')
  return JSONPath({ path, json: value as object, wrap: true, eval: 'safe' }) as unknown[]
}

export function listFields(value: unknown): string[] {
  const fields = new Set<string>()
  const visit = (node: unknown, prefix = '') => {
    if (Array.isArray(node)) node.forEach(item => visit(item, prefix))
    else if (node && typeof node === 'object') {
      Object.entries(node).forEach(([key, item]) => {
        const path = prefix ? `${prefix}.${key}` : key
        fields.add(path)
        visit(item, path)
      })
    }
  }
  visit(value)
  return [...fields].sort((a, b) => a.localeCompare(b))
}

function getNested(node: unknown, keys: string[]): unknown {
  if (!keys.length) return node
  if (Array.isArray(node)) return node.map(item => getNested(item, keys)).filter(item => item !== undefined)
  if (node && typeof node === 'object') return getNested((node as Record<string, unknown>)[keys[0]], keys.slice(1))
  return undefined
}

export function extractFields(value: unknown, fields: string[], preserveStructure: boolean, removeEmpty: boolean): unknown {
  const pick = (node: unknown) => {
    const result: Record<string, unknown> = {}
    fields.forEach(field => {
      const keys = field.split('.')
      const selected = getNested(node, keys)
      if (selected === undefined || (removeEmpty && (selected === null || selected === ''))) return
      if (!preserveStructure) { result[field] = selected; return }
      let target = result
      keys.slice(0, -1).forEach(key => {
        if (!target[key] || typeof target[key] !== 'object') target[key] = {}
        target = target[key] as Record<string, unknown>
      })
      target[keys[keys.length - 1]] = selected
    })
    return result
  }
  return Array.isArray(value) ? value.map(pick) : pick(value)
}

export function extractKeysOrValues(value: unknown, mode: 'keys' | 'values', includeNested: boolean): unknown[] {
  const result: unknown[] = []
  const visit = (node: unknown, prefix = '') => {
    if (Array.isArray(node)) node.forEach(item => visit(item, prefix))
    else if (node && typeof node === 'object') {
      Object.entries(node).forEach(([key, item]) => {
        const path = includeNested && prefix ? `${prefix}.${key}` : key
        if (mode === 'keys') result.push(path)
        if (item && typeof item === 'object') visit(item, path)
        else if (mode === 'values') result.push(item)
      })
    } else if (mode === 'values') result.push(node)
  }
  visit(value)
  return [...new Map(result.map(item => [JSON.stringify(item), item])).values()]
}
