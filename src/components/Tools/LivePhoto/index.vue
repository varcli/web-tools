<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import type { UploadFile } from 'element-plus'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import { saveBlob } from '@/utils/gif'
import { packMotionPhoto, unpackMotionPhoto } from './codec'
import '../workbench.css'

const mode = ref<'unpack' | 'pack'>('unpack')
const source = ref<File | null>(null)
const image = ref<File | null>(null)
const video = ref<File | null>(null)
const imageUrl = ref('')
const videoUrl = ref('')
const error = ref('')
const busy = ref(false)
const parts = ref<{ image: Blob; video: Blob } | null>(null)
function chooseSource(file: UploadFile) { source.value = file.raw || null; parts.value = null; error.value = ''; clearPreview() }
function chooseImage(file: UploadFile) { image.value = file.raw || null; error.value = '' }
function chooseVideo(file: UploadFile) { video.value = file.raw || null; error.value = '' }
function clearPreview() { if (imageUrl.value) URL.revokeObjectURL(imageUrl.value); if (videoUrl.value) URL.revokeObjectURL(videoUrl.value); imageUrl.value = ''; videoUrl.value = '' }
onBeforeUnmount(clearPreview)
async function unpack() {
  if (!source.value) return
  busy.value = true; error.value = ''; clearPreview()
  try {
    parts.value = await unpackMotionPhoto(source.value)
    imageUrl.value = URL.createObjectURL(parts.value.image)
    videoUrl.value = URL.createObjectURL(parts.value.video)
  } catch (cause) { parts.value = null; error.value = cause instanceof Error ? cause.message : '拆解失败' }
  finally { busy.value = false }
}
async function pack() {
  if (!image.value || !video.value) return
  busy.value = true; error.value = ''
  try { saveBlob(await packMotionPhoto(image.value, video.value), 'motion-photo.jpg') }
  catch (cause) { error.value = cause instanceof Error ? cause.message : '制作失败' }
  finally { busy.value = false }
}
</script>
<template>
  <div class="tool-workbench"><section class="tool-workbench__panel"><div class="tool-workbench__row"><el-radio-group v-model="mode"><el-radio-button label="unpack">拆解</el-radio-button><el-radio-button label="pack">制作</el-radio-button></el-radio-group></div><template v-if="mode === 'unpack'"><div class="tool-workbench__row"><el-upload accept="image/jpeg,.jpg,.jpeg" :auto-upload="false" :show-file-list="false" :on-change="chooseSource"><el-button>选择动态照片 JPEG</el-button></el-upload><span>{{ source?.name }}</span><el-button type="primary" :disabled="!source" :loading="busy" @click="unpack">拆解</el-button></div><div v-if="parts" class="tool-workbench__grid"><div><label class="tool-workbench__label">静态图片</label><img class="preview" :src="imageUrl" alt="拆解的静态图片" /><el-button @click="saveBlob(parts.image, 'photo.jpg')">下载 JPEG</el-button></div><div><label class="tool-workbench__label">视频</label><video class="preview" :src="videoUrl" controls /><el-button @click="saveBlob(parts.video, 'motion.mp4')">下载 MP4</el-button></div></div></template><template v-else><div class="tool-workbench__row"><el-upload accept="image/jpeg,.jpg,.jpeg" :auto-upload="false" :show-file-list="false" :on-change="chooseImage"><el-button>选择 JPEG 图片</el-button></el-upload><span>{{ image?.name }}</span></div><div class="tool-workbench__row"><el-upload accept="video/mp4,.mp4" :auto-upload="false" :show-file-list="false" :on-change="chooseVideo"><el-button>选择 MP4 视频</el-button></el-upload><span>{{ video?.name }}</span></div><el-button type="primary" :disabled="!image || !video" :loading="busy" @click="pack">制作并下载</el-button></template><p v-if="error" class="tool-workbench__error" role="alert">{{ error }}</p></section><ToolDetail title="说明"><el-text>支持参考项目的 JPEG + MP4 拼接式动态照片。制作时将 MP4 附加到 JPEG 末尾；拆解可还原两份文件。苹果 HEIC / MOV Live Photo 不属于此格式。</el-text></ToolDetail></div>
</template>
<style scoped>.preview { display: block; max-width: 100%; max-height: 320px; margin: 8px 0; border: 1px solid var(--app-border); border-radius: 10px; }</style>
