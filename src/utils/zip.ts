interface ZipEntry { name: string; content: Blob }

const encode = new TextEncoder()
const table = Array.from({ length: 256 }, (_, index) => {
  let value = index
  for (let bit = 0; bit < 8; bit++) value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1
  return value >>> 0
})

function crc32(bytes: Uint8Array): number {
  let value = 0xffffffff
  for (const byte of bytes) value = table[(value ^ byte) & 0xff] ^ (value >>> 8)
  return (value ^ 0xffffffff) >>> 0
}

export async function makeZip(entries: ZipEntry[]): Promise<Blob> {
  const output: BlobPart[] = []
  const central: BlobPart[] = []
  let offset = 0
  const now = new Date()
  const date = ((Math.max(1980, now.getFullYear()) - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate()
  const time = (now.getHours() << 11) | (now.getMinutes() << 5) | Math.floor(now.getSeconds() / 2)
  for (const entry of entries) {
    const name = encode.encode(entry.name)
    const data = new Uint8Array(await entry.content.arrayBuffer())
    if (data.length > 0xffffffff || offset > 0xffffffff) throw new Error('ZIP 文件超过 4 GB 限制')
    const checksum = crc32(data)
    const local = new Uint8Array(30 + name.length)
    const view = new DataView(local.buffer)
    view.setUint32(0, 0x04034b50, true)
    view.setUint16(4, 20, true)
    view.setUint16(6, 0x0800, true)
    view.setUint16(10, time, true)
    view.setUint16(12, date, true)
    view.setUint32(14, checksum, true)
    view.setUint32(18, data.length, true)
    view.setUint32(22, data.length, true)
    view.setUint16(26, name.length, true)
    local.set(name, 30)
    output.push(local, data)

    const record = new Uint8Array(46 + name.length)
    const directory = new DataView(record.buffer)
    directory.setUint32(0, 0x02014b50, true)
    directory.setUint16(4, 20, true)
    directory.setUint16(6, 20, true)
    directory.setUint16(8, 0x0800, true)
    directory.setUint16(12, time, true)
    directory.setUint16(14, date, true)
    directory.setUint32(16, checksum, true)
    directory.setUint32(20, data.length, true)
    directory.setUint32(24, data.length, true)
    directory.setUint16(28, name.length, true)
    directory.setUint32(42, offset, true)
    record.set(name, 46)
    central.push(record)
    offset += local.length + data.length
  }
  const centralSize = central.reduce((sum, item) => sum + (item as Uint8Array).length, 0)
  const ending = new Uint8Array(22)
  const view = new DataView(ending.buffer)
  view.setUint32(0, 0x06054b50, true)
  view.setUint16(8, entries.length, true)
  view.setUint16(10, entries.length, true)
  view.setUint32(12, centralSize, true)
  view.setUint32(16, offset, true)
  return new Blob([...output, ...central, ending], { type: 'application/zip' })
}
