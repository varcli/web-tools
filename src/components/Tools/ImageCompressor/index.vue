<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import type { UploadFile } from 'element-plus'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import '../workbench.css'

interface ImageItem { uid: number; name: string; file: File; result?: Blob; url?: string; error?: string }
const items = ref<ImageItem[]>([])
const format = ref<'image/jpeg' | 'image/png' | 'image/webp'>('image/webp')
const quality = ref(80)
const maxWidth = ref(1920)
const maxHeight = ref(1920)
const busy = ref(false)

function add(file: UploadFile) {
  if (file.raw?.type.startsWith('image/') && !items.value.some(item => item.uid === file.uid)) items.value.push({ uid: file.uid, name: file.name, file: file.raw })
}
function clear() {
  items.value.forEach(item => { if (item.url) URL.revokeObjectURL(item.url) })
  items.value = []
}
onBeforeUnmount(clear)

async function compressOne(item: ImageItem) {
  const source = URL.createObjectURL(item.file)
  try {
    const image = new Image()
    image.src = source
    await image.decode()
    const scale = Math.min(1, maxWidth.value / image.naturalWidth, maxHeight.value / image.naturalHeight)
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
    const context = canvas.getContext('2d')
    if (!context) throw new Error('浏览器无法创建画布')
    if (format.value === 'image/jpeg') { context.fillStyle = '#ffffff'; context.fillRect(0, 0, canvas.width, canvas.height) }
    context.drawImage(image, 0, 0, canvas.width, canvas.height)
    const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error('图片编码失败')), format.value, quality.value / 100))
    if (item.url) URL.revokeObjectURL(item.url)
    item.result = blob
    item.url = URL.createObjectURL(blob)
    item.error = undefined
  } catch (cause) { item.error = cause instanceof Error ? cause.message : '处理失败' }
  finally { URL.revokeObjectURL(source) }
}
async function run() {
  busy.value = true
  try { for (const item of items.value) await compressOne(item) }
  finally { busy.value = false }
}
function download(uid: number) {
  const item = items.value.find(entry => entry.uid === uid)
  if (!item) return
  if (!item.url) return
  const extension = format.value.split('/')[1].replace('jpeg', 'jpg')
  const anchor = document.createElement('a')
  anchor.href = item.url
  anchor.download = `${item.name.replace(/\.[^.]+$/, '')}.${extension}`
  anchor.click()
}
const size = (bytes: number) => `${(bytes / 1024).toFixed(1)} KB`
</script>

<template>
  <div class="tool-workbench">
    
    <section class="tool-workbench__panel">
      <div class="tool-workbench__row">
        <el-upload multiple accept="image/*" :auto-upload="false" :show-file-list="false" :on-change="add"><el-button>添加图片</el-button></el-upload>
        <el-button @click="clear">清空</el-button>
        <el-button type="primary" :loading="busy" :disabled="!items.length" @click="run">开始处理</el-button>
      </div>
      <div class="tool-workbench__options">
        <label>输出格式 <el-select v-model="format" style="width: 105px"><el-option label="WebP" value="image/webp" /><el-option label="JPEG" value="image/jpeg" /><el-option label="PNG" value="image/png" /></el-select></label>
        <label>质量 {{ quality }}% <el-slider v-model="quality" :min="10" :max="100" style="width: 160px; display: inline-flex; vertical-align: middle" /></label>
        <label>最大宽度 <el-input-number v-model="maxWidth" :min="1" :max="8192" style="width: 110px" /></label>
        <label>最大高度 <el-input-number v-model="maxHeight" :min="1" :max="8192" style="width: 110px" /></label>
      </div>
      <p class="tool-workbench__hint">PNG 为无损格式，质量设置主要作用于 JPEG 和 WebP。</p>
      <el-table :data="items" empty-text="请选择图片" style="margin-top: 14px">
        <el-table-column prop="name" label="文件" min-width="180" />
        <el-table-column label="原大小" width="100"><template #default="scope">{{ size(scope.row.file.size) }}</template></el-table-column>
        <el-table-column label="处理后" width="120"><template #default="scope">{{ scope.row.result ? size(scope.row.result.size) : '—' }}</template></el-table-column>
        <el-table-column label="结果" min-width="120"><template #default="scope"><el-text v-if="scope.row.error" type="danger">{{ scope.row.error }}</el-text><span v-else-if="scope.row.result">{{ Math.round((1 - scope.row.result.size / scope.row.file.size) * 100) }}% 缩减</span></template></el-table-column>
        <el-table-column label="操作" width="90"><template #default="scope"><el-button link type="primary" :disabled="!scope.row.result" @click="download(scope.row.uid)">下载</el-button></template></el-table-column>
      </el-table>
    </section>
    <ToolDetail title="说明"><el-text>在浏览器中批量调整图片尺寸、质量和格式，支持 JPEG、PNG、WebP 输出。处理结果可逐张下载。</el-text></ToolDetail>
  </div>
</template>
