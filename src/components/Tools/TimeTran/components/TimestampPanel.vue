<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { copy } from '@/utils/string'
import { formatLocal, parseTimestamp, parseWallTime } from '../time'

const now = ref(Date.now())
const unit = ref<'s' | 'ms'>('s')
const timestamp = ref(String(Math.floor(now.value / 1000)))
const wall = ref(formatLocal(new Date(now.value)))
const error = ref('')
let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => { timer = setInterval(() => { now.value = Date.now() }, 1000) })
onUnmounted(() => { if (timer) clearInterval(timer) })

const localZone = Intl.DateTimeFormat().resolvedOptions().timeZone
const presets = computed(() => {
  const date = new Date(now.value)
  return [
    { label: '当前时间', date },
    { label: '今天零点', date: new Date(date.getFullYear(), date.getMonth(), date.getDate()) },
    { label: '本周一', date: new Date(date.getFullYear(), date.getMonth(), date.getDate() - ((date.getDay() + 6) % 7)) },
    { label: '本月初', date: new Date(date.getFullYear(), date.getMonth(), 1) },
    { label: '本年初', date: new Date(date.getFullYear(), 0, 1) },
  ]
})

function setDate(date: Date) {
  timestamp.value = String(unit.value === 's' ? Math.floor(date.getTime() / 1000) : date.getTime())
  wall.value = formatLocal(date)
  error.value = ''
}
function fromTimestamp() {
  if (!timestamp.value.trim()) { wall.value = ''; error.value = ''; return }
  const date = parseTimestamp(timestamp.value, unit.value)
  if (!date) { wall.value = ''; error.value = '请输入有效的整数时间戳'; return }
  wall.value = formatLocal(date)
  error.value = ''
}
function fromDate() {
  if (!wall.value) { timestamp.value = ''; error.value = ''; return }
  const date = parseWallTime(wall.value)
  if (!date) { timestamp.value = ''; error.value = '请输入有效的日期时间'; return }
  timestamp.value = String(unit.value === 's' ? Math.floor(date.getTime() / 1000) : date.getTime())
  error.value = ''
}
watch(unit, (current, previous) => {
  const date = parseTimestamp(timestamp.value, previous)
  if (date) timestamp.value = String(current === 's' ? Math.floor(date.getTime() / 1000) : date.getTime())
})
</script>

<template>
  <div class="time-tools__live">
    <span>当前 Unix 时间戳</span>
    <strong>{{ Math.floor(now / 1000) }}</strong>
    <el-button link type="primary" @click="copy(String(Math.floor(now / 1000)))">复制</el-button>
    <span class="time-tools__muted">每秒更新 · 本地时区 {{ localZone }}</span>
  </div>
  <div class="tool-workbench__grid">
    <div class="time-tools__card">
      <label class="tool-workbench__label">Unix 时间戳</label>
      <div class="time-tools__input-row">
        <el-input v-model="timestamp" placeholder="输入整数时间戳" clearable @input="fromTimestamp" />
        <el-button @click="setDate(new Date())">现在</el-button>
      </div>
      <div class="time-tools__controls">
        <el-radio-group v-model="unit" size="small">
          <el-radio-button label="s">秒</el-radio-button>
          <el-radio-button label="ms">毫秒</el-radio-button>
        </el-radio-group>
        <el-button :disabled="!timestamp" @click="copy(timestamp)">复制时间戳</el-button>
      </div>
      <div class="time-tools__presets">
        <el-button v-for="preset in presets" :key="preset.label" size="small" @click="setDate(preset.date)">{{ preset.label }}</el-button>
      </div>
    </div>
    <div class="time-tools__card">
      <label class="tool-workbench__label">日期时间</label>
      <div class="time-tools__input-row">
        <el-date-picker v-model="wall" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" format="YYYY-MM-DD HH:mm:ss" placeholder="选择日期和时间" style="width: 100%" @change="fromDate" />
        <el-button @click="setDate(new Date())">现在</el-button>
      </div>
      <p class="time-tools__muted">按浏览器本地时区换算；跨时区时间请使用“时区转换”。</p>
      <div class="time-tools__result"><span>本地时间</span><strong>{{ wall || '—' }}</strong><el-button :disabled="!wall" @click="copy(wall)">复制</el-button></div>
    </div>
  </div>
  <p v-if="error" class="tool-workbench__error" role="alert">{{ error }}</p>
</template>
