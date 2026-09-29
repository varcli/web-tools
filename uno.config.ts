import { defineConfig, presetWind3 } from 'unocss'
// 支持 vue <style> 中的 @apply 指令
import transformerDirectives from '@unocss/transformer-directives'
// 支持按需变体（group-hover 等，可选增强）
import transformerVariantGroup from '@unocss/transformer-variant-group'

export default defineConfig({
  content: {
    pipeline: {
      include: [
        /\.(vue|js|ts|jsx|tsx|html)($|\?)/,
      ],
    },
  },
  presets: [
    presetWind3({
      dark: 'class',
    }),
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
  theme: {
    // 对应原 tailwind.config.js 的自定义响应式尺寸
    breakpoints: {
      'c-xs': '768px',
      'c-sm': '768px',
      'c-md': '992px',
      'c-lg': '1200px',
    },
    animation: {
      fold: 'fold 1s infinite',
    },
    keyframes: {
      fold: {
        '0%, 100%': { opacity: 0 },
        '50%': { opacity: 1 },
      },
    },
  },
})
