const months: Record<string, number> = { JAN: 1, FEB: 2, MAR: 3, APR: 4, MAY: 5, JUN: 6, JUL: 7, AUG: 8, SEP: 9, OCT: 10, NOV: 11, DEC: 12 }
const weekdays: Record<string, number> = { SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6 }

function parseNumber(token: string, min: number, max: number, names: Record<string, number>): number {
  const value = names[token.toUpperCase()] ?? Number(token)
  if (!Number.isInteger(value) || value < min || value > max) throw new Error(`无效字段值：${token}`)
  return value
}

function parseField(text: string, min: number, max: number, names: Record<string, number> = {}): { values: Set<number>; wildcard: boolean } {
  const values = new Set<number>()
  const wildcard = text === '*' || text === '?'
  if (text === '?') text = '*'
  for (const part of text.split(',')) {
    const pieces = part.split('/')
    if (pieces.length > 2) throw new Error(`无效间隔：${part}`)
    const step = pieces.length === 2 ? Number(pieces[1]) : 1
    if (!Number.isInteger(step) || step < 1) throw new Error(`无效间隔：${part}`)
    const range = pieces[0]
    let start: number
    let end: number
    if (range === '*') { start = min; end = max }
    else if (range.includes('-')) {
      const bounds = range.split('-')
      if (bounds.length !== 2) throw new Error(`无效范围：${range}`)
      start = parseNumber(bounds[0], min, max, names)
      end = parseNumber(bounds[1], min, max, names)
      if (start > end) throw new Error(`范围起点不能大于终点：${range}`)
    } else {
      start = parseNumber(range, min, max, names)
      end = pieces.length === 2 ? max : start
    }
    for (let value = start; value <= end; value += step) values.add(value === 7 && max === 7 ? 0 : value)
  }
  return { values, wildcard }
}

export function nextCronTimes(expression: string, count = 10, from = new Date()): Date[] {
  const parts = expression.trim().split(/\s+/)
  if (parts.length !== 5) throw new Error('Cron 表达式需要 5 个字段：分 时 日 月 星期')
  const minute = parseField(parts[0], 0, 59)
  const hour = parseField(parts[1], 0, 23)
  const day = parseField(parts[2], 1, 31)
  const month = parseField(parts[3], 1, 12, months)
  const week = parseField(parts[4], 0, 7, weekdays)
  const result: Date[] = []
  const time = new Date(from)
  time.setSeconds(0, 0)
  time.setMinutes(time.getMinutes() + 1)
  const limit = time.getTime() + 2 * 366 * 24 * 60 * 60 * 1000
  while (result.length < count && time.getTime() <= limit) {
    const dayMatches = day.values.has(time.getDate())
    const weekMatches = week.values.has(time.getDay())
    const dateMatches = day.wildcard ? weekMatches : week.wildcard ? dayMatches : dayMatches || weekMatches
    if (month.values.has(time.getMonth() + 1) && dateMatches && hour.values.has(time.getHours()) && minute.values.has(time.getMinutes())) result.push(new Date(time))
    time.setMinutes(time.getMinutes() + 1)
  }
  if (!result.length) throw new Error('未来两年内没有匹配的执行时间')
  return result
}
