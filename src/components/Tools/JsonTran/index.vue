<script setup lang="ts">
import { ref, watch } from 'vue'
import { json, jsonLanguage } from '@codemirror/lang-json'
import { Codemirror } from 'vue-codemirror'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import { copy } from '@/utils/string'
import '../workbench.css'

const code = ref('')
const indent = ref(2)
const status = ref<'idle' | 'valid' | 'invalid'>('idle')
const statusMessage = ref('')
const extensions = [json()]

watch(code, () => {
  status.value = 'idle'
  statusMessage.value = ''
}, { flush: 'sync' })

function showError(error: unknown) {
  const detail = error instanceof Error ? error.message : String(error)
  const position = detail.match(/position (\d+)/i)
  const lineColumn = detail.match(/line (\d+) column (\d+)/i)
  let location = ''

  if (lineColumn) {
    location = `第 ${lineColumn[1]} 行，第 ${lineColumn[2]} 列：`
  } else {
    let errorPosition = position ? Number(position[1]) : null
    if (errorPosition === null) {
      jsonLanguage.parser.parse(code.value).iterate({
        enter(node) {
          if (node.type.isError && errorPosition === null) errorPosition = node.from
        },
      })
    }
    const before = code.value.slice(0, errorPosition ?? code.value.length)
    const lines = before.split('\n')
    location = `第 ${lines.length} 行，第 ${lines[lines.length - 1].length + 1} 列：`
  }

  status.value = 'invalid'
  statusMessage.value = `JSON 格式错误，${location}${detail}`
}

function parseJson(): unknown | undefined {
  if (!code.value.trim()) {
    status.value = 'invalid'
    statusMessage.value = '请先输入 JSON 内容'
    return undefined
  }
  try {
    const value: unknown = JSON.parse(code.value)
    status.value = 'idle'
    statusMessage.value = ''
    return value
  } catch (error) {
    showError(error)
    return undefined
  }
}

function formatJson() {
  const value = parseJson()
  if (status.value === 'invalid') return
  code.value = JSON.stringify(value, null, indent.value)
  status.value = 'valid'
  statusMessage.value = 'JSON 格式正确，已完成格式化'
}

function compressJson() {
  const value = parseJson()
  if (status.value === 'invalid') return
  code.value = JSON.stringify(value)
  status.value = 'valid'
  statusMessage.value = 'JSON 格式正确，已完成压缩'
}

function escapeJson() {
  if (!code.value) return
  code.value = JSON.stringify(code.value).slice(1, -1)
  statusMessage.value = '已转义当前文本'
}

function unescapeJson() {
  if (!code.value) return
  try {
    code.value = JSON.parse(`"${code.value}"`) as string
    statusMessage.value = '已还原转义文本'
  } catch (error) {
    showError(error)
  }
}

function clearJson() {
  code.value = ''
}
</script>

<template>
  <div class="tool-workbench">
    

    <section class="tool-workbench__panel" aria-label="JSON 编辑器">
      <div class="panel-heading">
        <div>
          <h2>JSON 格式化与校验</h2>
          <p>粘贴 JSON 后选择操作，内容仅在当前浏览器中处理。</p>
        </div>
        <div class="indent-control">
          <span>缩进</span>
          <el-select v-model="indent" aria-label="格式化缩进" size="small">
            <el-option label="2 空格" :value="2" />
            <el-option label="4 空格" :value="4" />
          </el-select>
        </div>
      </div>

      <div class="tool-workbench__toolbar">
        <el-button type="primary" @click="formatJson">校验并格式化</el-button>
        <el-button @click="compressJson">压缩</el-button>
        <el-button @click="escapeJson">转义</el-button>
        <el-button @click="unescapeJson">去转义</el-button>
        <el-button @click="copy(code)">复制</el-button>
        <el-button @click="clearJson">清空</el-button>
      </div>

      <codemirror
        v-model="code"
        class="json-editor"
        placeholder="在这里粘贴或输入 JSON，例如：{&quot;name&quot;:&quot;web&quot;}"
        :style="{ height: '420px' }"
        :indent-with-tab="true"
        :tab-size="indent"
        :extensions="extensions"
      />

      <p v-if="statusMessage" class="status-message" :class="status" :role="status === 'invalid' ? 'alert' : 'status'">
        {{ statusMessage }}
      </p>
    </section>

    <ToolDetail title="说明">
      <el-text>支持标准 JSON 的语法校验、2 或 4 空格格式化、无损压缩，以及文本转义和去转义。格式化与压缩会先校验输入；如果 JSON 无效，原文不会被覆盖。</el-text>
    </ToolDetail>
  </div>
</template>

<style scoped>
.panel-heading { display: flex; justify-content: space-between; align-items: start; gap: 16px; margin-bottom: 18px; }
.panel-heading h2 { margin: 0 0 6px; color: var(--app-text); font-size: 18px; }
.panel-heading p { margin: 0; color: var(--app-text-muted); font-size: 13px; }
.indent-control { display: flex; align-items: center; gap: 8px; flex: none; color: var(--app-text-muted); font-size: 13px; }
.indent-control .el-select { width: 100px; }
.status-message { margin: 16px 0 0; padding: 10px 12px; border-radius: 8px; background: var(--app-surface-muted); color: var(--app-text-muted); font-size: 13px; }
.status-message.valid { background: var(--el-color-success-light-9); color: var(--el-color-success-dark-2); }
.status-message.invalid { background: var(--el-color-danger-light-9); color: var(--el-color-danger); }
@media (max-width: 700px) { .panel-heading { flex-direction: column; }.json-editor { height: 320px !important; } }
</style>
