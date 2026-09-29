import { Mp3Encoder } from '@breezystack/lamejs'

export async function renderAudio(source: AudioBuffer, start: number, end: number, gain: number): Promise<AudioBuffer> {
  if (start < 0 || end <= start || end > source.duration + .001) throw new Error('请检查裁剪时间')
  const sampleRate = 44100
  const channels = Math.min(source.numberOfChannels, 2)
  const context = new OfflineAudioContext(channels, Math.ceil((end - start) * sampleRate), sampleRate)
  const node = context.createBufferSource(); node.buffer = source
  const volume = context.createGain(); volume.gain.value = gain
  node.connect(volume).connect(context.destination)
  node.start(0, start, end - start)
  return context.startRendering()
}

export function encodeWav(source: AudioBuffer): Blob {
  const channels = Math.min(source.numberOfChannels, 2)
  const samples = source.length
  const buffer = new ArrayBuffer(44 + samples * channels * 2)
  const view = new DataView(buffer)
  const label = (offset: number, value: string) => { for (let index = 0; index < value.length; index++) view.setUint8(offset + index, value.charCodeAt(index)) }
  label(0, 'RIFF'); view.setUint32(4, buffer.byteLength - 8, true); label(8, 'WAVE'); label(12, 'fmt ')
  view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, channels, true)
  view.setUint32(24, source.sampleRate, true); view.setUint32(28, source.sampleRate * channels * 2, true)
  view.setUint16(32, channels * 2, true); view.setUint16(34, 16, true); label(36, 'data'); view.setUint32(40, samples * channels * 2, true)
  let offset = 44
  for (let index = 0; index < samples; index++) {
    for (let channel = 0; channel < channels; channel++) {
      const value = Math.max(-1, Math.min(1, source.getChannelData(channel)[index]))
      view.setInt16(offset, value < 0 ? Math.round(value * 32768) : Math.round(value * 32767), true)
      offset += 2
    }
  }
  return new Blob([buffer], { type: 'audio/wav' })
}

export function encodeMp3(source: AudioBuffer, kbps: number): Blob {
  const channels = Math.min(source.numberOfChannels, 2)
  const encoder = new Mp3Encoder(channels, source.sampleRate, kbps)
  const toPcm = (channel: number) => Int16Array.from(source.getChannelData(channel), value => {
    const sample = Math.max(-1, Math.min(1, value))
    return sample < 0 ? Math.round(sample * 32768) : Math.round(sample * 32767)
  })
  const left = toPcm(0)
  const right = channels > 1 ? toPcm(1) : null
  const chunks: BlobPart[] = []
  for (let offset = 0; offset < left.length; offset += 1152) {
    const encoded = right ? encoder.encodeBuffer(left.subarray(offset, offset + 1152), right.subarray(offset, offset + 1152)) : encoder.encodeBuffer(left.subarray(offset, offset + 1152))
    if (encoded.length) chunks.push(new Uint8Array(encoded))
  }
  const tail = encoder.flush()
  if (tail.length) chunks.push(new Uint8Array(tail))
  return new Blob(chunks, { type: 'audio/mpeg' })
}

export function analyzeAudio(source: AudioBuffer) {
  let peak = 0; let sum = 0; let count = 0
  const step = Math.max(1, Math.floor(source.length / 200000))
  for (let channel = 0; channel < source.numberOfChannels; channel++) {
    const data = source.getChannelData(channel)
    for (let index = 0; index < data.length; index += step) {
      const sample = data[index]
      peak = Math.max(peak, Math.abs(sample)); sum += sample * sample; count++
    }
  }
  return { peakDb: peak ? 20 * Math.log10(peak) : -Infinity, rmsDb: count && sum ? 20 * Math.log10(Math.sqrt(sum / count)) : -Infinity }
}
