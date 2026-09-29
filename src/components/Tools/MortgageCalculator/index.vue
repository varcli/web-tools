<script setup lang="ts">
import { computed, ref } from 'vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import { loanSchedule, loanSummary, type RepayMethod } from '@/utils/loan'
import '../workbench.css'

const amount = ref(1000000)
const rate = ref(3)
const years = ref(30)
const method = ref<RepayMethod>('annuity')
const result = computed(() => {
  try { const rows = loanSchedule(amount.value, rate.value, Math.round(years.value * 12), method.value); return { rows, ...loanSummary(rows), error: '' } }
  catch (cause) { return { rows: [], months: 0, interest: 0, total: 0, error: cause instanceof Error ? cause.message : '计算失败' } }
})
const money = (value: number) => `¥${value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
function download() {
  const lines = ['期数,月供,本金,利息,剩余本金', ...result.value.rows.map(row => [row.month, row.payment, row.principal, row.interest, row.remaining].map(value => typeof value === 'number' ? value.toFixed(2) : value).join(','))]
  const url = URL.createObjectURL(new Blob(['\ufeff', lines.join('\n')], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a'); link.href = url; link.download = '房贷还款计划.csv'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000)
}
</script>
<template>
  <div class="tool-workbench"><section class="tool-workbench__panel">
    <div class="tool-workbench__grid fields"><label>贷款金额（元）<el-input-number v-model="amount" :min="1" :step="10000" /></label><label>年利率（%）<el-input-number v-model="rate" :min="0" :max="100" :precision="2" :step="0.1" /></label><label>贷款年限<el-input-number v-model="years" :min="1" :max="100" /></label><label>还款方式<el-select v-model="method"><el-option label="等额本息" value="annuity" /><el-option label="等额本金" value="equalPrincipal" /></el-select></label></div>
    <p v-if="result.error" class="tool-workbench__error" role="alert">{{ result.error }}</p><template v-else><div class="summary"><div><small>首月月供</small><strong>{{ money(result.rows[0].payment) }}</strong></div><div><small>利息总额</small><strong>{{ money(result.interest) }}</strong></div><div><small>还款总额</small><strong>{{ money(result.total) }}</strong></div></div><div class="tool-workbench__row"><el-button @click="download">下载还款计划 CSV</el-button></div><el-table :data="result.rows" max-height="420" style="width: 100%"><el-table-column prop="month" label="期数" width="80" /><el-table-column label="月供"><template #default="scope">{{ money(scope.row.payment) }}</template></el-table-column><el-table-column label="本金"><template #default="scope">{{ money(scope.row.principal) }}</template></el-table-column><el-table-column label="利息"><template #default="scope">{{ money(scope.row.interest) }}</template></el-table-column><el-table-column label="剩余本金"><template #default="scope">{{ money(scope.row.remaining) }}</template></el-table-column></el-table></template>
  </section><ToolDetail title="说明"><el-text>按固定年利率、按月计息计算等额本息或等额本金。利率请以实际贷款合同为准；结果仅含本金和利息。</el-text></ToolDetail></div>
</template>
<style scoped>.fields { margin-bottom: 20px; }.fields label { display: flex; flex-direction: column; gap: 8px; color: var(--app-text); }.fields :deep(.el-input-number),.fields :deep(.el-select) { width: 100%; }.summary { display: flex; flex-wrap: wrap; gap: 16px; margin-bottom: 18px; }.summary>div { flex: 1; min-width: 150px; padding: 16px; border: 1px solid var(--app-border); border-radius: 10px; background: var(--app-surface-muted); }.summary small { display: block; color: var(--app-text-muted); }.summary strong { display: block; margin-top: 8px; color: var(--app-text); font-size: 20px; }</style>
