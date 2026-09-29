<script setup lang="ts">
import { ref } from 'vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import { copy } from '@/utils/string'
import { nextCronTimes } from './cron'
import '../workbench.css'

const fields = ref(['0', '0', '*', '*', '*'])
const expression = ref('0 0 * * *')
const next = ref<string[]>([])
const error = ref('')
const labels = ['分钟', '小时', '日期', '月份', '星期']
const hints = ['0-59', '0-23', '1-31', '1-12 或 JAN-DEC', '0-7 或 SUN-SAT']
const presets = [
  { label: '每分钟', value: '* * * * *' }, { label: '每小时', value: '0 * * * *' },
  { label: '每天零点', value: '0 0 * * *' }, { label: '每天 8 点', value: '0 8 * * *' },
  { label: '每周一 9 点', value: '0 9 * * MON' }, { label: '每月 1 号', value: '0 0 1 * *' },
]

function updateFromFields() { expression.value = fields.value.join(' '); calculate() }
function setExpression(value: string) { expression.value = value; fields.value = value.trim().split(/\s+/); calculate() }
function calculate() {
  error.value = ''
  next.value = []
  try { next.value = nextCronTimes(expression.value).map(date => date.toLocaleString('zh-CN')) }
  catch (cause) { error.value = cause instanceof Error ? cause.message : '表达式无效' }
}
calculate()
</script>

<template>
  <div class="tool-workbench">
    
    <section class="tool-workbench__panel">
      <div class="tool-workbench__row"><span class="tool-workbench__label" style="margin: 0">常用预设</span><el-button v-for="preset in presets" :key="preset.value" size="small" @click="setExpression(preset.value)">{{ preset.label }}</el-button></div>
      <div class="cron-fields"><label v-for="(label, index) in labels" :key="label"><span>{{ label }}</span><el-input v-model="fields[index]" :placeholder="hints[index]" @change="updateFromFields" /><small>{{ hints[index] }}</small></label></div>
      <div class="tool-workbench__row" style="margin-top: 18px"><span class="tool-workbench__label" style="margin: 0">表达式</span><el-input v-model="expression" style="max-width: 370px; font-family: Consolas, monospace" @change="setExpression(expression)" /><el-button type="primary" @click="calculate">计算执行时间</el-button><el-button @click="copy(expression)">复制</el-button></div>
      <p v-if="error" class="tool-workbench__error" role="alert">{{ error }}</p>
      <div v-else><h3>接下来 10 次执行时间</h3><ol class="times"><li v-for="(time, index) in next" :key="index">{{ time }}</li></ol></div>
    </section>
    <ToolDetail title="说明"><el-text>使用标准的五字段 Cron 格式：分钟、小时、日期、月份、星期。支持 *、?、列表、范围和间隔写法，预览根据浏览器本地时区计算。</el-text></ToolDetail>
  </div>
</template>

<style scoped>
.cron-fields { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 10px; }
.cron-fields label { min-width: 0; color: var(--app-text); }.cron-fields span, .cron-fields small { display: block; margin-bottom: 6px; }.cron-fields small { margin-top: 5px; color: var(--app-text-muted); font-size: 11px; }
h3 { color: var(--app-text); font-size: 16px; }.times { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px 20px; padding-left: 24px; color: var(--app-text-muted); }
@media (max-width: 900px) { .cron-fields { grid-template-columns: repeat(2, minmax(0, 1fr)); }.times { grid-template-columns: 1fr; } }
</style>
