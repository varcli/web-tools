<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import type { UploadFile } from 'element-plus'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import { drawContain, encodeGif, loadImage, saveBlob } from '@/utils/gif'
import '../workbench.css'

type Entry = { file: File; image: HTMLImageElement; url: string }
const entries = ref<Entry[]>([])
const width = ref(480)
const height = ref(320)
const delay = ref(300)
const busy = ref(false)
const progress = ref(0)
const error = ref('')
const result = ref<Blob | null>(null)
const resultUrl = ref('')
async function add(file: UploadFile) {
  if (!file.raw) return
  if (entries.value.length >= 60) { error.value = '最多添加 60 张图片'; return }
  try { entries.value.push({ file: file.raw, ...await loadImage(file.raw) }); clearResult(); error.value = '' }
  catch { error.value = '图片无法读取' }
}
function clearResult() { result.value = null; if (resultUrl.value) URL.revokeObjectURL(resultUrl.value); resultUrl.value = '' }
function remove(index: number) { URL.revokeObjectURL(entries.value[index].url); entries.value.splice(index, 1); clearResult() }
function move(index: number, change: number) { const next = index + change; if (next < 0 || next >= entries.value.length) return; const [item] = entries.value.splice(index, 1); entries.value.splice(next, 0, item); clearResult() }
onBeforeUnmount(() => { entries.value.forEach(item => URL.revokeObjectURL(item.url)); if (resultUrl.value) URL.revokeObjectURL(resultUrl.value) })
async function generate() {
  busy.value = true; progress.value = 0; error.value = ''; clearResult()
  try {
    const frames = entries.value.map(item => ({ canvas: drawContain(item.image, item.image.naturalWidth, item.image.naturalHeight, width.value, height.value), delay: delay.value }))
    const blob = await encodeGif(frames, width.value, height.value, value => { progress.value = Math.round(value * 100) })
    result.value = blob; resultUrl.value = URL.createObjectURL(blob)
  } catch (cause) { error.value = cause instanceof Error ? cause.message : 'GIF 生成失败' }
  finally { busy.value = false }
}
</script>
<template>
  <div class="tool-workbench"><section class="tool-workbench__panel"><div class="tool-workbench__row"><el-upload accept="image/*" multiple :auto-upload="false" :show-file-list="false" :on-change="add"><el-button>添加图片</el-button></el-upload><el-button type="primary" :disabled="!entries.length" :loading="busy" @click="generate">生成 GIF</el-button><el-button :disabled="!result" @click="result && saveBlob(result, 'animation.gif')">下载 GIF</el-button><span v-if="busy">编码进度 {{ progress }}%</span></div><div class="tool-workbench__options"><label>宽度 <el-input-number v-model="width" :min="1" :max="1200" /></label><label>高度 <el-input-number v-model="height" :min="1" :max="1200" /></label><label>每帧间隔（毫秒）<el-input-number v-model="delay" :min="20" :max="10000" :step="50" /></label></div><div v-if="entries.length" class="frames"><div v-for="(item, index) in entries" :key="item.url" class="frame"><img :src="item.url" :alt="item.file.name" /><small>{{ index + 1 }}. {{ item.file.name }}</small><div><el-button size="small" :disabled="index === 0" @click="move(index, -1)">前移</el-button><el-button size="small" :disabled="index === entries.length - 1" @click="move(index, 1)">后移</el-button><el-button size="small" type="danger" plain @click="remove(index)">删除</el-button></div></div></div><div v-if="resultUrl" class="preview"><img :src="resultUrl" alt="生成的 GIF" /><small>{{ (result!.size / 1024).toFixed(1) }} KB</small></div><p v-if="error" class="tool-workbench__error" role="alert">{{ error }}</p></section><ToolDetail title="说明"><el-text>按图片顺序生成循环 GIF，可调整画面尺寸与帧间隔。图片在浏览器本地处理，最多 60 帧。</el-text></ToolDetail></div>
</template>
<style scoped>.frames { display: flex; gap: 12px; overflow-x: auto; padding-bottom: 12px; }.frame { flex: 0 0 150px; display: flex; flex-direction: column; gap: 8px; padding: 8px; border: 1px solid var(--app-border); border-radius: 10px; background: var(--app-surface-muted); }.frame img { width: 100%; height: 100px; object-fit: contain; }.frame small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--app-text-muted); }.frame div { display: flex; flex-wrap: wrap; gap: 4px; }.frame :deep(.el-button+.el-button) { margin-left: 0; }.preview { display: flex; flex-direction: column; align-items: start; gap: 8px; margin-top: 18px; color: var(--app-text-muted); }.preview img { max-width: 100%; max-height: 400px; border: 1px solid var(--app-border); border-radius: 8px; }</style>
