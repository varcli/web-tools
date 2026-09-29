<script setup lang="ts">
import { computed, onBeforeUnmount, ref, shallowRef } from 'vue'
import type { UploadFile } from 'element-plus'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import { decodeGif, drawContain, encodeGif, saveBlob, type GifFrame } from '@/utils/gif'
import '../workbench.css'

const frames = shallowRef<GifFrame[]>([])
const sourceUrl = ref('')
const resultUrl = ref('')
const result = ref<Blob | null>(null)
const busy = ref(false)
const progress = ref(0)
const error = ref('')
const start = ref(1)
const end = ref(1)
const speed = ref(1)
const reversed = ref(false)
const width = ref(480)
const height = ref(320)
const selected = computed(() => {
  const subset = frames.value.slice(Math.max(0, start.value - 1), Math.min(frames.value.length, end.value))
  return reversed.value ? subset.reverse() : subset
})
async function load(file: UploadFile) {
  if (!file.raw) return
  error.value = ''; clearResult()
  try {
    const decoded = await decodeGif(file.raw)
    if (!decoded.length) throw new Error('GIF 没有可编辑的画面')
    if (sourceUrl.value) URL.revokeObjectURL(sourceUrl.value)
    sourceUrl.value = URL.createObjectURL(file.raw)
    frames.value = decoded
    start.value = 1; end.value = decoded.length
    width.value = decoded[0].canvas.width; height.value = decoded[0].canvas.height
  } catch (cause) { error.value = cause instanceof Error ? cause.message : 'GIF 无法读取' }
}
function clearResult() { result.value = null; if (resultUrl.value) URL.revokeObjectURL(resultUrl.value); resultUrl.value = '' }
onBeforeUnmount(() => { if (sourceUrl.value) URL.revokeObjectURL(sourceUrl.value); if (resultUrl.value) URL.revokeObjectURL(resultUrl.value) })
async function generate() {
  busy.value = true; progress.value = 0; error.value = ''; clearResult()
  try {
    if (!selected.value.length) throw new Error('请至少保留一帧')
    const resized = selected.value.map(frame => ({ canvas: drawContain(frame.canvas, frame.canvas.width, frame.canvas.height, width.value, height.value), delay: Math.max(20, frame.delay / speed.value) }))
    const blob = await encodeGif(resized, width.value, height.value, value => { progress.value = Math.round(value * 100) })
    result.value = blob; resultUrl.value = URL.createObjectURL(blob)
  } catch (cause) { error.value = cause instanceof Error ? cause.message : 'GIF 导出失败' }
  finally { busy.value = false }
}
</script>
<template>
  <div class="tool-workbench"><section class="tool-workbench__panel"><div class="tool-workbench__row"><el-upload accept="image/gif,.gif" :auto-upload="false" :show-file-list="false" :on-change="load"><el-button>选择 GIF</el-button></el-upload><el-button type="primary" :disabled="!frames.length" :loading="busy" @click="generate">重新生成</el-button><el-button :disabled="!result" @click="result && saveBlob(result, 'edited.gif')">下载 GIF</el-button><span v-if="busy">编码进度 {{ progress }}%</span></div><div class="tool-workbench__options"><label>起始帧 <el-input-number v-model="start" :min="1" :max="frames.length || 1" /></label><label>结束帧 <el-input-number v-model="end" :min="1" :max="frames.length || 1" /></label><label>播放速度 <el-input-number v-model="speed" :min="0.25" :max="4" :step="0.25" :precision="2" /></label><el-checkbox v-model="reversed" label="反向播放" /><label>宽度 <el-input-number v-model="width" :min="1" :max="1200" /></label><label>高度 <el-input-number v-model="height" :min="1" :max="1200" /></label></div><p v-if="frames.length" class="tool-workbench__hint">共 {{ frames.length }} 帧，当前选择 {{ selected.length }} 帧；原始尺寸 {{ frames[0].canvas.width }} × {{ frames[0].canvas.height }}</p><div class="tool-workbench__grid"><div><label class="tool-workbench__label">原始 GIF</label><div class="preview"><img v-if="sourceUrl" :src="sourceUrl" alt="原始 GIF" /></div></div><div><label class="tool-workbench__label">导出预览</label><div class="preview"><img v-if="resultUrl" :src="resultUrl" alt="编辑后的 GIF" /></div></div></div><p v-if="error" class="tool-workbench__error" role="alert">{{ error }}</p></section><ToolDetail title="说明"><el-text>裁剪 GIF 帧范围、调整播放速度、反向播放和尺寸，再导出为新的循环 GIF。最多处理 180 帧。</el-text></ToolDetail></div>
</template>
<style scoped>.preview { min-height: 280px; display: grid; place-items: center; border: 1px solid var(--app-border); border-radius: 10px; background: var(--app-surface-muted); }.preview img { max-width: 100%; max-height: 420px; }.tool-workbench__options label { display: flex; align-items: center; gap: 6px; }</style>
