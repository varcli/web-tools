<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import type { UploadFile } from 'element-plus'
import ImageTracer from 'imagetracerjs'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import { copy } from '@/utils/string'
import '../workbench.css'

const imageUrl = ref('')
const svg = ref('')
const busy = ref(false)
const error = ref('')
const colors = ref(16)
const blur = ref(0)
const omit = ref(8)
const maxSize = ref(800)
let image: HTMLImageElement | null = null
async function load(file: UploadFile) {
  if (!file.raw) return
  error.value = ''; svg.value = ''
  const url = URL.createObjectURL(file.raw)
  const next = new Image(); next.src = url
  try {
    await next.decode()
    if (imageUrl.value) URL.revokeObjectURL(imageUrl.value)
    image = next; imageUrl.value = url
  } catch { URL.revokeObjectURL(url); error.value = '图片无法读取' }
}
onBeforeUnmount(() => { if (imageUrl.value) URL.revokeObjectURL(imageUrl.value) })
async function convert() {
  if (!image) return
  busy.value = true; error.value = ''; svg.value = ''
  await new Promise(resolve => setTimeout(resolve, 20))
  try {
    const ratio = Math.min(1, maxSize.value / Math.max(image.naturalWidth, image.naturalHeight))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(image.naturalWidth * ratio))
    canvas.height = Math.max(1, Math.round(image.naturalHeight * ratio))
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('浏览器不支持 Canvas')
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
    svg.value = ImageTracer.imagedataToSVG(ctx.getImageData(0, 0, canvas.width, canvas.height), { numberofcolors: colors.value, blurradius: blur.value, pathomit: omit.value, scale: 1 })
  } catch (cause) { error.value = cause instanceof Error ? cause.message : '矢量化失败' }
  finally { busy.value = false }
}
function download() {
  if (!svg.value) return
  const url = URL.createObjectURL(new Blob([svg.value], { type: 'image/svg+xml' }))
  const link = document.createElement('a'); link.href = url; link.download = 'vector.svg'; link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
</script>
<template>
  <div class="tool-workbench"><section class="tool-workbench__panel"><div class="tool-workbench__row"><el-upload accept="image/*" :auto-upload="false" :show-file-list="false" :on-change="load"><el-button>选择图片</el-button></el-upload><el-button type="primary" :loading="busy" :disabled="!imageUrl" @click="convert">转换为 SVG</el-button><el-button :disabled="!svg" @click="download">下载 SVG</el-button><el-button :disabled="!svg" @click="copy(svg)">复制 SVG</el-button></div><div class="tool-workbench__options"><label>颜色数量 <el-input-number v-model="colors" :min="2" :max="64" /></label><label>模糊半径 <el-input-number v-model="blur" :min="0" :max="10" /></label><label>忽略小路径 <el-input-number v-model="omit" :min="0" :max="32" /></label><label>最长边 <el-input-number v-model="maxSize" :min="100" :max="1600" :step="100" /></label></div><div class="tool-workbench__grid"><div><label class="tool-workbench__label">原图</label><div class="preview"><img v-if="imageUrl" :src="imageUrl" alt="上传的原图" /></div></div><div><label class="tool-workbench__label">SVG 结果</label><div class="preview"><img v-if="svg" :src="`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`" alt="矢量化结果" /></div></div></div><p v-if="error" class="tool-workbench__error" role="alert">{{ error }}</p></section><ToolDetail title="说明"><el-text>将位图颜色区域描摹为 SVG 路径。颜色越多、分辨率越高，细节和文件体积通常越大。</el-text></ToolDetail></div>
</template>
<style scoped>.preview { min-height: 280px; display: grid; place-items: center; border: 1px solid var(--app-border); border-radius: 10px; background: var(--app-surface-muted); overflow: auto; }.preview img { max-width: 100%; max-height: 400px; }.tool-workbench__options label { display: flex; align-items: center; gap: 6px; }</style>
