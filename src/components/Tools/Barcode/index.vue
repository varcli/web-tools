<script setup lang="ts">
import { computed, ref } from 'vue'
import bwipjs from 'bwip-js/browser'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import { makeZip } from '@/utils/zip'
import '../workbench.css'

const format = ref('code128')
const input = ref('123456789012')
const height = ref(16)
const scale = ref(3)
const showText = ref(true)
const foreground = ref('#111827')
const background = ref('#ffffff')
const busy = ref(false)
const error = ref('')
const items = computed(() => input.value.split(/\r?\n/).map(value => value.trim()).filter(Boolean).slice(0, 100))
function options(value: string) { return { bcid: format.value, text: value, scale: scale.value, height: height.value, includetext: showText.value, padding: 12, barcolor: foreground.value.slice(1), backgroundcolor: background.value.slice(1) } }
const preview = computed(() => {
  try { return items.value.length ? { svg: bwipjs.toSVG(options(items.value[0])), error: '' } : { svg: '', error: '' } }
  catch (cause) { return { svg: '', error: cause instanceof Error ? cause.message : '编码失败' } }
})
function save(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a'); link.href = url; link.download = filename; link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
function downloadSvg() { if (preview.value.svg) save(new Blob([preview.value.svg], { type: 'image/svg+xml' }), 'barcode.svg') }
async function png(value: string) {
  const canvas = document.createElement('canvas')
  bwipjs.toCanvas(canvas, options(value))
  return new Promise<Blob>((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('PNG 生成失败'))))
}
async function downloadPng() {
  error.value = ''
  try { if (items.value[0]) save(await png(items.value[0]), 'barcode.png') }
  catch (cause) { error.value = cause instanceof Error ? cause.message : 'PNG 生成失败' }
}
async function downloadBatch() {
  busy.value = true; error.value = ''
  try {
    const files = await Promise.all(items.value.map(async (item, index) => ({ name: `barcode-${String(index + 1).padStart(3, '0')}.png`, content: await png(item) })))
    save(await makeZip(files), 'barcodes.zip')
  } catch (cause) { error.value = cause instanceof Error ? cause.message : '批量生成失败' }
  finally { busy.value = false }
}
</script>
<template>
  <div class="tool-workbench"><section class="tool-workbench__panel"><div class="tool-workbench__row"><el-select v-model="format" style="width: 170px"><el-option label="Code 128" value="code128" /><el-option label="Code 39" value="code39" /><el-option label="EAN-13" value="ean13" /><el-option label="EAN-8" value="ean8" /><el-option label="UPC-A" value="upca" /><el-option label="QR Code" value="qrcode" /><el-option label="Data Matrix" value="datamatrix" /><el-option label="PDF417" value="pdf417" /></el-select><el-button type="primary" :disabled="!preview.svg" @click="downloadPng">下载 PNG</el-button><el-button :disabled="!preview.svg" @click="downloadSvg">下载 SVG</el-button><el-button :loading="busy" :disabled="!items.length" @click="downloadBatch">批量 ZIP</el-button></div><div class="tool-workbench__grid"><div><label class="tool-workbench__label">编码内容（一行一个，最多 100 个）</label><el-input v-model="input" type="textarea" :rows="12" /><div class="tool-workbench__options" style="margin-top: 16px"><label>高度 <el-input-number v-model="height" :min="5" :max="80" /></label><label>缩放 <el-input-number v-model="scale" :min="1" :max="8" /></label><el-checkbox v-model="showText" label="显示文字" /><label>条码颜色 <el-color-picker v-model="foreground" /></label><label>背景色 <el-color-picker v-model="background" /></label></div></div><div><label class="tool-workbench__label">首个条码预览</label><div class="barcode-preview"><img v-if="preview.svg" :src="`data:image/svg+xml;charset=utf-8,${encodeURIComponent(preview.svg)}`" alt="条码预览" /><span v-else>请输入有效编码内容</span></div><p v-if="preview.error || error" class="tool-workbench__error" role="alert">{{ preview.error || error }}</p></div></div></section><ToolDetail title="说明"><el-text>支持常见一维码与二维码格式。EAN 和 UPC 编码需满足对应长度与校验规则，输入不合法时会显示原因。</el-text></ToolDetail></div>
</template>
<style scoped>.barcode-preview { min-height: 260px; display: grid; place-items: center; padding: 20px; border: 1px solid var(--app-border); border-radius: 10px; color: var(--app-text-muted); background: var(--app-surface-muted); overflow: auto; }.barcode-preview img { max-width: 100%; max-height: 250px; }</style>
