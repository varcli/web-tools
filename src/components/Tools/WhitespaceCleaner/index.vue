<script setup lang="ts">
import { ref } from 'vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import { copy } from '@/utils/string'
import '../workbench.css'

type Mode = 'trim' | 'lineTrim' | 'collapse' | 'blankLines' | 'allSpaces' | 'newlines'
const modes: { value: Mode; label: string }[] = [
  { value: 'trim', label: '去除首尾空白' },
  { value: 'lineTrim', label: '去除每行首尾空白' },
  { value: 'collapse', label: '合并连续空格' },
  { value: 'blankLines', label: '去除空行' },
  { value: 'allSpaces', label: '去除所有空白字符' },
  { value: 'newlines', label: '去除换行符' },
]
const selected = ref<Mode[]>(['lineTrim', 'blankLines'])
const input = ref('')
const output = ref('')

function clean() {
  let value = input.value
  if (selected.value.includes('lineTrim')) value = value.split(/\r?\n/).map(line => line.trim()).join('\n')
  if (selected.value.includes('collapse')) value = value.replace(/[^\S\r\n]{2,}/g, ' ')
  if (selected.value.includes('blankLines')) value = value.split('\n').filter(line => line.trim()).join('\n')
  if (selected.value.includes('newlines')) value = value.replace(/\r?\n/g, '')
  if (selected.value.includes('allSpaces')) value = value.replace(/\s/g, '')
  if (selected.value.includes('trim')) value = value.trim()
  output.value = value
}
</script>

<template>
  <div class="tool-workbench">
    
    <section class="tool-workbench__panel">
      <el-checkbox-group v-model="selected" class="clean-options">
        <el-checkbox v-for="mode in modes" :key="mode.value" :label="mode.value">{{ mode.label }}</el-checkbox>
      </el-checkbox-group>
      <div class="tool-workbench__row">
        <el-button type="primary" @click="clean">开始清理</el-button>
        <el-button @click="copy(output)" :disabled="!output">复制结果</el-button>
        <el-button @click="input = ''; output = ''">清空</el-button>
      </div>
      <div class="tool-workbench__grid">
        <div class="tool-workbench__field"><label class="tool-workbench__label">原始文本</label><el-input v-model="input" type="textarea" :rows="14" placeholder="粘贴需要清理的文本" /></div>
        <div class="tool-workbench__field"><label class="tool-workbench__label">清理结果</label><pre class="tool-workbench__output">{{ output }}</pre></div>
      </div>
    </section>
    <ToolDetail title="说明"><el-text>可组合使用首尾空白、逐行空白、连续空格、空行、全部空白和换行符清理。所有处理均在浏览器中完成。</el-text></ToolDetail>
  </div>
</template>

<style scoped>
.clean-options { display: flex; flex-wrap: wrap; gap: 0 16px; margin-bottom: 16px; }
.clean-options :deep(.el-checkbox) { margin-right: 0; }
</style>
