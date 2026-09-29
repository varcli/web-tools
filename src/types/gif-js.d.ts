declare module 'gif.js' {
  export default class GIF {
    constructor(options: { workers: number; quality: number; workerScript: string; width: number; height: number; repeat?: number })
    addFrame(canvas: HTMLCanvasElement, options: { copy: boolean; delay: number }): void
    on(event: 'finished', callback: (blob: Blob) => void): void
    on(event: 'progress', callback: (progress: number) => void): void
    render(): void
  }
}
