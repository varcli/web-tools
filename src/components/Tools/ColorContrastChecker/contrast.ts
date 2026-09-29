export function rgb(hex: string): [number, number, number] {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex)
  if (!match) throw new Error('请输入 6 位 HEX 颜色值')
  const value = match[1]
  return [0, 2, 4].map(index => parseInt(value.slice(index, index + 2), 16)) as [number, number, number]
}

function luminance(hex: string): number {
  const channels = rgb(hex).map(channel => {
    const value = channel / 255
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  })
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722
}

export function contrastRatio(foreground: string, background: string): number {
  const first = luminance(foreground)
  const second = luminance(background)
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05)
}

export function suggestedForeground(foreground: string, background: string, minimum = 4.5): string {
  if (contrastRatio(foreground, background) >= minimum) return foreground
  const base = rgb(foreground)
  const candidates = [0, 255].map(target => {
    let low = 0
    let high = 1
    for (let step = 0; step < 24; step++) {
      const amount = (low + high) / 2
      const channels = base.map(channel => Math.round(channel + (target - channel) * amount))
      const hex = `#${channels.map(channel => channel.toString(16).padStart(2, '0')).join('')}`
      if (contrastRatio(hex, background) >= minimum) high = amount
      else low = amount
    }
    const channels = base.map(channel => Math.round(channel + (target - channel) * high))
    return { amount: high, hex: `#${channels.map(channel => channel.toString(16).padStart(2, '0')).join('')}` }
  }).filter(candidate => contrastRatio(candidate.hex, background) >= minimum)
  return candidates.sort((a, b) => a.amount - b.amount)[0]?.hex ?? foreground
}
