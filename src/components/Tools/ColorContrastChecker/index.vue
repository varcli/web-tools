<script setup lang="ts">
import { computed, ref } from 'vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import { copy } from '@/utils/string'
import { contrastRatio, suggestedForeground } from './contrast'
import '../workbench.css'

const foreground = ref('#3478f6')
const background = ref('#ffffff')
const ratio = computed(() => {
  try { return contrastRatio(foreground.value, background.value) }
  catch { return 0 }
})
const suggested = computed(() => {
  try { return suggestedForeground(foreground.value, background.value) }
  catch { return '' }
})
const checks = computed(() => [
  { label: '普通文本 AA', threshold: 4.5 },
  { label: '普通文本 AAA', threshold: 7 },
  { label: '大号文本 AA', threshold: 3 },
  { label: '大号文本 AAA', threshold: 4.5 },
  { label: 'UI 组件', threshold: 3 },
])
function swapColors() {
  const previous = foreground.value
  foreground.value = background.value
  background.value = previous
}
</script>

<template>
  <div class="tool-workbench">
    
    <section class="tool-workbench__panel">
      <div class="tool-workbench__options">
        <label>前景色 <el-color-picker v-model="foreground" /></label><el-input v-model="foreground" style="width: 110px" />
        <label>背景色 <el-color-picker v-model="background" /></label><el-input v-model="background" style="width: 110px" />
        <el-button @click="swapColors">交换颜色</el-button>
      </div>
      <div class="contrast-preview" :style="{ color: foreground, backgroundColor: background }">
        <strong>示例标题 Aa</strong>
        <p>这是一段普通大小的示例文字，用于预览前景色与背景色的对比效果。</p>
      </div>
      <h2 class="ratio">对比度 {{ ratio.toFixed(2) }} : 1</h2>
      <div class="check-list"><div v-for="check in checks" :key="check.label"><span>{{ check.label }}</span><el-tag :type="ratio >= check.threshold ? 'success' : 'danger'">{{ ratio >= check.threshold ? '通过' : '未通过' }}</el-tag></div></div>
      <div v-if="suggested && suggested !== foreground" class="tool-workbench__row" style="margin-top: 18px"><span>AA 文本建议前景色：<strong>{{ suggested }}</strong></span><el-button @click="foreground = suggested">应用建议</el-button><el-button @click="copy(suggested)">复制颜色</el-button></div>
    </section>
    <ToolDetail title="说明"><el-text>根据 WCAG 相对亮度计算颜色对比度，并检查普通文本、大号文本和 UI 组件的 AA / AAA 阈值。建议色通过调整前景色明度计算。</el-text></ToolDetail>
  </div>
</template>

<style scoped>
.contrast-preview { min-height: 140px; padding: 28px; border: 1px solid var(--app-border); border-radius: 12px; }
.contrast-preview strong { font-size: 26px; }.contrast-preview p { margin-bottom: 0; font-size: 15px; }
.ratio { margin: 20px 0; color: var(--app-text); }
.check-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 10px; }
.check-list > div { display: flex; justify-content: space-between; align-items: center; gap: 8px; padding: 12px; border: 1px solid var(--app-border); border-radius: 10px; color: var(--app-text); }
</style>
