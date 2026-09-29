<script setup lang="ts">
import { computed, ref } from 'vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import { copy } from '@/utils/string'
import { generateRecords, recordsAsDelimited, validateIdCard, type Field } from './mock'
import '../workbench.css'

const fields: { value: Field; label: string }[] = [
  { value: 'name', label: '姓名' }, { value: 'phone', label: '手机号' },
  { value: 'idcard', label: '身份证号' }, { value: 'email', label: '邮箱' },
  { value: 'address', label: '地址' }, { value: 'company', label: '公司' },
]
const selected = ref<Field[]>(['name', 'phone', 'idcard', 'email'])
const count = ref(10)
const records = ref<Record<string, string>[]>([])
const outputFormat = ref<'json' | 'csv' | 'tsv'>('json')
const idInput = ref('')
const validation = computed(() => idInput.value ? validateIdCard(idInput.value) : null)
const output = computed(() => outputFormat.value === 'json' ? JSON.stringify(records.value, null, 2) : recordsAsDelimited(records.value, selected.value, outputFormat.value === 'csv' ? ',' : '\t'))

function run() { records.value = selected.value.length ? generateRecords(selected.value, count.value) : [] }
function download() {
  if (!records.value.length) return
  const url = URL.createObjectURL(new Blob([output.value], { type: 'text/plain;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `mock-data.${outputFormat.value}`
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
run()
</script>

<template>
  <div class="tool-workbench">
    
    <section class="tool-workbench__panel">
      <el-tabs>
        <el-tab-pane label="数据生成">
          <div class="tool-workbench__options"><span>字段</span><el-checkbox-group v-model="selected"><el-checkbox v-for="field in fields" :key="field.value" :label="field.value">{{ field.label }}</el-checkbox></el-checkbox-group></div>
          <div class="tool-workbench__row"><span>数量</span><el-input-number v-model="count" :min="1" :max="1000" style="width: 120px" /><span>格式</span><el-select v-model="outputFormat" style="width: 100px"><el-option label="JSON" value="json" /><el-option label="CSV" value="csv" /><el-option label="TSV" value="tsv" /></el-select><el-button type="primary" :disabled="!selected.length" @click="run">生成</el-button><el-button :disabled="!records.length" @click="copy(output)">复制</el-button><el-button :disabled="!records.length" @click="download">下载</el-button></div>
          <pre class="tool-workbench__output" style="max-height: 440px">{{ output }}</pre>
        </el-tab-pane>
        <el-tab-pane label="身份证校验"><label class="tool-workbench__label">身份证号码</label><el-input v-model="idInput" placeholder="输入 18 位身份证号码" style="max-width: 360px" /><p v-if="validation"><el-tag :type="validation.valid ? 'success' : 'danger'">{{ validation.message }}</el-tag></p></el-tab-pane>
      </el-tabs>
    </section>
    <ToolDetail title="说明"><el-text>生成姓名、手机号、身份证号、邮箱、地址和公司名等测试数据，支持 JSON、CSV、TSV 导出。数据随机生成，仅用于开发测试。</el-text></ToolDetail>
  </div>
</template>
