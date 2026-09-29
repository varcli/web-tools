<script setup lang="ts">
import { ref } from 'vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import { copy } from '@/utils/string'
import { htmlToMarkdown, markdownToHtml } from './convert'
import '../workbench.css'

const direction = ref<'htmlToMarkdown' | 'markdownToHtml'>('htmlToMarkdown')
const input = ref('')
const output = ref('')
const error = ref('')
function run() {
  error.value = ''
  try { output.value = direction.value === 'htmlToMarkdown' ? htmlToMarkdown(input.value) : markdownToHtml(input.value) }
  catch (cause) { error.value = cause instanceof Error ? cause.message : '转换失败' }
}
function swap() {
  input.value = output.value || input.value
  direction.value = direction.value === 'htmlToMarkdown' ? 'markdownToHtml' : 'htmlToMarkdown'
  output.value = ''
}
</script>
<template>
  <div class="tool-workbench"><section class="tool-workbench__panel">
    <div class="tool-workbench__row"><el-radio-group v-model="direction"><el-radio-button label="htmlToMarkdown">HTML → Markdown</el-radio-button><el-radio-button label="markdownToHtml">Markdown → HTML</el-radio-button></el-radio-group><el-button @click="swap">交换方向</el-button><el-button type="primary" @click="run">转换</el-button><el-button :disabled="!output" @click="copy(output)">复制结果</el-button></div>
    <div class="tool-workbench__grid"><div><label class="tool-workbench__label">输入</label><el-input v-model="input" type="textarea" :rows="16" :placeholder="direction === 'htmlToMarkdown' ? '粘贴 HTML' : '粘贴 Markdown'" /></div><div><label class="tool-workbench__label">结果</label><pre class="tool-workbench__output">{{ output }}</pre></div></div><p v-if="error" class="tool-workbench__error" role="alert">{{ error }}</p>
  </section><ToolDetail title="说明"><el-text>转换标题、段落、列表、链接、图片、代码块和表格。转换过程在浏览器本地完成。</el-text></ToolDetail></div>
</template>
