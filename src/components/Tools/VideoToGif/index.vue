<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import type { UploadFile } from 'element-plus'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import { encodeGif, saveBlob } from '@/utils/gif'
import { captureFrames, openVideo } from '@/utils/video'
import '../workbench.css'

const sourceUrl = ref('')
const resultUrl = ref('')
const result = ref<Blob | null>(null)
const duration = ref(0)
const start = ref(0)
const end = ref(5)
const fps = ref(8)
const width = ref(480)
const height = ref(270)
const busy = ref(false)
const progress = ref(0)
const error = ref('')
let video: HTMLVideoElement | null = null
async function load(file: UploadFile) {
  if (!file.raw) return
  error.value = ''; clearResult()
  try {
    const loaded = await openVideo(file.raw)
    if (sourceUrl.value) URL.revokeObjectURL(sourceUrl.value)
    video = loaded.video; sourceUrl.value = loaded.url
    duration.value = video.duration; start.value = 0; end.value = Math.min(5, video.duration)
    width.value = Math.min(480, video.videoWidth)
    height.value = Math.round(video.videoHeight * width.value / video.videoWidth)
  } catch (cause) { error.value = cause instanceof Error ? cause.message : '视频无法读取' }
}
function clearResult() { result.value = null; if (resultUrl.value) URL.revokeObjectURL(resultUrl.value); resultUrl.value = '' }
onBeforeUnmount(() => { if (sourceUrl.value) URL.revokeObjectURL(sourceUrl.value); if (resultUrl.value) URL.revokeObjectURL(resultUrl.value) })
async function generate() {
  if (!video) return
  busy.value = true; progress.value = 0; error.value = ''; clearResult()
  try {
    const frames = await captureFrames(video, start.value, end.value, fps.value, width.value, height.value, value => { progress.value = Math.round(value * 50) })
    const blob = await encodeGif(frames, width.value, height.value, value => { progress.value = 50 + Math.round(value * 50) })
    result.value = blob; resultUrl.value = URL.createObjectURL(blob)
  } catch (cause) { error.value = cause instanceof Error ? cause.message : '转换失败' }
  finally { busy.value = false }
}
</script>
<template>
  <div class="tool-workbench"><section class="tool-workbench__panel"><div class="tool-workbench__row"><el-upload accept="video/*" :auto-upload="false" :show-file-list="false" :on-change="load"><el-button>选择视频</el-button></el-upload><el-button type="primary" :loading="busy" :disabled="!sourceUrl" @click="generate">生成 GIF</el-button><el-button :disabled="!result" @click="result && saveBlob(result, 'video.gif')">下载 GIF</el-button><span v-if="busy">处理进度 {{ progress }}%</span></div><div class="tool-workbench__options"><label>起始秒 <el-input-number v-model="start" :min="0" :max="duration" :step="0.5" /></label><label>结束秒 <el-input-number v-model="end" :min="0" :max="duration" :step="0.5" /></label><label>帧率 <el-input-number v-model="fps" :min="1" :max="30" /></label><label>宽度 <el-input-number v-model="width" :min="1" :max="1200" /></label><label>高度 <el-input-number v-model="height" :min="1" :max="1200" /></label></div><p v-if="sourceUrl" class="tool-workbench__hint">视频时长 {{ duration.toFixed(2) }} 秒；最多生成 180 帧。</p><div class="tool-workbench__grid"><div><label class="tool-workbench__label">原视频</label><video v-if="sourceUrl" class="preview" :src="sourceUrl" controls /></div><div><label class="tool-workbench__label">GIF 预览</label><div class="preview image"><img v-if="resultUrl" :src="resultUrl" alt="生成的 GIF" /></div></div></div><p v-if="error" class="tool-workbench__error" role="alert">{{ error }}</p></section><ToolDetail title="说明"><el-text>指定片段与帧率，将浏览器可播放的视频转换为循环 GIF。帧数上限 180，长视频可缩短片段或降低帧率。</el-text></ToolDetail></div>
</template>
<style scoped>.preview { box-sizing: border-box; display: block; width: 100%; max-height: 420px; min-height: 220px; border: 1px solid var(--app-border); border-radius: 10px; background: var(--app-surface-muted); }.preview.image { display: grid; place-items: center; }.preview img { max-width: 100%; max-height: 420px; }.tool-workbench__options label { display: flex; align-items: center; gap: 6px; }</style>
