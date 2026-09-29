export type Algorithm = 'SHA-1' | 'SHA-256' | 'SHA-512'
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

export function decodeBase32(input: string): Uint8Array<ArrayBuffer> {
  const clean = input.toUpperCase().replace(/[\s=-]/g, '')
  if (!clean) throw new Error('请输入 Base32 密钥')
  let buffer = 0
  let bits = 0
  const bytes: number[] = []
  for (const character of clean) {
    const value = alphabet.indexOf(character)
    if (value < 0) throw new Error('Base32 密钥仅允许 A-Z 和 2-7')
    buffer = (buffer << 5) | value
    bits += 5
    if (bits >= 8) { bits -= 8; bytes.push((buffer >>> bits) & 255) }
  }
  return new Uint8Array(bytes)
}

export function parseSecret(input: string): { secret: string; label: string; algorithm: Algorithm; digits: 6 | 8; period: number } {
  const value = input.trim()
  if (!value.toLowerCase().startsWith('otpauth://')) return { secret: value, label: '', algorithm: 'SHA-1', digits: 6, period: 30 }
  const url = new URL(value)
  if (url.hostname.toLowerCase() !== 'totp') throw new Error('仅支持 otpauth://totp 链接')
  const algorithmName = url.searchParams.get('algorithm')?.toUpperCase().replace('-', '')
  const algorithm = algorithmName === 'SHA256' ? 'SHA-256' : algorithmName === 'SHA512' ? 'SHA-512' : 'SHA-1'
  const digits = Number(url.searchParams.get('digits')) === 8 ? 8 : 6
  const configuredPeriod = Number(url.searchParams.get('period'))
  const period = Number.isInteger(configuredPeriod) && configuredPeriod >= 1 && configuredPeriod <= 300 ? configuredPeriod : 30
  const label = decodeURIComponent(url.pathname.replace(/^\/+/, ''))
  return { secret: url.searchParams.get('secret') ?? '', label, algorithm, digits, period }
}

export async function generateTotp(secret: string, timestampSeconds: number, algorithm: Algorithm = 'SHA-1', digits: 6 | 8 = 6, period = 30): Promise<string> {
  if (!Number.isFinite(timestampSeconds) || !Number.isInteger(period) || period < 1) throw new Error('时间或周期无效')
  const bytes = decodeBase32(secret)
  const key = await crypto.subtle.importKey('raw', bytes, { name: 'HMAC', hash: algorithm }, false, ['sign'])
  const counter = Math.floor(timestampSeconds / period)
  const message = new ArrayBuffer(8)
  const view = new DataView(message)
  view.setUint32(0, Math.floor(counter / 2 ** 32))
  view.setUint32(4, counter >>> 0)
  const hash = new Uint8Array(await crypto.subtle.sign('HMAC', key, message))
  const offset = hash[hash.length - 1] & 15
  const value = ((hash[offset] & 127) << 24) | (hash[offset + 1] << 16) | (hash[offset + 2] << 8) | hash[offset + 3]
  return ((value >>> 0) % 10 ** digits).toString().padStart(digits, '0')
}
