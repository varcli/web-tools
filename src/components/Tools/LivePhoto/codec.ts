export async function packMotionPhoto(image: File, video: File): Promise<Blob> {
  const jpeg = new Uint8Array(await image.arrayBuffer())
  const mp4 = new Uint8Array(await video.arrayBuffer())
  if (jpeg.length < 4 || jpeg[0] !== 0xff || jpeg[1] !== 0xd8 || jpeg[jpeg.length - 2] !== 0xff || jpeg[jpeg.length - 1] !== 0xd9) throw new Error('请选择有效的 JPEG 图片')
  if (mp4.length < 12 || String.fromCharCode(...mp4.slice(4, 8)) !== 'ftyp') throw new Error('请选择有效的 MP4 视频')
  return new Blob([jpeg, mp4], { type: 'image/jpeg' })
}

export async function unpackMotionPhoto(file: File): Promise<{ image: Blob; video: Blob }> {
  const bytes = new Uint8Array(await file.arrayBuffer())
  if (bytes.length < 16 || bytes[0] !== 0xff || bytes[1] !== 0xd8) throw new Error('文件不是 JPEG 动态照片')
  for (let index = 6; index <= bytes.length - 4; index++) {
    if (bytes[index - 6] !== 0xff || bytes[index - 5] !== 0xd9) continue
    if (bytes[index] !== 0x66 || bytes[index + 1] !== 0x74 || bytes[index + 2] !== 0x79 || bytes[index + 3] !== 0x70) continue
    const start = index - 4
    const boxSize = new DataView(bytes.buffer, bytes.byteOffset + start, 4).getUint32(0, false)
    if (boxSize < 12 || start + boxSize > bytes.length) continue
    return { image: new Blob([bytes.slice(0, start)], { type: 'image/jpeg' }), video: new Blob([bytes.slice(start)], { type: 'video/mp4' }) }
  }
  throw new Error('未找到拼接的 MP4 视频；仅支持 JPEG + MP4 拼接格式')
}
