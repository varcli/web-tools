<script setup lang="ts">
import { computed, ref } from 'vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import '../workbench.css'

const gender = ref<'male' | 'female'>('male')
const method = ref<'bmi' | 'navy'>('bmi')
const age = ref(28)
const height = ref(175)
const weight = ref(70)
const neck = ref(38)
const waist = ref(85)
const hip = ref(95)
const result = computed(() => {
  const values = [age.value, height.value, weight.value, neck.value, waist.value, hip.value]
  if (!values.every(Number.isFinite) || age.value < 18 || height.value <= 0 || weight.value <= 0 || neck.value <= 0 || waist.value <= 0 || hip.value <= 0) return null
  const bmi = weight.value / Math.pow(height.value / 100, 2)
  let percent: number
  if (method.value === 'bmi') percent = 1.2 * bmi + 0.23 * age.value - 5.4 - (gender.value === 'male' ? 10.8 : 0)
  else if (gender.value === 'male') {
    const difference = waist.value - neck.value
    if (difference <= 0) return null
    percent = 495 / (1.0324 - 0.19077 * Math.log10(difference) + 0.15456 * Math.log10(height.value)) - 450
  } else {
    const circumference = waist.value + hip.value - neck.value
    if (circumference <= 0) return null
    percent = 495 / (1.29579 - 0.35004 * Math.log10(circumference) + 0.221 * Math.log10(height.value)) - 450
  }
  if (!Number.isFinite(percent) || percent < 0 || percent > 100) return null
  return { bmi, percent, fatMass: weight.value * percent / 100, leanMass: weight.value * (1 - percent / 100) }
})
</script>
<template>
  <div class="tool-workbench"><section class="tool-workbench__panel"><div class="tool-workbench__grid fields"><label>性别<el-select v-model="gender"><el-option label="男" value="male" /><el-option label="女" value="female" /></el-select></label><label>估算方式<el-select v-model="method"><el-option label="BMI 与年龄" value="bmi" /><el-option label="围度测量" value="navy" /></el-select></label><label>年龄<el-input-number v-model="age" :min="18" :max="100" /></label><label>身高（厘米）<el-input-number v-model="height" :min="100" :max="250" /></label><label>体重（公斤）<el-input-number v-model="weight" :min="25" :max="300" :precision="1" /></label><template v-if="method === 'navy'"><label>颈围（厘米）<el-input-number v-model="neck" :min="1" :precision="1" /></label><label>腰围（厘米）<el-input-number v-model="waist" :min="1" :precision="1" /></label><label v-if="gender === 'female'">臀围（厘米）<el-input-number v-model="hip" :min="1" :precision="1" /></label></template></div><div v-if="result" class="summary"><div><small>估算体脂率</small><strong>{{ result.percent.toFixed(1) }}%</strong></div><div><small>BMI</small><strong>{{ result.bmi.toFixed(1) }}</strong></div><div><small>估算脂肪量</small><strong>{{ result.fatMass.toFixed(1) }} 公斤</strong></div><div><small>估算去脂体重</small><strong>{{ result.leanMass.toFixed(1) }} 公斤</strong></div></div><p v-else class="tool-workbench__error" role="alert">请检查输入的年龄、身高、体重和围度</p></section><ToolDetail title="说明"><el-text>提供 BMI 与年龄回归式、围度测量法两种估算。测量和个体差异可能使结果偏离实际体脂率。</el-text></ToolDetail></div>
</template>
<style scoped>.fields { margin-bottom: 20px; }.fields label { display: flex; flex-direction: column; gap: 8px; color: var(--app-text); }.fields :deep(.el-input-number),.fields :deep(.el-select) { width: 100%; }.summary { display: flex; flex-wrap: wrap; gap: 16px; }.summary>div { flex: 1; min-width: 150px; padding: 16px; border: 1px solid var(--app-border); border-radius: 10px; background: var(--app-surface-muted); }.summary small { display: block; color: var(--app-text-muted); }.summary strong { display: block; margin-top: 8px; color: var(--app-text); font-size: 20px; }</style>
