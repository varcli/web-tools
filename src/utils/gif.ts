import GIF from 'gif.js'
import { decompressFrames, parseGIF } from 'gifuct-js'

export type GifFrame = { canvas: HTMLCanvasElement; delay: number }
export function canvasOf(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = width; canvas.height = height
  return canvas
}
export function drawContain(source: CanvasImageSource, sourceWidth: number, sourceHeight: number, width: number, height: number, background = '#ffffff'): HTMLCanvasElement {
  const canvas = canvasOf(width, height)
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = background; ctx.fillRect(0, 0, width, height)
  const ratio = Math.min(width / sourceWidth, height / sourceHeight)
  const drawnWidth = sourceWidth * ratio; const drawnHeight = sourceHeight * ratio
  ctx.drawImage(source, (width - drawnWidth) / 2, (height - drawnHeight) / 2, drawnWidth, drawnHeight)
  return canvas
}
export function encodeGif(frames: GifFrame[], width: number, height: number, onProgress?: (value: number) => void): Promise<Blob> {
  if (!frames.length) return Promise.reject(new Error('请先添加画面'))
  if (width < 1 || height < 1 || width > 1200 || height > 1200) return Promise.reject(new Error('GIF 尺寸应在 1 到 1200 像素之间'))
  return new Promise((resolve, reject) => {
    try {
      const encoder = new GIF({ workers: 2, quality: 10, workerScript: '/vendor/gif.worker.js', width, height, repeat: 0 })
      frames.forEach(frame => encoder.addFrame(frame.canvas, { copy: true, delay: Math.max(20, Math.round(frame.delay)) }))
      encoder.on('progress', progress => onProgress?.(progress))
      encoder.on('finished', resolve)
      encoder.render()
    } catch (cause) { reject(cause) }
  })
}
export function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a'); link.href = url; link.download = filename; link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
export async function loadImage(file: File): Promise<{ image: HTMLImageElement; url: string }> {
  const url = URL.createObjectURL(file)
  const image = new Image(); image.src = url
  try { await image.decode(); return { image, url } }
  catch (cause) { URL.revokeObjectURL(url); throw cause }
}
export async function decodeGif(file: File, maxFrames = 180): Promise<GifFrame[]> {
  const parsed = parseGIF(await file.arrayBuffer())
  const width = parsed.lsd.width; const height = parsed.lsd.height
  if (width * height > 2_000_000) throw new Error('GIF 尺寸过大')
  const source = decompressFrames(parsed, true)
  if (source.length > maxFrames) throw new Error(`GIF 帧数超过 ${maxFrames}，请使用较短的文件`)
  const stage = canvasOf(width, height)
  const ctx = stage.getContext('2d')!
  const results: GifFrame[] = []
  let previous: typeof source[number] | null = null
  let savedBefore: ImageData | null = null
  for (const frame of source) {
    if (previous?.disposalType === 2) ctx.clearRect(previous.dims.left, previous.dims.top, previous.dims.width, previous.dims.height)
    if (previous?.disposalType === 3 && savedBefore) ctx.putImageData(savedBefore, 0, 0)
    savedBefore = frame.disposalType === 3 ? ctx.getImageData(0, 0, width, height) : null
    const patch = canvasOf(frame.dims.width, frame.dims.height)
    patch.getContext('2d')!.putImageData(new ImageData(new Uint8ClampedArray(frame.patch), frame.dims.width, frame.dims.height), 0, 0)
    ctx.drawImage(patch, frame.dims.left, frame.dims.top)
    const snapshot = canvasOf(width, height)
    snapshot.getContext('2d')!.drawImage(stage, 0, 0)
    results.push({ canvas: snapshot, delay: Math.max(20, frame.delay || 100) })
    previous = frame
  }
  return results
}
