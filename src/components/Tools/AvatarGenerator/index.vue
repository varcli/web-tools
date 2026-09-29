<script setup lang="ts">
import { computed, ref } from 'vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import { createSvgBlob, generateConfig, getTraits, randomSeed, renderAvatar } from './avatarEngine'
import '../workbench.css'

const seed = ref(randomSeed())
const config = computed(() => generateConfig(seed.value))
const svg = computed(() => renderAvatar(config.value))
const error = ref('')

function save(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = name
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

async function downloadPng() {
  error.value = ''
  try {
    const image = new Image()
    const url = URL.createObjectURL(createSvgBlob(svg.value))
    image.src = url
    await image.decode()
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 1024
    canvas.getContext('2d')?.drawImage(image, 0, 0, 1024, 1024)
    URL.revokeObjectURL(url)
    const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error('PNG 生成失败'))))
    save(blob, `avatar-${seed.value || 'seed'}.png`)
  } catch (cause) { error.value = cause instanceof Error ? cause.message : '图片生成失败' }
}
</script>

<template>
  <div class="tool-workbench">
    
    <section class="tool-workbench__panel">
      <div class="tool-workbench__row"><el-input v-model="seed" placeholder="输入头像种子" style="max-width: 320px" /><el-button @click="seed = randomSeed()">换一个</el-button><el-button type="primary" @click="save(createSvgBlob(svg), `avatar-${seed || 'seed'}.svg`)">下载 SVG</el-button><el-button @click="downloadPng">下载 PNG</el-button></div>
      <div class="avatar-layout"><div class="avatar-preview" v-html="svg"></div><div class="avatar-info"><h3>{{ config.archetype[0] }}</h3><p>编号 {{ config.portraitNo }}</p><p>相同种子始终生成相同的头像。</p><el-tag v-for="trait in getTraits(config)" :key="trait" style="margin: 4px">{{ trait }}</el-tag></div></div>
      <p v-if="error" class="tool-workbench__error" role="alert">{{ error }}</p>
    </section>
    <ToolDetail title="说明"><el-text>输入文字种子生成可复现的人物头像，可下载 SVG 或 1024 × 1024 PNG。</el-text></ToolDetail>
  </div>
</template>

<style scoped>
.avatar-layout { display: grid; grid-template-columns: minmax(0, 380px) 1fr; gap: 24px; align-items: center; }
.avatar-preview { width: 100%; border: 1px solid var(--app-border); border-radius: 12px; overflow: hidden; background: var(--app-surface-muted); }
.avatar-preview :deep(svg) { display: block; width: 100%; height: auto; }
.avatar-info { color: var(--app-text); }
.avatar-info p { color: var(--app-text-muted); }
@media (max-width: 700px) { .avatar-layout { grid-template-columns: 1fr; } }
</style>
