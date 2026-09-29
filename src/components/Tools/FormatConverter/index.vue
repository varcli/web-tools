<script setup lang="ts">
import { reactive, ref } from 'vue'
import { Codemirror } from 'vue-codemirror'
import type { UploadFile } from 'element-plus'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import { copy } from '@/utils/string'
import { convert, parseSource, type SourceFormat, type TargetFormat } from './convert'
import '../workbench.css'

const formats: { value: SourceFormat; label: string }[] = [
  { value: 'json', label: 'JSON' }, { value: 'yaml', label: 'YAML' },
  { value: 'xml', label: 'XML' }, { value: 'csv', label: 'CSV' },
  { value: 'excel', label: 'Excel' },
]
const targets: { value: TargetFormat; label: string }[] = [...formats, { value: 'sql', label: 'SQL INSERT' }]
const sourceFormat = ref<SourceFormat>('json')
const targetFormat = ref<TargetFormat>('csv')
const input = ref('')
const output = ref('')
const error = ref('')
const excelFile = ref<ArrayBuffer>()
const filename = ref('')
const outputBlob = ref<Blob>()
const options = reactive({ delimiter: ',', indent: 2, includeHeader: true, flatten: true, rootName: 'root', tableName: 'data' })

async function loadFile(file: UploadFile) {
  const raw = file.raw
  if (!raw) return
  filename.value = raw.name
  error.value = ''
  output.value = ''
  outputBlob.value = undefined
  const extension = raw.name.split('.').pop()?.toLowerCase()
  if (extension === 'xlsx' || extension === 'xls') {
    sourceFormat.value = 'excel'
    excelFile.value = await raw.arrayBuffer()
    input.value = ''
  } else {
    excelFile.value = undefined
    if (extension === 'json') sourceFormat.value = 'json'
    else if (extension === 'yaml' || extension === 'yml') sourceFormat.value = 'yaml'
    else if (extension === 'xml') sourceFormat.value = 'xml'
    else if (extension === 'csv') sourceFormat.value = 'csv'
    input.value = await raw.text()
  }
}

function runConversion() {
  output.value = ''
  outputBlob.value = undefined
  error.value = ''
  try {
    const value = parseSource(sourceFormat.value, input.value, options, excelFile.value)
    const result = convert(value, targetFormat.value, options)
    output.value = result.text
    outputBlob.value = result.blob
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : '转换失败'
  }
}

function loadExample() {
  sourceFormat.value = 'json'
  targetFormat.value = 'csv'
  input.value = '[{"id":1,"name":"张三","city":"北京"},{"id":2,"name":"李四","city":"上海"}]'
  excelFile.value = undefined
  filename.value = ''
  output.value = ''
  error.value = ''
}

function download() {
  if (!output.value) return
  const extension = targetFormat.value === 'excel' ? 'xlsx' : targetFormat.value === 'yaml' ? 'yaml' : targetFormat.value
  const blob = outputBlob.value ?? new Blob([output.value], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `converted.${extension}`
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
</script>

<template>
  <div class="tool-workbench">
    
    <section class="tool-workbench__panel">
      <div class="tool-workbench__row">
        <span class="tool-workbench__label" style="margin: 0">从</span>
        <el-select v-model="sourceFormat" style="width: 125px" @change="output = ''; error = ''">
          <el-option v-for="item in formats" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <span class="tool-workbench__label" style="margin: 0">转换为</span>
        <el-select v-model="targetFormat" style="width: 140px" @change="output = ''; error = ''">
          <el-option v-for="item in targets" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <el-upload :auto-upload="false" :show-file-list="false" accept=".json,.yaml,.yml,.xml,.csv,.xlsx,.xls" :on-change="loadFile">
          <el-button>上传文件</el-button>
        </el-upload>
        <el-button @click="loadExample">示例</el-button>
        <el-button @click="input = ''; excelFile = undefined; filename = ''; output = ''; error = ''">清空</el-button>
        <el-button type="primary" @click="runConversion">转换</el-button>
      </div>
      <div class="tool-workbench__options">
        <label>缩进 <el-select v-model="options.indent" style="width: 90px"><el-option label="2 空格" :value="2" /><el-option label="4 空格" :value="4" /></el-select></label>
        <label v-if="sourceFormat === 'csv' || targetFormat === 'csv'">分隔符 <el-input v-model="options.delimiter" style="width: 70px" maxlength="1" /></label>
        <el-checkbox v-if="sourceFormat === 'csv' || targetFormat === 'csv'" v-model="options.includeHeader" label="包含表头" />
        <el-checkbox v-if="['csv', 'excel', 'sql'].includes(targetFormat)" v-model="options.flatten" label="展开嵌套字段" />
        <label v-if="targetFormat === 'xml'">根标签 <el-input v-model="options.rootName" style="width: 120px" /></label>
        <label v-if="targetFormat === 'sql'">表名 <el-input v-model="options.tableName" style="width: 120px" /></label>
      </div>
      <div class="tool-workbench__grid">
        <div class="tool-workbench__field">
          <label class="tool-workbench__label">输入 {{ sourceFormat.toUpperCase() }} <span v-if="filename" class="file-name">· {{ filename }}</span></label>
          <div v-if="sourceFormat === 'excel'" class="file-placeholder">{{ filename || '请上传 .xlsx 或 .xls 文件' }}</div>
          <codemirror v-else v-model="input" placeholder="在这里输入或粘贴内容，也可以上传文件" :style="{ height: '360px' }" />
        </div>
        <div class="tool-workbench__field">
          <div class="tool-workbench__row" style="justify-content: space-between; margin-bottom: 9px">
            <span class="tool-workbench__label" style="margin: 0">转换结果</span>
            <div class="tool-workbench__row" style="margin: 0">
              <el-button size="small" :disabled="!output || targetFormat === 'excel'" @click="copy(output)">复制</el-button>
              <el-button size="small" :disabled="!output" @click="download">下载</el-button>
            </div>
          </div>
          <pre class="tool-workbench__output">{{ output }}</pre>
          <p v-if="error" class="tool-workbench__error" role="alert">{{ error }}</p>
        </div>
      </div>
    </section>
    <ToolDetail title="说明"><el-text>以 JSON 数据结构为中间格式，支持 JSON、YAML、XML、CSV、Excel 读取，并输出为 JSON、YAML、XML、CSV、Excel 或 SQL INSERT。复杂嵌套数据转表格时可以选择展开字段。</el-text></ToolDetail>
  </div>
</template>

<style scoped>
.file-name { color: var(--app-text-muted); font-weight: 400; }
.file-placeholder { display: grid; place-items: center; height: 360px; border: 1px dashed var(--app-border); border-radius: 10px; color: var(--app-text-muted); background: var(--app-surface-muted); }
</style>
