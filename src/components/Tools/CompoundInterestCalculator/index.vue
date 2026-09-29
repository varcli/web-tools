<script setup lang="ts">
import { computed, ref } from 'vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import '../workbench.css'

const initial = ref(10000)
const monthly = ref(1000)
const rate = ref(3)
const years = ref(10)
const result = computed(() => {
  const months = Math.round(years.value * 12)
  if (![initial.value, monthly.value, rate.value, years.value].every(Number.isFinite) || initial.value < 0 || monthly.value < 0 || rate.value < -100 || years.value < 1 || years.value > 100) return null
  let balance = initial.value
  let invested = initial.value
  const rows = [{ year: 0, invested, balance }]
  const monthRate = rate.value / 1200
  for (let month = 1; month <= months; month++) {
    balance = balance * (1 + monthRate) + monthly.value
    invested += monthly.value
    if (month % 12 === 0 || month === months) rows.push({ year: month / 12, invested, balance })
  }
  return { balance, invested, interest: balance - invested, rows }
})
const money = (value: number) => `¥${value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
</script>
<template>
  <div class="tool-workbench"><section class="tool-workbench__panel">
    <div class="tool-workbench__grid fields"><label>初始金额（元）<el-input-number v-model="initial" :min="0" :precision="2" :step="1000" /></label><label>每月期末投入（元）<el-input-number v-model="monthly" :min="0" :precision="2" :step="100" /></label><label>年收益率（%）<el-input-number v-model="rate" :min="-100" :max="1000" :precision="2" :step="0.1" /></label><label>年数<el-input-number v-model="years" :min="1" :max="100" :precision="1" /></label></div>
    <template v-if="result"><div class="summary"><div><small>期末总额</small><strong>{{ money(result.balance) }}</strong></div><div><small>累计投入</small><strong>{{ money(result.invested) }}</strong></div><div><small>收益</small><strong>{{ money(result.interest) }}</strong></div></div><el-table :data="result.rows" max-height="420" style="width: 100%"><el-table-column prop="year" label="第几年" /><el-table-column label="累计投入"><template #default="scope">{{ money(scope.row.invested) }}</template></el-table-column><el-table-column label="期末总额"><template #default="scope">{{ money(scope.row.balance) }}</template></el-table-column></el-table></template>
    <p v-else class="tool-workbench__error" role="alert">请输入有效的金额、收益率和期限</p>
  </section><ToolDetail title="说明"><el-text>按月复利计算，月投入按期末存入，收益率是估计值，结果未计税费。</el-text></ToolDetail></div>
</template>
<style scoped>.fields { margin-bottom: 20px; }.fields label { display: flex; flex-direction: column; gap: 8px; color: var(--app-text); }.fields :deep(.el-input-number) { width: 100%; }.summary { display: flex; flex-wrap: wrap; gap: 16px; margin-bottom: 18px; }.summary>div { flex: 1; min-width: 150px; padding: 16px; border: 1px solid var(--app-border); border-radius: 10px; background: var(--app-surface-muted); }.summary small { display: block; color: var(--app-text-muted); }.summary strong { display: block; margin-top: 8px; color: var(--app-text); font-size: 20px; }</style>
