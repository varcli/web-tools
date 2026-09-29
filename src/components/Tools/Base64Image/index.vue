<script setup lang="ts">
import { computed, ref } from 'vue'
import type { UploadFile } from 'element-plus'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import { copy } from '@/utils/string'
import '../workbench.css'

interface EncodedImage { uid: number; name: string; dataUri: string }
const images = ref<EncodedImage[]>([])
const selected = ref<number>()
const base64Input = ref('')
const error = ref('')
const activeImage = computed(() => images.value.find(item => item.uid === selected.value))
const preview = computed(() => {
  const value = base64Input.value.trim()
  if (!value) return ''
  return value.startsWith('data:') ? value : `data:${detectMime(value)};base64,${value}`
})

function detectMime(encoded: string): string {
  const first = encoded.slice(0, 32)
  if (first.startsWith('iVBOR')) return 'image/png'
  if (first.startsWith('/9j/')) return 'image/jpeg'
  if (first.startsWith('R0lGOD')) return 'image/gif'
  if (first.startsWith('UklGR')) return 'image/webp'
  return 'image/png'
}

function addImage(file: UploadFile) {
  if (!file.raw || images.value.some(item => item.uid === file.uid)) return
  if (!file.raw.type.startsWith('image/')) { error.value = '请选择图片文件'; return }
  const reader = new FileReader()
  reader.onload = () => {
    if (typeof reader.result !== 'string') return
    images.value.push({ uid: file.uid, name: file.name, dataUri: reader.result })
    selected.value = file.uid
    error.value = ''
  }
  reader.onerror = () => { error.value = `无法读取 ${file.name}` }
  reader.readAsDataURL(file.raw)
}

function download() {
  error.value = ''
  const value = preview.value
  const match = /^data:(image\/(?:png|jpeg|gif|webp));base64,([\s\S]+)$/i.exec(value)
  if (!match) { error.value = '请输入 PNG、JPEG、GIF 或 WebP 图片的 Base64 数据'; return }
  try {
    const binary = atob(match[2].replace(/\s/g, ''))
    const bytes = Uint8Array.from(binary, char => char.charCodeAt(0))
    const url = URL.createObjectURL(new Blob([bytes], { type: match[1] }))
    const extension = match[1].split('/')[1].replace('jpeg', 'jpg')
    const link = document.createElement('a')
    link.href = url
    link.download = `image.${extension}`
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 0)
  } catch { error.value = 'Base64 内容无效' }
}
</script>

<template>
  <div class="tool-workbench">
    
    <section class="tool-workbench__panel">
      <el-tabs>
        <el-tab-pane label="图片转 Base64">
          <div class="tool-workbench__row"><el-upload multiple accept="image/*" :auto-upload="false" :show-file-list="false" :on-change="addImage"><el-button type="primary">选择图片</el-button></el-upload><span class="tool-workbench__hint">支持多张图片，点击名称切换结果</span></div>
          <div class="tool-workbench__row"><el-button v-for="image in images" :key="image.uid" :type="selected === image.uid ? 'primary' : 'default'" size="small" @click="selected = image.uid">{{ image.name }}</el-button></div>
          <div v-if="activeImage" class="tool-workbench__grid">
            <div class="image-preview"><img :src="activeImage.dataUri" :alt="activeImage.name" /></div>
            <div><div class="tool-workbench__row"><el-button @click="copy(activeImage.dataUri)">复制 Data URI</el-button></div><el-input :model-value="activeImage.dataUri" type="textarea" :rows="10" readonly /></div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="Base64 转图片">
          <el-input v-model="base64Input" type="textarea" :rows="8" placeholder="粘贴 data:image/...;base64,... 或纯 Base64 字符串" />
          <div class="tool-workbench__row" style="margin-top: 14px"><el-button type="primary" @click="download">下载图片</el-button><el-button @click="base64Input = ''; error = ''">清空</el-button></div>
          <div v-if="base64Input" class="image-preview"><img :src="preview" alt="Base64 图片预览" @error="error = '图片数据无法预览，请检查 Base64 内容'" /></div>
        </el-tab-pane>
      </el-tabs>
      <p v-if="error" class="tool-workbench__error" role="alert">{{ error }}</p>
    </section>
    <ToolDetail title="说明"><el-text>本地读取图片并生成 Base64 Data URI；也可将 PNG、JPEG、GIF、WebP 的 Base64 数据还原为图片文件。</el-text></ToolDetail>
  </div>
</template>

<style scoped>
.image-preview { display: grid; place-items: center; min-height: 210px; padding: 12px; border: 1px solid var(--app-border); border-radius: 10px; background: var(--app-surface-muted); }
.image-preview img { max-width: 100%; max-height: 300px; object-fit: contain; }
</style>
