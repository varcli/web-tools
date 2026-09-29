<script setup lang="ts">
import { computed, ref } from 'vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import { annualIncomeTax, bonusTax, salarySchedule } from './tax'
import '../workbench.css'

const mode = ref<'salary' | 'bonus'>('salary')
const salary = ref(20000)
const social = ref(3000)
const additional = ref(1500)
const other = ref(0)
const bonus = ref(60000)
const result = computed(() => {
  try {
    const rows = salarySchedule(salary.value, social.value, additional.value, other.value)
    const separateTax = bonusTax(bonus.value)
    const annualTax = annualIncomeTax(Math.max(0, 12 * (salary.value - social.value - additional.value - other.value - 5000)))
    const mergedTax = annualIncomeTax(Math.max(0, 12 * (salary.value - social.value - additional.value - other.value - 5000) + bonus.value))
    return { rows, separateTax, mergedIncrement: mergedTax - annualTax, error: '' }
  } catch (cause) { return { rows: [], separateTax: 0, mergedIncrement: 0, error: cause instanceof Error ? cause.message : '计算失败' } }
})
const money = (value: number) => `¥${value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
</script>
<template>
  <div class="tool-workbench"><section class="tool-workbench__panel"><div class="tool-workbench__row"><el-radio-group v-model="mode"><el-radio-button label="salary">工资薪金</el-radio-button><el-radio-button label="bonus">全年一次性奖金</el-radio-button></el-radio-group></div><div class="tool-workbench__grid fields"><label>每月税前工资（元）<el-input-number v-model="salary" :min="0" :step="1000" /></label><label>每月社保公积金（元）<el-input-number v-model="social" :min="0" :step="100" /></label><label>每月专项附加扣除（元）<el-input-number v-model="additional" :min="0" :step="100" /></label><label>每月其他扣除（元）<el-input-number v-model="other" :min="0" :step="100" /></label><label v-if="mode === 'bonus'">全年一次性奖金（元）<el-input-number v-model="bonus" :min="0" :step="1000" /></label></div><p v-if="result.error" class="tool-workbench__error" role="alert">{{ result.error }}</p><template v-else-if="mode === 'salary'"><div class="summary"><div><small>全年预扣税款</small><strong>{{ money(result.rows[result.rows.length - 1].cumulativeTax) }}</strong></div><div><small>首月税后工资</small><strong>{{ money(result.rows[0].net) }}</strong></div></div><el-table :data="result.rows" max-height="420" style="width: 100%"><el-table-column prop="month" label="月份" width="80" /><el-table-column label="累计应纳税所得额"><template #default="scope">{{ money(scope.row.taxable) }}</template></el-table-column><el-table-column label="本月预扣税额"><template #default="scope">{{ money(scope.row.monthTax) }}</template></el-table-column><el-table-column label="本月税后工资"><template #default="scope">{{ money(scope.row.net) }}</template></el-table-column></el-table></template><template v-else><div class="summary"><div><small>奖金单独计税</small><strong>{{ money(result.separateTax) }}</strong></div><div><small>并入全年工资后的增量税额</small><strong>{{ money(result.mergedIncrement) }}</strong></div></div><p class="tool-workbench__hint">并入计算假设全年工资、扣除额每月相同，且无其他综合所得。</p></template></section><ToolDetail title="说明"><el-text>工资采用累计预扣法，基础减除费用为每月 5000 元。全年一次性奖金可比较单独计税与并入综合所得；单独计税政策目前执行至 2027 年底。实际税额以税务机关核算为准。<br /><el-link href="https://fgk.chinatax.gov.cn/zcfgk/c100015/c5200946/content.html" target="_blank" type="primary">工资预扣规则</el-link> · <el-link href="https://fgk.chinatax.gov.cn/zcfgk/c102416/c5211524/content.html" target="_blank" type="primary">奖金政策</el-link></el-text></ToolDetail></div>
</template>
<style scoped>.fields { margin-bottom: 20px; }.fields label { display: flex; flex-direction: column; gap: 8px; color: var(--app-text); }.fields :deep(.el-input-number) { width: 100%; }.summary { display: flex; flex-wrap: wrap; gap: 16px; margin-bottom: 18px; }.summary>div { flex: 1; min-width: 150px; padding: 16px; border: 1px solid var(--app-border); border-radius: 10px; background: var(--app-surface-muted); }.summary small { display: block; color: var(--app-text-muted); }.summary strong { display: block; margin-top: 8px; color: var(--app-text); font-size: 20px; }</style>
