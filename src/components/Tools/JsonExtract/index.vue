<script setup lang="ts">
import { computed, ref } from 'vue'
import { json } from '@codemirror/lang-json'
import { Codemirror } from 'vue-codemirror'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import { copy } from '@/utils/string'
import { extractFields, extractKeysOrValues, listFields, queryJsonPath } from './extract'
import '../workbench.css'

const input = ref('')
const mode = ref<'path' | 'fields' | 'keys'>('path')
const path = ref('$')
const selectedFields = ref<string[]>([])
const preserveStructure = ref(true)
const removeEmpty = ref(false)
const keysMode = ref<'keys' | 'values'>('keys')
const includeNested = ref(true)
const sortResults = ref(true)
const listOutput = ref(false)
const extensions = [json()]

const parsed = computed(() => {
  if (!input.value.trim()) return { value: undefined, error: '' }
  try { return { value: JSON.parse(input.value) as unknown, error: '' } }
  catch (error) { return { value: undefined, error: (error as Error).message } }
})
const availableFields = computed(() => parsed.value.error || parsed.value.value === undefined ? [] : listFields(parsed.value.value))
const result = computed(() => {
  if (!input.value.trim()) return { output: '', error: '' }
  if (parsed.value.error) return { output: '', error: `JSON 格式错误：${parsed.value.error}` }
  try {
    let value: unknown
    if (mode.value === 'path') {
      const matches = queryJsonPath(parsed.value.value, path.value)
      value = matches.length === 1 ? matches[0] : matches
    } else if (mode.value === 'fields') {
      value = extractFields(parsed.value.value, selectedFields.value, preserveStructure.value, removeEmpty.value)
    } else {
      const items = extractKeysOrValues(parsed.value.value, keysMode.value, includeNested.value)
      if (sortResults.value) items.sort((a, b) => String(a).localeCompare(String(b)))
      value = listOutput.value ? items.map(item => String(item ?? 'null')).join('\n') : items
    }
    const output = listOutput.value && mode.value === 'keys' ? String(value) : JSON.stringify(value, null, 2) ?? ''
    return { output, error: '' }
  } catch (error) {
    return { output: '', error: (error as Error).message }
  }
})

function loadExample() {
  input.value = JSON.stringify([
    { id: 1, name: '张三', address: { city: '北京' } },
    { id: 2, name: '李四', address: { city: '上海' } },
  ], null, 2)
  path.value = '$[*].address.city'
}
</script>

<template>
  <div class="tool-workbench">
    
    <section class="tool-workbench__panel">
      <div class="tool-workbench__row">
        <el-radio-group v-model="mode">
          <el-radio-button label="path">JSONPath</el-radio-button>
          <el-radio-button label="fields">字段提取</el-radio-button>
          <el-radio-button label="keys">键值提取</el-radio-button>
        </el-radio-group>
        <el-button @click="loadExample">加载示例</el-button>
        <el-button @click="input = ''">清空</el-button>
      </div>

      <div v-if="mode === 'path'" class="tool-workbench__options">
        <span>路径</span>
        <el-input v-model="path" placeholder="例如 $[*].name 或 $..city" style="max-width: 360px" />
        <el-button v-for="quick in ['$', '$[*]', '$[0]', '$..id']" :key="quick" size="small" @click="path = quick">{{ quick }}</el-button>
      </div>
      <div v-else-if="mode === 'fields'" class="tool-workbench__options">
        <el-checkbox v-model="preserveStructure" label="保留字段层级" />
        <el-checkbox v-model="removeEmpty" label="跳过空值" />
      </div>
      <div v-else class="tool-workbench__options">
        <el-radio-group v-model="keysMode" size="small">
          <el-radio-button label="keys">提取键</el-radio-button>
          <el-radio-button label="values">提取值</el-radio-button>
        </el-radio-group>
        <el-checkbox v-model="includeNested" label="包含嵌套路径" />
        <el-checkbox v-model="sortResults" label="排序" />
        <el-checkbox v-model="listOutput" label="每行一项" />
      </div>

      <div class="tool-workbench__grid">
        <div class="tool-workbench__field">
          <label class="tool-workbench__label">输入 JSON</label>
          <codemirror v-model="input" placeholder="在这里粘贴 JSON" :style="{ height: '340px' }" :extensions="extensions" />
        </div>
        <div class="tool-workbench__field">
          <div class="tool-workbench__row" style="justify-content: space-between; margin-bottom: 9px">
            <span class="tool-workbench__label" style="margin: 0">提取结果</span>
            <el-button size="small" :disabled="!result.output" @click="copy(result.output)">复制结果</el-button>
          </div>
          <pre class="tool-workbench__output">{{ result.output }}</pre>
          <p v-if="result.error" class="tool-workbench__error" role="alert">{{ result.error }}</p>
        </div>
      </div>
      <div v-if="mode === 'fields'" class="field-list">
        <div class="tool-workbench__row" style="margin-bottom: 8px">
          <span class="tool-workbench__label" style="margin: 0">可用字段（{{ availableFields.length }}）</span>
          <el-button size="small" @click="selectedFields = [...availableFields]">全选</el-button>
          <el-button size="small" @click="selectedFields = []">取消全选</el-button>
        </div>
        <el-checkbox-group v-model="selectedFields">
          <el-checkbox v-for="field in availableFields" :key="field" :label="field" />
        </el-checkbox-group>
      </div>
    </section>
    <ToolDetail title="说明"><el-text>支持 JSONPath 字段、数组下标、切片、通配符、递归与条件筛选，也可勾选字段或提取全部键值。输入和结果均在浏览器中处理。</el-text></ToolDetail>
  </div>
</template>

<style scoped>
.field-list { margin-top: 18px; padding: 14px; border: 1px solid var(--app-border); border-radius: 10px; }
.field-list :deep(.el-checkbox-group) { display: flex; flex-wrap: wrap; gap: 0 14px; max-height: 180px; overflow-y: auto; }
.field-list :deep(.el-checkbox) { margin-right: 0; }
</style>
