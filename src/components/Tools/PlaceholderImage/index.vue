<script setup lang="ts">
import { computed, ref } from 'vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import { copy } from '@/utils/string'
import '../workbench.css'

const width = ref(800)
const height = ref(450)
const background = ref('#e9f0fb')
const foreground = ref('#3478f6')
const label = ref('')
const text = computed(() => label.value || `${width.value} × ${height.value}`)
const svg = computed(() => {
  const safe = text.value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  const fontSize = Math.max(12, Math.min(width.value / 10, height.value / 5, 72))
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width.value}" height="${height.value}" viewBox="0 0 ${width.value} ${height.value}"><rect width="100%" height="100%" fill="${background.value}"/><text x="50%" y="50%" fill="${foreground.value}" font-family="Arial,sans-serif" font-size="${fontSize}" text-anchor="middle" dominant-baseline="middle">${safe}</text></svg>`
})
const dataUri = computed(() => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.value)}`)

function downloadSvg() {
  const url = URL.createObjectURL(new Blob([svg.value], { type: 'image/svg+xml' }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `placeholder-${width.value}x${height.value}.svg`
  anchor.click()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}

function downloadPng() {
  const image = new Image()
  image.onload = () => {
    const canvas = document.createElement('canvas')
    canvas.width = width.value
    canvas.height = height.value
    canvas.getContext('2d')?.drawImage(image, 0, 0)
    canvas.toBlob(blob => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `placeholder-${width.value}x${height.value}.png`
      anchor.click()
      setTimeout(() => URL.revokeObjectURL(url), 0)
    }, 'image/png')
  }
  image.src = dataUri.value
}
</script>

<template>
  <div class="tool-workbench">
    
    <section class="tool-workbench__panel">
      <div class="tool-workbench__options">
        <label>宽度 <el-input-number v-model="width" :min="1" :max="4096" style="width: 120px" /></label>
        <label>高度 <el-input-number v-model="height" :min="1" :max="4096" style="width: 120px" /></label>
        <label>背景 <el-color-picker v-model="background" /></label>
        <label>文字 <el-color-picker v-model="foreground" /></label>
        <label>内容 <el-input v-model="label" placeholder="默认显示尺寸" style="width: 180px" /></label>
      </div>
      <div class="image-preview"><img :src="dataUri" :alt="text" /></div>
      <div class="tool-workbench__row" style="margin-top: 18px">
        <el-button type="primary" @click="downloadPng">下载 PNG</el-button>
        <el-button @click="downloadSvg">下载 SVG</el-button>
        <el-button @click="copy(dataUri)">复制 Data URI</el-button>
      </div>
    </section>
    <ToolDetail title="说明"><el-text>自定义尺寸、背景色、文字色和内容，实时预览并导出 PNG、SVG 或复制 Data URI。</el-text></ToolDetail>
  </div>
</template>

<style scoped>
.image-preview { display: grid; place-items: center; min-height: 280px; padding: 20px; border: 1px solid var(--app-border); border-radius: 12px; background: var(--app-surface-muted); }
.image-preview img { max-width: 100%; max-height: 440px; object-fit: contain; box-shadow: 0 8px 24px rgba(0,0,0,.12); }
</style>
