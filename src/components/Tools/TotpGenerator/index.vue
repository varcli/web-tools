<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import { copy } from '@/utils/string'
import { generateTotp, parseSecret, type Algorithm } from './totp'
import '../workbench.css'

interface Account { id: number; label: string; secret: string; algorithm: Algorithm; digits: 6 | 8; period: number }
const storageKey = 'web-tools-totp-accounts'
const input = ref('')
const label = ref('')
const algorithm = ref<Algorithm>('SHA-1')
const digits = ref<6 | 8>(6)
const period = ref(30)
const now = ref(Date.now())
const current = ref('')
const error = ref('')
const accounts = ref<Account[]>([])
let timer: ReturnType<typeof setInterval> | null = null
let runId = 0
const counter = computed(() => Math.floor(now.value / 1000 / period.value))
const remaining = computed(() => period.value - (Math.floor(now.value / 1000) % period.value))

function readAccounts() {
  try {
    const value = JSON.parse(localStorage.getItem(storageKey) ?? '[]') as unknown
    accounts.value = Array.isArray(value) ? value as Account[] : []
  } catch { accounts.value = [] }
}
function persist() { localStorage.setItem(storageKey, JSON.stringify(accounts.value)) }
function applyInput() {
  try {
    const parsed = parseSecret(input.value)
    if (input.value.toLowerCase().startsWith('otpauth://')) {
      algorithm.value = parsed.algorithm
      digits.value = parsed.digits
      period.value = parsed.period
      label.value = parsed.label
    }
  } catch (cause) { error.value = cause instanceof Error ? cause.message : '链接无效' }
}
function saveAccount() {
  try {
    const parsed = parseSecret(input.value)
    if (!parsed.secret) throw new Error('请先输入密钥')
    accounts.value.push({ id: Date.now(), label: label.value || parsed.label || `账户 ${accounts.value.length + 1}`, secret: parsed.secret, algorithm: algorithm.value, digits: digits.value, period: period.value })
    persist()
  } catch (cause) { error.value = cause instanceof Error ? cause.message : '保存失败' }
}
function selectAccount(account: Account) {
  input.value = account.secret
  label.value = account.label
  algorithm.value = account.algorithm
  digits.value = account.digits
  period.value = account.period
}
function removeAccount(id: number) { accounts.value = accounts.value.filter(account => account.id !== id); persist() }

watch(input, () => { if (input.value.toLowerCase().startsWith('otpauth://')) applyInput() })
watch([input, algorithm, digits, period, counter], async () => {
  const thisRun = ++runId
  current.value = ''
  error.value = ''
  if (!input.value.trim()) return
  try {
    const parsed = parseSecret(input.value)
    const code = await generateTotp(parsed.secret, Math.floor(now.value / 1000), algorithm.value, digits.value, period.value)
    if (thisRun === runId) current.value = code
  } catch (cause) { if (thisRun === runId) error.value = cause instanceof Error ? cause.message : '口令计算失败' }
}, { immediate: true })

onMounted(() => { readAccounts(); timer = setInterval(() => { now.value = Date.now() }, 1000) })
onBeforeUnmount(() => { if (timer) clearInterval(timer) })
</script>

<template>
  <div class="tool-workbench">
    
    <section class="tool-workbench__panel">
      <label class="tool-workbench__label">Base32 密钥或 otpauth:// 链接</label>
      <el-input v-model="input" type="textarea" :rows="3" placeholder="输入密钥或粘贴验证器二维码中的 otpauth 链接" @change="applyInput" />
      <div class="tool-workbench__options" style="margin-top: 16px"><span>算法</span><el-select v-model="algorithm" style="width: 120px"><el-option label="SHA-1" value="SHA-1" /><el-option label="SHA-256" value="SHA-256" /><el-option label="SHA-512" value="SHA-512" /></el-select><span>位数</span><el-select v-model="digits" style="width: 100px"><el-option label="6 位" :value="6" /><el-option label="8 位" :value="8" /></el-select><span>周期（秒）</span><el-input-number v-model="period" :min="1" :max="300" style="width: 110px" /></div>
      <p v-if="error" class="tool-workbench__error" role="alert">{{ error }}</p>
      <div class="code-panel"><span>当前口令</span><strong>{{ current || '······' }}</strong><span>剩余 {{ remaining }} 秒</span><el-progress :percentage="Math.round((remaining / period) * 100)" :show-text="false" /><el-button type="primary" :disabled="!current" @click="copy(current)">复制口令</el-button></div>
      <div class="tool-workbench__row" style="margin-top: 20px"><el-input v-model="label" placeholder="账户名称（可选）" style="max-width: 230px" /><el-button :disabled="!current" @click="saveAccount">保存到此浏览器</el-button></div>
      <div v-if="accounts.length" class="accounts"><div v-for="account in accounts" :key="account.id"><span>{{ account.label }}</span><el-button link type="primary" @click="selectAccount(account)">使用</el-button><el-button link type="danger" @click="removeAccount(account.id)">删除</el-button></div></div>
    </section>
    <ToolDetail title="说明"><el-text>按照 RFC 6238 在浏览器本地计算动态口令。账户保存功能会将密钥存入当前浏览器的本地存储；只有点击保存时才会持久化。</el-text></ToolDetail>
  </div>
</template>

<style scoped>
.code-panel { display: flex; flex-direction: column; align-items: center; gap: 10px; max-width: 390px; margin: 20px auto; padding: 22px; border: 1px solid var(--app-border); border-radius: 14px; background: var(--app-surface-muted); color: var(--app-text-muted); }.code-panel strong { color: var(--el-color-primary); font: 700 36px Consolas, monospace; letter-spacing: .18em; }.code-panel .el-progress { width: 100%; }
.accounts > div { display: flex; align-items: center; gap: 10px; padding: 8px 12px; border-bottom: 1px solid var(--app-border); color: var(--app-text); }
.accounts span { flex: 1; }
</style>
