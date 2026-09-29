export function ipv4ToNumber(address: string): number {
  const parts = address.split('.')
  if (parts.length !== 4 || parts.some(part => !/^\d{1,3}$/.test(part) || Number(part) > 255)) throw new Error('请输入有效的 IPv4 地址')
  return parts.reduce((value, part) => ((value << 8) | Number(part)) >>> 0, 0)
}

export function numberToIpv4(value: number): string {
  return [24, 16, 8, 0].map(shift => (value >>> shift) & 255).join('.')
}

export function subnetInfo(cidr: string) {
  const parts = cidr.trim().split('/')
  if (parts.length !== 2 || !/^\d{1,2}$/.test(parts[1])) throw new Error('请按 192.168.1.0/24 格式输入')
  const ip = ipv4ToNumber(parts[0])
  const prefix = Number(parts[1])
  if (prefix < 0 || prefix > 32) throw new Error('前缀长度必须在 0 到 32 之间')
  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0
  const network = (ip & mask) >>> 0
  const broadcast = (network | (~mask >>> 0)) >>> 0
  const hostCount = prefix === 32 ? 1 : prefix === 31 ? 2 : 2 ** (32 - prefix) - 2
  return {
    prefix,
    ip: numberToIpv4(ip),
    mask: numberToIpv4(mask),
    wildcard: numberToIpv4(~mask >>> 0),
    network: numberToIpv4(network),
    broadcast: numberToIpv4(broadcast),
    first: numberToIpv4(prefix >= 31 ? network : network + 1),
    last: numberToIpv4(prefix >= 31 ? broadcast : broadcast - 1),
    addressCount: 2 ** (32 - prefix),
    hostCount,
    networkNumber: network,
    binary: [24, 16, 8, 0].map(shift => ((ip >>> shift) & 255).toString(2).padStart(8, '0')).join('.'),
  }
}

export function childSubnets(cidr: string, newPrefix: number, limit = 128): string[] {
  const info = subnetInfo(cidr)
  if (newPrefix <= info.prefix || newPrefix > 32) return []
  const step = 2 ** (32 - newPrefix)
  const count = Math.min(limit, 2 ** (newPrefix - info.prefix))
  return Array.from({ length: count }, (_, index) => `${numberToIpv4((info.networkNumber + index * step) >>> 0)}/${newPrefix}`)
}
