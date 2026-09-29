<script setup lang="ts">
import { computed, ref } from 'vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import '../workbench.css'

const gender = ref<'male' | 'female'>('male')
const age = ref(28)
const height = ref(175)
const weight = ref(70)
const activity = ref(1.55)
const result = computed(() => {
  if (![age.value, height.value, weight.value].every(Number.isFinite) || age.value < 18 || age.value > 100 || height.value < 100 || height.value > 250 || weight.value < 25 || weight.value > 300) return null
  const bmr = 10 * weight.value + 6.25 * height.value - 5 * age.value + (gender.value === 'male' ? 5 : -161)
  return { bmr, tdee: bmr * activity.value }
})
</script>
<template>
  <div class="tool-workbench"><section class="tool-workbench__panel"><div class="tool-workbench__grid fields"><label>性别<el-select v-model="gender"><el-option label="男" value="male" /><el-option label="女" value="female" /></el-select></label><label>年龄<el-input-number v-model="age" :min="18" :max="100" /></label><label>身高（厘米）<el-input-number v-model="height" :min="100" :max="250" /></label><label>体重（公斤）<el-input-number v-model="weight" :min="25" :max="300" :precision="1" /></label><label>活动水平<el-select v-model="activity"><el-option label="久坐（1.2）" :value="1.2" /><el-option label="轻度活动（1.375）" :value="1.375" /><el-option label="中度活动（1.55）" :value="1.55" /><el-option label="高度活动（1.725）" :value="1.725" /><el-option label="极高强度（1.9）" :value="1.9" /></el-select></label></div><div v-if="result" class="summary"><div><small>基础代谢估算</small><strong>{{ Math.round(result.bmr) }} kcal / 日</strong></div><div><small>日常消耗估算</small><strong>{{ Math.round(result.tdee) }} kcal / 日</strong></div></div><p v-else class="tool-workbench__error" role="alert">请输入有效的成年年龄、身高和体重</p></section><ToolDetail title="说明"><el-text>基础代谢采用 Mifflin-St Jeor 估算式；日常消耗乘以所选活动系数。个人消耗会因身体状况和运动量而异。</el-text></ToolDetail></div>
</template>
<style scoped>.fields { margin-bottom: 20px; }.fields label { display: flex; flex-direction: column; gap: 8px; color: var(--app-text); }.fields :deep(.el-input-number),.fields :deep(.el-select) { width: 100%; }.summary { display: flex; flex-wrap: wrap; gap: 16px; }.summary>div { flex: 1; min-width: 150px; padding: 16px; border: 1px solid var(--app-border); border-radius: 10px; background: var(--app-surface-muted); }.summary small { display: block; color: var(--app-text-muted); }.summary strong { display: block; margin-top: 8px; color: var(--app-text); font-size: 20px; }</style>
