<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, shallowRef } from 'vue'
import type { UploadFile } from 'element-plus'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import { analyzeAudio, encodeMp3, encodeWav, renderAudio } from '@/utils/audio'
import { saveBlob } from '@/utils/gif'
import '../workbench.css'

const source = shallowRef<AudioBuffer | null>(null)
const sourceUrl = ref('')
const resultUrl = ref('')
const result = ref<Blob | null>(null)
const filename = ref('audio')
const start = ref(0)
const end = ref(0)
const gain = ref(1)
const format = ref<'wav' | 'mp3'>('wav')
const kbps = ref(128)
const busy = ref(false)
const recording = ref(false)
const error = ref('')
const waveform = ref<HTMLCanvasElement | null>(null)
const details = computed(() => source.value ? analyzeAudio(source.value) : null)
let recorder: MediaRecorder | null = null
let stream: MediaStream | null = null
async function loadBlob(blob: Blob, name: string) {
  busy.value = true; error.value = ''; clearResult()
  try {
    const context = new AudioContext()
    const decoded = await context.decodeAudioData(await blob.arrayBuffer())
    await context.close()
    if (decoded.duration > 1800) throw new Error('音频长度超过 30 分钟')
    source.value = decoded
    if (sourceUrl.value) URL.revokeObjectURL(sourceUrl.value)
    sourceUrl.value = URL.createObjectURL(blob)
    filename.value = name.replace(/\.[^.]+$/, '') || 'audio'
    start.value = 0; end.value = Number(decoded.duration.toFixed(2))
    await nextTick(); drawWaveform(decoded)
  } catch (cause) { error.value = cause instanceof Error ? cause.message : '音频无法解码' }
  finally { busy.value = false }
}
function load(file: UploadFile) { if (file.raw) void loadBlob(file.raw, file.raw.name) }
function clearResult() { result.value = null; if (resultUrl.value) URL.revokeObjectURL(resultUrl.value); resultUrl.value = '' }
function drawWaveform(buffer: AudioBuffer) {
  const canvas = waveform.value; if (!canvas) return
  const ctx = canvas.getContext('2d')!; const data = buffer.getChannelData(0)
  canvas.width = 900; canvas.height = 140; ctx.clearRect(0, 0, 900, 140)
  ctx.strokeStyle = '#3982f7'; ctx.lineWidth = 1; ctx.beginPath()
  for (let x = 0; x < 900; x++) {
    const begin = Math.floor(x / 900 * data.length); const finish = Math.min(data.length, Math.floor((x + 1) / 900 * data.length))
    let low = 1; let high = -1
    for (let index = begin; index < finish; index++) { low = Math.min(low, data[index]); high = Math.max(high, data[index]) }
    ctx.moveTo(x, 70 + low * 62); ctx.lineTo(x, 70 + high * 62)
  }
  ctx.stroke()
}
async function generate() {
  if (!source.value) return
  busy.value = true; error.value = ''; clearResult()
  try {
    const rendered = await renderAudio(source.value, start.value, end.value, gain.value)
    result.value = format.value === 'wav' ? encodeWav(rendered) : encodeMp3(rendered, kbps.value)
    resultUrl.value = URL.createObjectURL(result.value)
  } catch (cause) { error.value = cause instanceof Error ? cause.message : '音频转换失败' }
  finally { busy.value = false }
}
async function startRecording() {
  error.value = ''
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const type = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus'].find(item => MediaRecorder.isTypeSupported(item))
    recorder = new MediaRecorder(stream, type ? { mimeType: type } : undefined)
    const chunks: Blob[] = []
    recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data) }
    recorder.onstop = () => { const blob = new Blob(chunks, { type: recorder?.mimeType || 'audio/webm' }); void loadBlob(blob, '录音'); stream?.getTracks().forEach(track => track.stop()); stream = null }
    recorder.start(); recording.value = true
  } catch (cause) { error.value = cause instanceof Error ? cause.message : '无法启动麦克风'; stream?.getTracks().forEach(track => track.stop()) }
}
function stopRecording() { recorder?.stop(); recording.value = false }
onBeforeUnmount(() => { if (recording.value) recorder?.stop(); stream?.getTracks().forEach(track => track.stop()); if (sourceUrl.value) URL.revokeObjectURL(sourceUrl.value); if (resultUrl.value) URL.revokeObjectURL(resultUrl.value) })
</script>
<template>
  <div class="tool-workbench"><section class="tool-workbench__panel"><div class="tool-workbench__row"><el-upload accept="audio/*" :auto-upload="false" :show-file-list="false" :on-change="load"><el-button>选择音频</el-button></el-upload><el-button v-if="!recording" @click="startRecording">开始录音</el-button><el-button v-else type="danger" @click="stopRecording">停止录音</el-button><span v-if="source">{{ filename }} · {{ source.duration.toFixed(2) }} 秒 · {{ source.sampleRate }} Hz · {{ source.numberOfChannels }} 声道</span></div><template v-if="source"><audio :src="sourceUrl" controls style="width: 100%; margin-bottom: 10px" /><canvas ref="waveform" class="waveform" /><div class="tool-workbench__row stats"><span>峰值 {{ details?.peakDb.toFixed(1) }} dBFS</span><span>平均电平 {{ details?.rmsDb.toFixed(1) }} dBFS</span></div><div class="tool-workbench__options"><label>开始（秒）<el-input-number v-model="start" :min="0" :max="source.duration" :step="0.5" /></label><label>结束（秒）<el-input-number v-model="end" :min="0" :max="source.duration" :step="0.5" /></label><label>增益<el-input-number v-model="gain" :min="0" :max="4" :step="0.1" :precision="1" /></label><label>格式<el-select v-model="format" style="width: 110px"><el-option label="WAV" value="wav" /><el-option label="MP3" value="mp3" /></el-select></label><label v-if="format === 'mp3'">码率<el-select v-model="kbps" style="width: 110px"><el-option label="96 kbps" :value="96" /><el-option label="128 kbps" :value="128" /><el-option label="192 kbps" :value="192" /><el-option label="320 kbps" :value="320" /></el-select></label></div><div class="tool-workbench__row"><el-button type="primary" :loading="busy" @click="generate">处理音频</el-button><el-button :disabled="!result" @click="result && saveBlob(result, `${filename}.${format}`)">下载 {{ format.toUpperCase() }}</el-button></div><audio v-if="resultUrl" :src="resultUrl" controls style="width: 100%" /></template><p v-if="error" class="tool-workbench__error" role="alert">{{ error }}</p></section><ToolDetail title="说明"><el-text>上传或录制音频，查看波形与音量，裁剪片段、调整增益并导出 WAV 或 MP3。处理在浏览器本地完成。</el-text></ToolDetail></div>
</template>
<style scoped>.waveform { box-sizing: border-box; width: 100%; height: 140px; border: 1px solid var(--app-border); border-radius: 10px; background: var(--app-surface-muted); }.stats { color: var(--app-text-muted); font-size: 13px; }.tool-workbench__options label { display: flex; align-items: center; gap: 6px; }</style>
