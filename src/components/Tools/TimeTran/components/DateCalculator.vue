<script setup lang="ts">
import { computed, ref } from 'vue'
import { copy } from '@/utils/string'
import { addCalendarDate, dateDifference, dateUnits, formatLocal, parseWallTime, type DateUnit } from '../time'

const mode = ref<'diff' | 'add'>('diff')
const initial = new Date()
const start = ref(formatLocal(new Date(initial.getTime() - 7 * 86400000)))
const end = ref(formatLocal(initial))
const base = ref(formatLocal(initial))
const operation = ref<'add' | 'subtract'>('add')
const amount = ref(1)
const unit = ref<DateUnit>('days')
const difference = computed(() => {
  const first = parseWallTime(start.value)
  const second = parseWallTime(end.value)
  return first && second ? dateDifference(first, second) : null
})
const result = computed(() => {
  const date = parseWallTime(base.value)
  if (!date || !Number.isInteger(amount.value) || amount.value < 0 || amount.value > 100000) return ''
  const output = addCalendarDate(date, amount.value * (operation.value === 'add' ? 1 : -1), unit.value)
  return Number.isFinite(output.getTime()) ? formatLocal(output) : ''
})
const unitLabel = computed(() => dateUnits.find(item => item.value === unit.value)?.label)
const rows = computed(() => difference.value ? [
  { label: '完整年', value: difference.value.years },
  { label: '完整月', value: difference.value.months },
  { label: '周', value: difference.value.weeks },
  { label: '天（24 小时）', value: difference.value.days },
  { label: '小时', value: difference.value.hours },
  { label: '分钟', value: difference.value.minutes },
  { label: '秒', value: difference.value.seconds },
  { label: '毫秒', value: difference.value.milliseconds },
] : [])
function swap() { [start.value, end.value] = [end.value, start.value] }
</script>

<template>
  <div class="tool-workbench__row">
    <el-radio-group v-model="mode"><el-radio-button label="diff">日期差值</el-radio-button><el-radio-button label="add">日期加减</el-radio-button></el-radio-group>
  </div>
  <div v-if="mode === 'diff'" class="tool-workbench__grid">
    <div class="time-tools__card">
      <label class="tool-workbench__label">开始日期</label>
      <div class="time-tools__input-row"><el-date-picker v-model="start" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" format="YYYY-MM-DD HH:mm:ss" style="width: 100%" /><el-button @click="start = formatLocal(new Date())">现在</el-button></div>
      <div class="time-tools__swap"><el-button @click="swap">交换日期</el-button></div>
      <label class="tool-workbench__label">结束日期</label>
      <div class="time-tools__input-row"><el-date-picker v-model="end" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" format="YYYY-MM-DD HH:mm:ss" style="width: 100%" /><el-button @click="end = formatLocal(new Date())">现在</el-button></div>
    </div>
    <div class="time-tools__card">
      <label class="tool-workbench__label">计算结果</label>
      <template v-if="difference">
        <p class="time-tools__muted">{{ difference.direction < 0 ? '结束时间早于开始时间；以下显示绝对差值。' : '以下显示两个时间点的差值。' }}</p>
        <div class="time-tools__result-list"><div v-for="row in rows" :key="row.label" class="time-tools__result"><span>{{ row.label }}</span><strong>{{ row.value.toLocaleString() }}</strong><el-button link type="primary" @click="copy(String(row.value))">复制</el-button></div></div>
      </template>
      <p v-else class="tool-workbench__error" role="alert">请选择有效的开始和结束日期</p>
    </div>
  </div>
  <div v-else class="tool-workbench__grid">
    <div class="time-tools__card">
      <label class="tool-workbench__label">基准日期</label>
      <div class="time-tools__input-row"><el-date-picker v-model="base" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" format="YYYY-MM-DD HH:mm:ss" style="width: 100%" /><el-button @click="base = formatLocal(new Date())">现在</el-button></div>
      <label class="tool-workbench__label time-tools__section-label">操作</label>
      <el-radio-group v-model="operation"><el-radio-button label="add">加</el-radio-button><el-radio-button label="subtract">减</el-radio-button></el-radio-group>
      <div class="time-tools__amount"><div><label class="tool-workbench__label">数量</label><el-input-number v-model="amount" :min="0" :max="100000" :precision="0" style="width: 100%" /></div><div><label class="tool-workbench__label">单位</label><el-select v-model="unit" style="width: 100%"><el-option v-for="item in dateUnits" :key="item.value" :label="item.label" :value="item.value" /></el-select></div></div>
    </div>
    <div class="time-tools__card">
      <label class="tool-workbench__label">计算结果</label>
      <div v-if="result" class="time-tools__highlight"><span>{{ operation === 'add' ? '加' : '减' }} {{ amount }} {{ unitLabel }}后</span><strong>{{ result }}</strong><el-button @click="copy(result)">复制结果</el-button></div>
      <p v-else class="tool-workbench__error" role="alert">请选择有效的日期和数量</p>
      <p class="time-tools__muted">按本地日历计算；月底加减月份或年份时，结果会落在目标月份的最后一天。</p>
    </div>
  </div>
</template>
