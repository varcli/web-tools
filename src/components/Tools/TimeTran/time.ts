export type DateUnit = 'years' | 'months' | 'weeks' | 'days' | 'hours' | 'minutes'

export const dateUnits: { value: DateUnit; label: string }[] = [
  { value: 'years', label: '年' },
  { value: 'months', label: '月' },
  { value: 'weeks', label: '周' },
  { value: 'days', label: '天' },
  { value: 'hours', label: '小时' },
  { value: 'minutes', label: '分钟' },
]

const pad = (value: number) => String(value).padStart(2, '0')

export function formatLocal(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

export function parseWallTime(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/.exec(value.trim())
  if (!match) return null
  const [, y, m, d, h, min, sec] = match
  const date = new Date(Number(y), Number(m) - 1, Number(d), Number(h), Number(min), Number(sec || 0))
  return formatLocal(date) === `${y}-${m}-${d} ${h}:${min}:${sec || '00'}` ? date : null
}

export function parseTimestamp(value: string, unit: 's' | 'ms'): Date | null {
  if (!/^-?\d+$/.test(value.trim())) return null
  const raw = Number(value.trim())
  if (!Number.isSafeInteger(raw)) return null
  const milliseconds = unit === 'ms' ? raw : raw * 1000
  const date = new Date(milliseconds)
  return Number.isFinite(date.getTime()) ? date : null
}

export function addCalendarDate(base: Date, amount: number, unit: DateUnit): Date {
  const date = new Date(base)
  if (unit === 'years' || unit === 'months') {
    const originalDay = date.getDate()
    date.setDate(1)
    if (unit === 'years') date.setFullYear(date.getFullYear() + amount)
    else date.setMonth(date.getMonth() + amount)
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
    date.setDate(Math.min(originalDay, lastDay))
  } else if (unit === 'weeks' || unit === 'days') {
    date.setDate(date.getDate() + amount * (unit === 'weeks' ? 7 : 1))
  } else if (unit === 'hours') date.setHours(date.getHours() + amount)
  else date.setMinutes(date.getMinutes() + amount)
  return date
}

export function dateDifference(first: Date, second: Date) {
  const start = first.getTime() <= second.getTime() ? first : second
  const end = first.getTime() <= second.getTime() ? second : first
  const milliseconds = end.getTime() - start.getTime()
  let months = (end.getFullYear() - start.getFullYear()) * 12 + end.getMonth() - start.getMonth()
  while (months > 0 && addCalendarDate(start, months, 'months').getTime() > end.getTime()) months--
  return {
    direction: Math.sign(second.getTime() - first.getTime()),
    years: Math.floor(months / 12), months,
    weeks: Math.floor(milliseconds / 604800000),
    days: Math.floor(milliseconds / 86400000),
    hours: Math.floor(milliseconds / 3600000),
    minutes: Math.floor(milliseconds / 60000),
    seconds: Math.floor(milliseconds / 1000),
    milliseconds,
  }
}

const zoneFormatterCache = new Map<string, Intl.DateTimeFormat>()
function zoneFormatter(zone: string): Intl.DateTimeFormat {
  let formatter = zoneFormatterCache.get(zone)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
    })
    zoneFormatterCache.set(zone, formatter)
  }
  return formatter
}

function zonedParts(instant: number, zone: string): number[] {
  const parts = zoneFormatter(zone).formatToParts(new Date(instant))
  const value = (type: string) => Number(parts.find(part => part.type === type)?.value)
  return [value('year'), value('month'), value('day'), value('hour'), value('minute'), value('second')]
}

export function formatInZone(instant: number, zone: string): string {
  const [year, month, day, hour, minute, second] = zonedParts(instant, zone)
  return `${year}-${pad(month)}-${pad(day)} ${pad(hour)}:${pad(minute)}:${pad(second)}`
}

export function wallTimeToInstant(value: string, zone: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/.exec(value.trim())
  if (!match) return null
  const numbers = match.slice(1).map(part => Number(part || 0))
  const [year, month, day, hour, minute, second] = numbers
  const utc = Date.UTC(year, month - 1, day, hour, minute, second)
  const check = new Date(utc)
  if (check.getUTCFullYear() !== year || check.getUTCMonth() + 1 !== month || check.getUTCDate() !== day || check.getUTCHours() !== hour || check.getUTCMinutes() !== minute || check.getUTCSeconds() !== second) return null
  const candidates = new Set<number>()
  for (const sample of [utc - 86400000, utc, utc + 86400000]) {
    const [y, m, d, h, min, sec] = zonedParts(sample, zone)
    const offset = Date.UTC(y, m - 1, d, h, min, sec) - sample
    candidates.add(utc - offset)
  }
  const matches = [...candidates].filter(instant => formatInZone(instant, zone) === `${year}-${pad(month)}-${pad(day)} ${pad(hour)}:${pad(minute)}:${pad(second)}`)
  return matches.length ? new Date(Math.min(...matches)) : null
}

export const timezones = [
  { label: 'UTC', value: 'UTC' },
  { label: '中国 · 上海', value: 'Asia/Shanghai' },
  { label: '日本 · 东京', value: 'Asia/Tokyo' },
  { label: '韩国 · 首尔', value: 'Asia/Seoul' },
  { label: '新加坡', value: 'Asia/Singapore' },
  { label: '印度 · 加尔各答', value: 'Asia/Kolkata' },
  { label: '阿联酋 · 迪拜', value: 'Asia/Dubai' },
  { label: '英国 · 伦敦', value: 'Europe/London' },
  { label: '法国 · 巴黎', value: 'Europe/Paris' },
  { label: '德国 · 柏林', value: 'Europe/Berlin' },
  { label: '俄罗斯 · 莫斯科', value: 'Europe/Moscow' },
  { label: '美国 · 纽约', value: 'America/New_York' },
  { label: '美国 · 芝加哥', value: 'America/Chicago' },
  { label: '美国 · 丹佛', value: 'America/Denver' },
  { label: '美国 · 洛杉矶', value: 'America/Los_Angeles' },
  { label: '加拿大 · 多伦多', value: 'America/Toronto' },
  { label: '巴西 · 圣保罗', value: 'America/Sao_Paulo' },
  { label: '澳大利亚 · 悉尼', value: 'Australia/Sydney' },
  { label: '新西兰 · 奥克兰', value: 'Pacific/Auckland' },
]
