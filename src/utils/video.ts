import { drawContain, type GifFrame } from './gif'

export async function openVideo(file: File): Promise<{ video: HTMLVideoElement; url: string }> {
  const url = URL.createObjectURL(file)
  const video = document.createElement('video')
  video.preload = 'auto'; video.muted = true; video.src = url
  try {
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => { cleanup(); reject(new Error('视频加载超时')) }, 15000)
      const cleanup = () => { clearTimeout(timer); video.onloadeddata = null; video.onerror = null }
      video.onloadeddata = () => { cleanup(); resolve() }
      video.onerror = () => { cleanup(); reject(new Error('浏览器无法解码该视频')) }
    })
    if (!Number.isFinite(video.duration) || video.duration <= 0) throw new Error('无法确定视频时长')
    return { video, url }
  } catch (cause) { URL.revokeObjectURL(url); throw cause }
}

export async function seekVideo(video: HTMLVideoElement, seconds: number): Promise<void> {
  const target = Math.max(0, Math.min(seconds, video.duration - 0.001))
  if (Math.abs(video.currentTime - target) < 0.005 && video.readyState >= 2) return
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => { cleanup(); reject(new Error('视频帧读取超时')) }, 10000)
    const cleanup = () => { clearTimeout(timer); video.removeEventListener('seeked', done); video.removeEventListener('error', fail) }
    const done = () => { cleanup(); resolve() }
    const fail = () => { cleanup(); reject(new Error('视频帧读取失败')) }
    video.addEventListener('seeked', done, { once: true })
    video.addEventListener('error', fail, { once: true })
    video.currentTime = target
  })
}

export async function captureFrames(video: HTMLVideoElement, start: number, end: number, fps: number, width: number, height: number, onProgress?: (value: number) => void): Promise<GifFrame[]> {
  if (start < 0 || end > video.duration + 0.001 || end <= start || fps < 1 || fps > 30) throw new Error('请检查截取时间和帧率')
  const count = Math.ceil((end - start) * fps)
  if (count > 180) throw new Error('帧数超过 180，请缩短片段或降低帧率')
  const result: GifFrame[] = []
  for (let index = 0; index < count; index++) {
    await seekVideo(video, start + index / fps)
    result.push({ canvas: drawContain(video, video.videoWidth, video.videoHeight, width, height), delay: 1000 / fps })
    onProgress?.((index + 1) / count)
  }
  return result
}

export async function canvasBlob(canvas: HTMLCanvasElement, type: string, quality = .9): Promise<Blob> {
  return new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('图片导出失败')), type, quality))
}
