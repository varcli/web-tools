<script setup lang="ts">
import { ref } from 'vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import { copy } from '@/utils/string'
import '../workbench.css'

type Kind = 'uuid' | 'ulid' | 'hex' | 'alphanumeric' | 'numeric'
const kind = ref<Kind>('ulid')
const count = ref(10)
const length = ref(16)
const output = ref('')
const alphabet = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'

function random(max: number): number {
  const limit = Math.floor(0x100000000 / max) * max
  const bytes = new Uint32Array(1)
  do { crypto.getRandomValues(bytes) } while (bytes[0] >= limit)
  return bytes[0] % max
}

function ulid(): string {
  let time = Date.now()
  let prefix = ''
  for (let i = 0; i < 10; i++) { prefix = alphabet[time % 32] + prefix; time = Math.floor(time / 32) }
  return prefix + Array.from({ length: 16 }, () => alphabet[random(32)]).join('')
}

function make(): string {
  if (kind.value === 'uuid') return crypto.randomUUID()
  if (kind.value === 'ulid') return ulid()
  const characters = kind.value === 'hex' ? '0123456789abcdef' : kind.value === 'numeric' ? '0123456789' : '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
  return Array.from({ length: Math.min(256, Math.max(1, length.value || 1)) }, () => characters[random(characters.length)]).join('')
}

function generate() { output.value = Array.from({ length: Math.min(100, Math.max(1, count.value || 1)) }, make).join('\n') }
function download() {
  const url = URL.createObjectURL(new Blob([output.value], { type: 'text/plain;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `${kind.value}.txt`
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
generate()
</script>

<template>
  <div class="tool-workbench">
    <section class="tool-workbench__panel">
      <div class="tool-workbench__row"><el-select v-model="kind" style="width: 180px"><el-option label="ULID" value="ulid" /><el-option label="UUID v4" value="uuid" /><el-option label="随机十六进制" value="hex" /><el-option label="随机字母数字" value="alphanumeric" /><el-option label="随机数字" value="numeric" /></el-select><span>数量</span><el-input-number v-model="count" :min="1" :max="100" /><template v-if="!['uuid', 'ulid'].includes(kind)"><span>长度</span><el-input-number v-model="length" :min="1" :max="256" /></template><el-button type="primary" @click="generate">生成</el-button><el-button :disabled="!output" @click="copy(output)">复制</el-button><el-button :disabled="!output" @click="download">下载</el-button></div>
      <pre class="tool-workbench__output">{{ output }}</pre>
    </section>
    <ToolDetail title="说明"><el-text>使用浏览器安全随机数生成 ULID、UUID 和自定义长度字符串。ULID 前 10 位包含毫秒时间戳。</el-text></ToolDetail>
  </div>
</template>
