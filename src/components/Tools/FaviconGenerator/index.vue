<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import type { UploadFile } from 'element-plus'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import { makeZip } from '@/utils/zip'
import '../workbench.css'

const sizes = [16, 32, 48, 64, 128, 256]
const sourceUrl = ref('')
const previewUrl = ref('')
const zoom = ref(1)
const horizontal = ref(0)
const vertical = ref(0)
const busy = ref(false)
const error = ref('')
let image: HTMLImageElement | null = null

async function load(file: UploadFile) {
  if (!file.raw) return
  error.value = ''
  if (sourceUrl.value) URL.revokeObjectURL(sourceUrl.value)
  const url = URL.createObjectURL(file.raw)
  const loaded = new Image()
  loaded.src = url
  try { await loaded.decode(); image = loaded; sourceUrl.value = url }
  catch { URL.revokeObjectURL(url); error.value = '无法读取图片' }
}
onBeforeUnmount(() => { if (sourceUrl.value) URL.revokeObjectURL(sourceUrl.value); if (previewUrl.value) URL.revokeObjectURL(previewUrl.value) })

async function png(size: number): Promise<Blob> {
  if (!image) throw new Error('请先上传图片')
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const base = Math.min(image.naturalWidth, image.naturalHeight)
  const crop = base / zoom.value
  const availableX = Math.max(0, image.naturalWidth - crop)
  const availableY = Math.max(0, image.naturalHeight - crop)
  const x = availableX * (horizontal.value + 100) / 200
  const y = availableY * (vertical.value + 100) / 200
  canvas.getContext('2d')?.drawImage(image, x, y, crop, crop, 0, 0, size, size)
  return new Promise((resolve, reject) => canvas.toBlob(result => result ? resolve(result) : reject(new Error('PNG 生成失败')), 'image/png'))
}

let previewVersion = 0
watch([sourceUrl, zoom, horizontal, vertical], async () => {
  const version = ++previewVersion
  if (!image) return
  try {
    const url = URL.createObjectURL(await png(256))
    if (version !== previewVersion) { URL.revokeObjectURL(url); return }
    if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = url
  } catch (cause) { error.value = cause instanceof Error ? cause.message : '预览生成失败' }
})

function save(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}

async function downloadPng(size: number) {
  try { save(await png(size), `favicon-${size}.png`) }
  catch (cause) { error.value = cause instanceof Error ? cause.message : '下载失败' }
}

async function downloadZip() {
  busy.value = true
  error.value = ''
  try { save(await makeZip(await Promise.all(sizes.map(async size => ({ name: `favicon-${size}.png`, content: await png(size) })))), 'favicons.zip') }
  catch (cause) { error.value = cause instanceof Error ? cause.message : '打包失败' }
  finally { busy.value = false }
}

async function downloadIco() {
  busy.value = true
  error.value = ''
  try {
    const icons = await Promise.all(sizes.map(async size => new Uint8Array(await (await png(size)).arrayBuffer())))
    const header = new Uint8Array(6 + sizes.length * 16)
    const view = new DataView(header.buffer)
    view.setUint16(2, 1, true)
    view.setUint16(4, sizes.length, true)
    let offset = header.length
    icons.forEach((bytes, index) => {
      const position = 6 + index * 16
      header[position] = sizes[index] === 256 ? 0 : sizes[index]
      header[position + 1] = sizes[index] === 256 ? 0 : sizes[index]
      view.setUint16(position + 4, 1, true)
      view.setUint16(position + 6, 32, true)
      view.setUint32(position + 8, bytes.length, true)
      view.setUint32(position + 12, offset, true)
      offset += bytes.length
    })
    save(new Blob([header, ...icons], { type: 'image/x-icon' }), 'favicon.ico')
  } catch (cause) { error.value = cause instanceof Error ? cause.message : 'ICO 生成失败' }
  finally { busy.value = false }
}
</script>

<template>
  <div class="tool-workbench">
    
    <section class="tool-workbench__panel">
      <div class="tool-workbench__row"><el-upload accept="image/*" :auto-upload="false" :show-file-list="false" :on-change="load"><el-button type="primary">选择图片</el-button></el-upload><span class="tool-workbench__hint">将图片裁成正方形，再输出多种尺寸</span></div>
      <div v-if="sourceUrl" class="tool-workbench__grid">
        <div class="preview"><img v-if="previewUrl" :src="previewUrl" alt="图标裁剪预览" /></div>
        <div class="controls"><label>缩放 {{ zoom.toFixed(1) }} × <el-slider v-model="zoom" :min="1" :max="4" :step="0.1" /></label><label>水平位置 <el-slider v-model="horizontal" :min="-100" :max="100" /></label><label>垂直位置 <el-slider v-model="vertical" :min="-100" :max="100" /></label></div>
      </div>
      <div class="tool-workbench__row" style="margin-top: 18px"><el-button type="primary" :loading="busy" :disabled="!sourceUrl" @click="downloadIco">下载 ICO</el-button><el-button :disabled="!sourceUrl" @click="downloadZip">下载全部 PNG</el-button><el-button v-for="size in sizes" :key="size" size="small" :disabled="!sourceUrl" @click="downloadPng(size)">{{ size }} × {{ size }}</el-button></div>
      <p v-if="error" class="tool-workbench__error" role="alert">{{ error }}</p>
    </section>
    <ToolDetail title="说明"><el-text>将上传的图片裁成正方形，导出多尺寸 PNG 或包含多尺寸图标的 ICO 文件。</el-text></ToolDetail>
  </div>
</template>

<style scoped>
.preview { display: grid; place-items: center; min-height: 260px; border: 1px solid var(--app-border); border-radius: 10px; background: var(--app-surface-muted); }.preview img { max-width: 100%; max-height: 320px; object-fit: contain; }.controls { display: flex; flex-direction: column; gap: 16px; color: var(--app-text); }
</style>
