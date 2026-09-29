<script setup lang="ts">
import { computed, ref } from 'vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import { loanSchedule, loanSummary, type RepayMethod } from '@/utils/loan'
import '../workbench.css'

const amount = ref(1000000)
const rate = ref(3)
const years = ref(30)
const method = ref<RepayMethod>('annuity')
const afterMonths = ref(36)
const extra = ref(100000)
const strategy = ref<'shorten' | 'reducePayment'>('shorten')
const result = computed(() => {
  try {
    const months = Math.round(years.value * 12)
    const baseline = loanSchedule(amount.value, rate.value, months, method.value)
    const adjusted = loanSchedule(amount.value, rate.value, months, method.value, { afterMonths: afterMonths.value, amount: extra.value, strategy: strategy.value })
    return { baseline: loanSummary(baseline), adjusted: loanSummary(adjusted), rows: adjusted, error: '' }
  } catch (cause) { return { baseline: null, adjusted: null, rows: [], error: cause instanceof Error ? cause.message : '计算失败' } }
})
const money = (value: number) => `¥${value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
</script>
<template>
  <div class="tool-workbench"><section class="tool-workbench__panel">
    <div class="tool-workbench__grid fields"><label>贷款金额（元）<el-input-number v-model="amount" :min="1" :step="10000" /></label><label>年利率（%）<el-input-number v-model="rate" :min="0" :max="100" :precision="2" :step="0.1" /></label><label>贷款年限<el-input-number v-model="years" :min="1" :max="100" /></label><label>还款方式<el-select v-model="method"><el-option label="等额本息" value="annuity" /><el-option label="等额本金" value="equalPrincipal" /></el-select></label><label>已还期数（月）<el-input-number v-model="afterMonths" :min="1" /></label><label>提前还款金额（元）<el-input-number v-model="extra" :min="1" :step="10000" /></label><label>调整方式<el-select v-model="strategy"><el-option label="月供基本不变，缩短期限" value="shorten" /><el-option label="期限不变，减少月供" value="reducePayment" /></el-select></label></div>
    <p v-if="result.error" class="tool-workbench__error" role="alert">{{ result.error }}</p><template v-else-if="result.baseline && result.adjusted"><div class="summary"><div><small>原利息总额</small><strong>{{ money(result.baseline.interest) }}</strong></div><div><small>提前还款后利息</small><strong>{{ money(result.adjusted.interest) }}</strong></div><div><small>节省利息</small><strong>{{ money(result.baseline.interest - result.adjusted.interest) }}</strong></div><div><small>缩短期数</small><strong>{{ result.baseline.months - result.adjusted.months }} 个月</strong></div></div><el-table :data="result.rows" max-height="420" style="width: 100%"><el-table-column prop="month" label="期数" width="80" /><el-table-column label="当月支付"><template #default="scope">{{ money(scope.row.payment) }}</template></el-table-column><el-table-column label="提前还款"><template #default="scope">{{ money(scope.row.extra) }}</template></el-table-column><el-table-column label="剩余本金"><template #default="scope">{{ money(scope.row.remaining) }}</template></el-table-column></el-table></template>
  </section><ToolDetail title="说明"><el-text>在指定期数正常还款后追加提前还款，并比较固定利率下的利息差额。结果未计提前还款违约金、费用或利率调整。</el-text></ToolDetail></div>
</template>
<style scoped>.fields { margin-bottom: 20px; }.fields label { display: flex; flex-direction: column; gap: 8px; color: var(--app-text); }.fields :deep(.el-input-number),.fields :deep(.el-select) { width: 100%; }.summary { display: flex; flex-wrap: wrap; gap: 16px; margin-bottom: 18px; }.summary>div { flex: 1; min-width: 150px; padding: 16px; border: 1px solid var(--app-border); border-radius: 10px; background: var(--app-surface-muted); }.summary small { display: block; color: var(--app-text-muted); }.summary strong { display: block; margin-top: 8px; color: var(--app-text); font-size: 20px; }</style>
