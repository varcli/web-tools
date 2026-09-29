<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import type { UploadFile } from 'element-plus'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import { drawContain, loadImage, saveBlob } from '@/utils/gif'
import { canvasBlob, openVideo, seekVideo } from '@/utils/video'
import { makeZip } from '@/utils/zip'
import '../workbench.css'

type Picture = { image: HTMLImageElement; url: string; name: string }
const mode = ref<'frames' | 'movie'>('frames')
const videoUrl = ref('')
const duration = ref(0)
const interval = ref(1)
const imageFormat = ref<'png' | 'jpeg' | 'webp'>('png')
const pictures = ref<Picture[]>([])
const secondsPerImage = ref(1)
const width = ref(640)
const height = ref(360)
const busy = ref(false)
const progress = ref(0)
const error = ref('')
const resultUrl = ref('')
const result = ref<Blob | null>(null)
let video: HTMLVideoElement | null = null
async function loadVideo(file: UploadFile) {
  if (!file.raw) return
  error.value = ''; clearResult()
  try {
    const loaded = await openVideo(file.raw)
    if (videoUrl.value) URL.revokeObjectURL(videoUrl.value)
    video = loaded.video; videoUrl.value = loaded.url; duration.value = video.duration
    width.value = Math.min(640, video.videoWidth); height.value = Math.round(video.videoHeight * width.value / video.videoWidth)
  } catch (cause) { error.value = cause instanceof Error ? cause.message : '视频无法读取' }
}
async function addPicture(file: UploadFile) {
  if (!file.raw) return
  if (pictures.value.length >= 30) { error.value = '最多添加 30 张图片'; return }
  try { pictures.value.push({ ...await loadImage(file.raw), name: file.raw.name }); clearResult(); error.value = '' }
  catch { error.value = '图片无法读取' }
}
function removePicture(index: number) { URL.revokeObjectURL(pictures.value[index].url); pictures.value.splice(index, 1); clearResult() }
function clearResult() { result.value = null; if (resultUrl.value) URL.revokeObjectURL(resultUrl.value); resultUrl.value = '' }
watch(mode, clearResult)
onBeforeUnmount(() => { if (videoUrl.value) URL.revokeObjectURL(videoUrl.value); if (resultUrl.value) URL.revokeObjectURL(resultUrl.value); pictures.value.forEach(item => URL.revokeObjectURL(item.url)) })
async function extract() {
  if (!video) return
  busy.value = true; progress.value = 0; error.value = ''; clearResult()
  try {
    if (interval.value <= 0) throw new Error('截帧间隔必须大于 0')
    const count = Math.ceil(video.duration / interval.value)
    if (count > 100) throw new Error('截取帧数超过 100，请增加间隔')
    const extension = imageFormat.value === 'jpeg' ? 'jpg' : imageFormat.value
    const files: { name: string; content: Blob }[] = []
    for (let index = 0; index < count; index++) {
      await seekVideo(video, index * interval.value)
      const canvas = drawContain(video, video.videoWidth, video.videoHeight, width.value, height.value)
      files.push({ name: `frame-${String(index + 1).padStart(3, '0')}.${extension}`, content: await canvasBlob(canvas, `image/${imageFormat.value}`) })
      progress.value = Math.round((index + 1) / count * 100)
    }
    result.value = await makeZip(files)
    saveBlob(result.value, 'video-frames.zip')
  } catch (cause) { error.value = cause instanceof Error ? cause.message : '截帧失败' }
  finally { busy.value = false }
}
async function makeMovie() {
  busy.value = true; progress.value = 0; error.value = ''; clearResult()
  try {
    if (!pictures.value.length) throw new Error('请先添加图片')
    if (!('MediaRecorder' in window) || !HTMLCanvasElement.prototype.captureStream) throw new Error('浏览器不支持视频录制')
    const canvas = document.createElement('canvas'); canvas.width = width.value; canvas.height = height.value
    const ctx = canvas.getContext('2d')!
    const stream = canvas.captureStream(30)
    const type = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'].find(item => MediaRecorder.isTypeSupported(item))
    if (!type) throw new Error('浏览器不支持 WebM 编码')
    const recorder = new MediaRecorder(stream, { mimeType: type })
    const chunks: Blob[] = []
    recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data) }
    const finished = new Promise<Blob>((resolve, reject) => {
      recorder.onerror = () => reject(new Error('视频编码失败'))
      recorder.onstop = () => resolve(new Blob(chunks, { type }))
    })
    recorder.start()
    for (let index = 0; index < pictures.value.length; index++) {
      const item = pictures.value[index]
      const frame = drawContain(item.image, item.image.naturalWidth, item.image.naturalHeight, width.value, height.value)
      ctx.drawImage(frame, 0, 0)
      await new Promise(resolve => setTimeout(resolve, secondsPerImage.value * 1000))
      progress.value = Math.round((index + 1) / pictures.value.length * 100)
    }
    recorder.stop(); stream.getTracks().forEach(track => track.stop())
    result.value = await finished; resultUrl.value = URL.createObjectURL(result.value)
  } catch (cause) { error.value = cause instanceof Error ? cause.message : '视频生成失败' }
  finally { busy.value = false }
}
</script>
<template>
  <div class="tool-workbench"><section class="tool-workbench__panel"><div class="tool-workbench__row"><el-radio-group v-model="mode"><el-radio-button label="frames">视频提取图片</el-radio-button><el-radio-button label="movie">图片生成视频</el-radio-button></el-radio-group></div><template v-if="mode === 'frames'"><div class="tool-workbench__row"><el-upload accept="video/*" :auto-upload="false" :show-file-list="false" :on-change="loadVideo"><el-button>选择视频</el-button></el-upload><el-button type="primary" :loading="busy" :disabled="!videoUrl" @click="extract">提取并下载 ZIP</el-button><span v-if="busy">处理进度 {{ progress }}%</span></div><div class="tool-workbench__options"><label>截帧间隔（秒）<el-input-number v-model="interval" :min="0.1" :max="60" :step="0.5" /></label><label>格式<el-select v-model="imageFormat" style="width: 110px"><el-option label="PNG" value="png" /><el-option label="JPEG" value="jpeg" /><el-option label="WebP" value="webp" /></el-select></label><label>宽度<el-input-number v-model="width" :min="1" :max="1200" /></label><label>高度<el-input-number v-model="height" :min="1" :max="1200" /></label></div><p v-if="videoUrl" class="tool-workbench__hint">视频时长 {{ duration.toFixed(2) }} 秒；最多提取 100 帧。</p><video v-if="videoUrl" class="preview" :src="videoUrl" controls /></template><template v-else><div class="tool-workbench__row"><el-upload accept="image/*" multiple :auto-upload="false" :show-file-list="false" :on-change="addPicture"><el-button>添加图片</el-button></el-upload><el-button type="primary" :loading="busy" :disabled="!pictures.length" @click="makeMovie">生成 WebM 视频</el-button><el-button :disabled="!result" @click="result && saveBlob(result, 'slideshow.webm')">下载视频</el-button><span v-if="busy">录制进度 {{ progress }}%</span></div><div class="tool-workbench__options"><label>每张停留（秒）<el-input-number v-model="secondsPerImage" :min="0.2" :max="10" :step="0.2" /></label><label>宽度<el-input-number v-model="width" :min="1" :max="1200" /></label><label>高度<el-input-number v-model="height" :min="1" :max="1200" /></label></div><div class="pictures"><div v-for="(item, index) in pictures" :key="item.url" class="picture"><img :src="item.url" :alt="item.name" /><small>{{ index + 1 }}. {{ item.name }}</small><el-button size="small" type="danger" plain @click="removePicture(index)">删除</el-button></div></div><video v-if="resultUrl" class="preview" :src="resultUrl" controls /></template><p v-if="error" class="tool-workbench__error" role="alert">{{ error }}</p></section><ToolDetail title="说明"><el-text>从视频按时间间隔提取图片并打包，或将多张图片录制为 WebM 视频。处理在浏览器本地完成。</el-text></ToolDetail></div>
</template>
<style scoped>.preview { display: block; width: 100%; max-height: 400px; border: 1px solid var(--app-border); border-radius: 10px; background: var(--app-surface-muted); }.pictures { display: flex; gap: 12px; overflow-x: auto; }.picture { flex: 0 0 140px; display: flex; flex-direction: column; gap: 6px; padding: 8px; border: 1px solid var(--app-border); border-radius: 10px; }.picture img { height: 100px; object-fit: contain; }.picture small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--app-text-muted); }.tool-workbench__options label { display: flex; align-items: center; gap: 6px; }</style>
