export interface ThemeColor {
  name: string
  value: string
}

// 预设主题色，按色相排列
export const THEME_COLORS: ThemeColor[] = [
  { name: '默认蓝', value: '#3478f6' },
  { name: '靛蓝紫', value: '#6366f1' },
  { name: '青色', value: '#14b8a6' },
  { name: '绿色', value: '#22c55e' },
  { name: '橙色', value: '#f97316' },
  { name: '红色', value: '#ef4444' },
  { name: '粉色', value: '#ec4899' },
  { name: '紫色', value: '#a855f7' },
]

const STORAGE_KEY = 'web-tools-color'
export const DEFAULT_COLOR = '#3478f6'

type RGB = [number, number, number]

function normalizeHex(input: string): string | null {
  const value = String(input || '').trim().replace(/^#/, '')
  if (/^[0-9a-fA-F]{3}$/.test(value)) {
    return `#${value.split('').map(char => char + char).join('').toLowerCase()}`
  }
  if (/^[0-9a-fA-F]{6}$/.test(value)) return `#${value.toLowerCase()}`
  return null
}

function hexToRgb(hex: string): RGB {
  const value = hex.slice(1)
  return [parseInt(value.slice(0, 2), 16), parseInt(value.slice(2, 4), 16), parseInt(value.slice(4, 6), 16)]
}

function toHex(rgb: RGB): string {
  return `#${rgb.map(channel => Math.max(0, Math.min(255, Math.round(channel))).toString(16).padStart(2, '0')).join('')}`
}

// weight 为第一个颜色的占比，与 Element Plus 的 SCSS mix 规则一致
function mix(from: RGB, to: RGB, weight: number): RGB {
  return [
    from[0] * weight + to[0] * (1 - weight),
    from[1] * weight + to[1] * (1 - weight),
    from[2] * weight + to[2] * (1 - weight),
  ]
}

export function readStoredColor(): string {
  try {
    return normalizeHex(localStorage.getItem(STORAGE_KEY) || '') || DEFAULT_COLOR
  } catch {
    return DEFAULT_COLOR
  }
}

export function isDarkTheme(): boolean {
  return document.documentElement.classList.contains('dark')
}

// 把主色及派生色写入 <html> 行内样式，覆盖 uno.css 中的静态变量，明暗两套共用同一份基础色
export function applyThemeColor(input: string, dark = isDarkTheme()): string {
  const base = normalizeHex(input) || DEFAULT_COLOR
  const rgb = hexToRgb(base)
  // 暗色下提亮主色，保证在深色背景上的对比度
  const primary = dark ? mix(rgb, [255, 255, 255], 0.72) : rgb
  const root = document.documentElement
  const set = (name: string, value: string) => root.style.setProperty(name, value)

  set('--el-color-primary', toHex(primary))
  const rounded = primary.map(channel => Math.round(channel))
  set('--el-color-primary-rgb', `${rounded[0]}, ${rounded[1]}, ${rounded[2]}`)

  for (let level = 1; level <= 9; level += 1) {
    set(`--el-color-primary-light-${level}`, toHex(mix(primary, [255, 255, 255], (10 - level) / 10)))
  }
  set('--el-color-primary-dark-2', toHex(dark ? mix(primary, [255, 255, 255], 0.85) : mix(primary, [0, 0, 0], 0.8)))

  try {
    localStorage.setItem(STORAGE_KEY, base)
  } catch {
    /* 存储不可用时仅跳过持久化 */
  }
  return base
}
