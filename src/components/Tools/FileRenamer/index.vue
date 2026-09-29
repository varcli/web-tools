<script setup lang="ts">
import { computed, ref } from 'vue'
import type { UploadFile } from 'element-plus'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import { makeZip } from '@/utils/zip'
import '../workbench.css'

interface Item { uid: number; file: File; name: string }
type Mode = 'sequence' | 'replace' | 'prefix' | 'suffix' | 'uppercase' | 'lowercase' | 'slice'
const items = ref<Item[]>([])
const mode = ref<Mode>('sequence')
const prefix = ref('file-')
const suffix = ref('')
const search = ref('')
const replacement = ref('')
const start = ref(1)
const digits = ref(3)
const sliceStart = ref(0)
const sliceLength = ref(10)
const busy = ref(false)
const error = ref('')
const modes: { value: Mode; label: string }[] = [
  { value: 'sequence', label: '序号命名' }, { value: 'replace', label: '查找替换' },
  { value: 'prefix', label: '添加前缀' }, { value: 'suffix', label: '添加后缀' },
  { value: 'uppercase', label: '转大写' }, { value: 'lowercase', label: '转小写' },
  { value: 'slice', label: '截取名称' },
]

function add(file: UploadFile) {
  if (file.raw && !items.value.some(item => item.uid === file.uid)) items.value.push({ uid: file.uid, file: file.raw, name: file.name })
}
const renamed = computed(() => items.value.map((item, index) => {
  const dot = item.name.lastIndexOf('.')
  const stem = dot > 0 ? item.name.slice(0, dot) : item.name
  const extension = dot > 0 ? item.name.slice(dot) : ''
  let name = stem
  if (mode.value === 'sequence') name = `${prefix.value}${String(start.value + index).padStart(digits.value, '0')}`
  else if (mode.value === 'replace') name = search.value ? stem.split(search.value).join(replacement.value) : stem
  else if (mode.value === 'prefix') name = prefix.value + stem
  else if (mode.value === 'suffix') name = stem + suffix.value
  else if (mode.value === 'uppercase') name = stem.toUpperCase()
  else if (mode.value === 'lowercase') name = stem.toLowerCase()
  else if (mode.value === 'slice') name = stem.slice(sliceStart.value, sliceStart.value + sliceLength.value)
  return { ...item, newName: `${name || 'unnamed'}${extension}` }
}))
const hasDuplicates = computed(() => new Set(renamed.value.map(item => item.newName.toLowerCase())).size !== renamed.value.length)

async function downloadZip() {
  if (hasDuplicates.value) { error.value = '存在重复文件名，请调整规则'; return }
  error.value = ''
  busy.value = true
  try {
    const blob = await makeZip(renamed.value.map(item => ({ name: item.newName, content: item.file })))
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'renamed-files.zip'
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 0)
  } catch (cause) { error.value = cause instanceof Error ? cause.message : '打包失败' }
  finally { busy.value = false }
}
</script>

<template>
  <div class="tool-workbench">
    
    <section class="tool-workbench__panel">
      <div class="tool-workbench__row"><el-upload multiple :auto-upload="false" :show-file-list="false" :on-change="add"><el-button>选择文件</el-button></el-upload><el-button @click="items = []; error = ''">清空列表</el-button><el-button type="primary" :loading="busy" :disabled="!items.length || hasDuplicates" @click="downloadZip">下载重命名后的 ZIP</el-button></div>
      <div class="tool-workbench__options"><span>规则</span><el-select v-model="mode" style="width: 150px"><el-option v-for="item in modes" :key="item.value" :label="item.label" :value="item.value" /></el-select>
        <template v-if="mode === 'sequence'"><span>前缀</span><el-input v-model="prefix" style="width: 120px" /><span>起始</span><el-input-number v-model="start" :min="0" style="width: 105px" /><span>位数</span><el-input-number v-model="digits" :min="1" :max="10" style="width: 105px" /></template>
        <template v-else-if="mode === 'replace'"><span>查找</span><el-input v-model="search" style="width: 130px" /><span>替换为</span><el-input v-model="replacement" style="width: 130px" /></template>
        <template v-else-if="mode === 'prefix'"><span>前缀</span><el-input v-model="prefix" style="width: 140px" /></template>
        <template v-else-if="mode === 'suffix'"><span>后缀</span><el-input v-model="suffix" style="width: 140px" /></template>
        <template v-else-if="mode === 'slice'"><span>起点</span><el-input-number v-model="sliceStart" :min="0" style="width: 105px" /><span>长度</span><el-input-number v-model="sliceLength" :min="1" style="width: 105px" /></template>
      </div>
      <p v-if="hasDuplicates" class="tool-workbench__error">存在重复的新文件名，请调整规则。</p>
      <p v-if="error" class="tool-workbench__error" role="alert">{{ error }}</p>
      <el-table :data="renamed" empty-text="请选择需要重命名的文件" max-height="480">
        <el-table-column prop="name" label="原文件名" min-width="200" />
        <el-table-column prop="newName" label="新文件名" min-width="200" />
      </el-table>
    </section>
    <ToolDetail title="说明"><el-text>可批量按序号、替换、前后缀、大小写或截取规则重命名。预览确认后，将重命名后的文件打包下载；原始文件不会被修改。</el-text></ToolDetail>
  </div>
</template>
