<script setup lang="ts">
import { computed, ref } from 'vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import { copy } from '@/utils/string'
import '../workbench.css'

interface Stop { color: string; position: number }
const kind = ref<'linear' | 'radial'>('linear')
const angle = ref(90)
const stops = ref<Stop[]>([{ color: '#3478f6', position: 0 }, { color: '#b7a7ff', position: 100 }])
const presets: Stop[][] = [
  [{ color: '#3478f6', position: 0 }, { color: '#b7a7ff', position: 100 }],
  [{ color: '#ff9966', position: 0 }, { color: '#ff5e62', position: 100 }],
  [{ color: '#00c9a7', position: 0 }, { color: '#5b86e5', position: 100 }],
]
const css = computed(() => {
  const colors = [...stops.value].sort((a, b) => a.position - b.position).map(stop => `${stop.color} ${stop.position}%`).join(', ')
  return kind.value === 'linear' ? `linear-gradient(${angle.value}deg, ${colors})` : `radial-gradient(circle, ${colors})`
})
const declaration = computed(() => `background: ${css.value};`)
</script>

<template>
  <div class="tool-workbench">
    
    <section class="tool-workbench__panel">
      <div class="tool-workbench__row">
        <el-radio-group v-model="kind"><el-radio-button label="linear">线性渐变</el-radio-button><el-radio-button label="radial">径向渐变</el-radio-button></el-radio-group>
        <template v-if="kind === 'linear'"><span>角度</span><el-slider v-model="angle" :min="0" :max="360" style="width: 180px" /><el-input-number v-model="angle" :min="0" :max="360" style="width: 105px" /></template>
      </div>
      <div class="gradient-preview" :style="{ background: css }" aria-label="渐变预览" />
      <div class="tool-workbench__row" style="margin-top: 16px"><span class="tool-workbench__label" style="margin: 0">预设</span><button v-for="(preset, index) in presets" :key="index" type="button" class="preset" :style="{ background: `linear-gradient(90deg, ${preset.map(stop => `${stop.color} ${stop.position}%`).join(', ')})` }" :aria-label="`使用预设 ${index + 1}`" @click="stops = preset.map(stop => ({ ...stop }))" /></div>
      <div class="tool-workbench__label">颜色控制点</div>
      <div v-for="(stop, index) in stops" :key="index" class="stop-row">
        <el-color-picker v-model="stop.color" />
        <el-input v-model="stop.color" style="width: 120px" />
        <el-slider v-model="stop.position" :min="0" :max="100" style="max-width: 300px; flex: 1" />
        <el-input-number v-model="stop.position" :min="0" :max="100" style="width: 105px" />
        <el-button :disabled="stops.length <= 2" @click="stops.splice(index, 1)">删除</el-button>
      </div>
      <div class="tool-workbench__row" style="margin-top: 16px"><el-button :disabled="stops.length >= 8" @click="stops.push({ color: '#ffffff', position: 50 })">添加颜色</el-button><el-button type="primary" @click="copy(declaration)">复制 CSS</el-button></div>
      <pre class="tool-workbench__output" style="min-height: auto">{{ declaration }}</pre>
    </section>
    <ToolDetail title="说明"><el-text>配置线性或径向渐变、角度和颜色位置，实时预览并复制 CSS 背景声明。</el-text></ToolDetail>
  </div>
</template>

<style scoped>
.gradient-preview { height: 220px; border: 1px solid var(--app-border); border-radius: 12px; }
.preset { width: 70px; height: 32px; border: 1px solid var(--app-border); border-radius: 8px; cursor: pointer; }
.stop-row { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; margin: 10px 0; }
</style>
