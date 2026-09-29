<script setup lang="ts">
import { computed, ref } from 'vue'
import { copy } from '@/utils/string'
import { formatInZone, timezones, wallTimeToInstant } from '../time'

const sourceZone = ref('Asia/Shanghai')
const targetZone = ref('America/New_York')
const sourceTime = ref(formatInZone(Date.now(), sourceZone.value))
const instant = computed(() => sourceTime.value ? wallTimeToInstant(sourceTime.value, sourceZone.value) : null)
const targetTime = computed(() => instant.value ? formatInZone(instant.value.getTime(), targetZone.value) : '')
const sourceLabel = computed(() => timezones.find(zone => zone.value === sourceZone.value)?.label || sourceZone.value)
const targetLabel = computed(() => timezones.find(zone => zone.value === targetZone.value)?.label || targetZone.value)
function swap() {
  if (targetTime.value) sourceTime.value = targetTime.value
  ;[sourceZone.value, targetZone.value] = [targetZone.value, sourceZone.value]
}
function now() { sourceTime.value = formatInZone(Date.now(), sourceZone.value) }
</script>

<template>
  <div class="tool-workbench__grid">
    <div class="time-tools__card">
      <label class="tool-workbench__label">源时间</label>
      <div class="time-tools__input-row"><el-date-picker v-model="sourceTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" format="YYYY-MM-DD HH:mm:ss" style="width: 100%" /><el-button @click="now">现在</el-button></div>
      <div class="time-tools__zone-grid">
        <div><label class="tool-workbench__label">源时区</label><el-select v-model="sourceZone" filterable style="width: 100%"><el-option v-for="zone in timezones" :key="zone.value" :label="`${zone.label} (${zone.value})`" :value="zone.value" /></el-select></div>
        <div><label class="tool-workbench__label">目标时区</label><el-select v-model="targetZone" filterable style="width: 100%"><el-option v-for="zone in timezones" :key="zone.value" :label="`${zone.label} (${zone.value})`" :value="zone.value" /></el-select></div>
      </div>
      <el-button class="time-tools__swap-button" @click="swap">交换时区</el-button>
      <p class="time-tools__muted">输入时间按“源时区”解释，自动处理目标日期的夏令时。</p>
    </div>
    <div class="time-tools__card">
      <label class="tool-workbench__label">转换结果</label>
      <template v-if="instant">
        <div class="time-tools__highlight"><span>{{ targetLabel }} · {{ targetZone }}</span><strong>{{ targetTime }}</strong><el-button @click="copy(targetTime)">复制结果</el-button></div>
        <div class="time-tools__result-list">
          <div class="time-tools__result"><span>源时间 · {{ sourceLabel }}</span><strong>{{ sourceTime }}</strong></div>
          <div class="time-tools__result"><span>Unix 时间戳（秒）</span><strong>{{ Math.floor(instant.getTime() / 1000) }}</strong><el-button link type="primary" @click="copy(String(Math.floor(instant!.getTime() / 1000)))">复制</el-button></div>
          <div class="time-tools__result"><span>ISO 8601</span><strong>{{ instant.toISOString() }}</strong><el-button link type="primary" @click="copy(instant!.toISOString())">复制</el-button></div>
        </div>
      </template>
      <p v-else class="tool-workbench__error" role="alert">请输入有效的日期时间。夏令时切换时，部分本地时间不存在。</p>
      <p class="time-tools__muted">夏令时回拨产生的重复时间按第一次出现计算。</p>
    </div>
  </div>
</template>
