<script setup lang="ts">
import { computed, ref } from 'vue'
import type { UploadFile } from 'element-plus'
import { asBlob } from 'html-docx-js-typescript'
import JSZip from 'jszip'
import TurndownService from 'turndown'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import { markdownToHtml } from '@/components/Tools/HtmlMarkdownConverter/convert'
import { copy } from '@/utils/string'
import { saveBlob } from '@/utils/gif'
import '../workbench.css'

const mode = ref<'mdToWord' | 'wordToMd'>('mdToWord')
const input = ref('# 文档标题\n\n请输入 **Markdown** 内容。')
const filename = ref('文档')
const wordFile = ref<File | null>(null)
const mdOutput = ref('')
const busy = ref(false)
const error = ref('')
const html = computed(() => markdownToHtml(input.value))
const documentHtml = computed(() => `<!doctype html><html><head><meta charset="utf-8"><style>body{font-family:Arial,'Microsoft YaHei',sans-serif;line-height:1.65;color:#222}table{border-collapse:collapse}td,th{border:1px solid #ccc;padding:6px}pre{background:#f3f5f8;padding:12px;white-space:pre-wrap}</style></head><body>${html.value}</body></html>`)
async function download() {
  busy.value = true; error.value = ''
  try {
    const data = await asBlob(documentHtml.value)
    saveBlob(data instanceof Blob ? data : new Blob([new Uint8Array(data)], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }), `${filename.value.trim() || '文档'}.docx`)
  } catch (cause) { error.value = cause instanceof Error ? cause.message : 'Word 文档生成失败' }
  finally { busy.value = false }
}
function loadWord(file: UploadFile) { wordFile.value = file.raw || null; mdOutput.value = ''; error.value = '' }
function downloadMarkdown() { saveBlob(new Blob([mdOutput.value], { type: 'text/markdown;charset=utf-8' }), 'document.md') }
async function embeddedHtml(buffer: ArrayBuffer): Promise<string> {
  const zip = await JSZip.loadAsync(buffer)
  const name = Object.keys(zip.files).find(path => /^word\/.*\.(mht|html?)$/i.test(path))
  if (!name) return ''
  const source = await zip.files[name].async('string')
  if (/\.html?$/i.test(name)) return source
  const part = source.split(/\r?\n------=mhtDocumentPart\r?\n/i)
    .find(section => /Content-Type:\s*text\/html/i.test(section))
  if (!part) return ''
  const separator = /\r?\n\r?\n/.exec(part)
  if (!separator || separator.index === undefined) return ''
  const body = part.slice(separator.index + separator[0].length).split(/\r?\n------=mhtDocumentPart(?:--)?/i)[0].trim()
  if (/Content-Transfer-Encoding:\s*base64/i.test(part.slice(0, separator.index))) {
    const binary = atob(body.replace(/\s/g, ''))
    return new TextDecoder().decode(Uint8Array.from(binary, char => char.charCodeAt(0)))
  }
  if (!/Content-Transfer-Encoding:\s*quoted-printable/i.test(part.slice(0, separator.index))) return body
  const bytes: number[] = []
  const encoder = new TextEncoder()
  const content = body.replace(/=\r?\n/g, '')
  for (let index = 0; index < content.length;) {
    const code = /^=([\da-f]{2})/i.exec(content.slice(index))
    if (code) { bytes.push(parseInt(code[1], 16)); index += 3 }
    else {
      const point = content.codePointAt(index)!
      bytes.push(...encoder.encode(String.fromCodePoint(point)))
      index += point > 0xffff ? 2 : 1
    }
  }
  return new TextDecoder().decode(new Uint8Array(bytes))
}
async function convertWord() {
  if (!wordFile.value) return
  busy.value = true; error.value = ''
  try {
    const mammoth = await import('mammoth')
    const buffer = await wordFile.value.arrayBuffer()
    const result = await mammoth.convertToHtml({ arrayBuffer: buffer })
    const html = result.value.trim() || await embeddedHtml(buffer)
    if (!html) throw new Error('DOCX 中没有可提取的正文')
    const turndown = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' })
    const body = new DOMParser().parseFromString(html, 'text/html').body
    mdOutput.value = turndown.turndown(body)
  } catch (cause) { error.value = cause instanceof Error ? cause.message : 'Word 文档解析失败' }
  finally { busy.value = false }
}
</script>
<template>
  <div class="tool-workbench"><section class="tool-workbench__panel"><div class="tool-workbench__row"><el-radio-group v-model="mode"><el-radio-button label="mdToWord">Markdown → Word</el-radio-button><el-radio-button label="wordToMd">Word → Markdown</el-radio-button></el-radio-group></div><template v-if="mode === 'mdToWord'"><div class="tool-workbench__row"><el-input v-model="filename" placeholder="文件名" style="max-width: 240px" /><el-button type="primary" :loading="busy" @click="download">下载 DOCX</el-button></div><div class="tool-workbench__grid"><div><label class="tool-workbench__label">Markdown</label><el-input v-model="input" type="textarea" :rows="18" /></div><div><label class="tool-workbench__label">预览</label><iframe class="document-preview" :srcdoc="documentHtml" sandbox="" title="Word 内容预览"></iframe></div></div></template><template v-else><div class="tool-workbench__row"><el-upload accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" :auto-upload="false" :show-file-list="false" :on-change="loadWord"><el-button>选择 DOCX</el-button></el-upload><span>{{ wordFile?.name }}</span><el-button type="primary" :disabled="!wordFile" :loading="busy" @click="convertWord">转换</el-button><el-button :disabled="!mdOutput" @click="copy(mdOutput)">复制</el-button><el-button :disabled="!mdOutput" @click="downloadMarkdown">下载 Markdown</el-button></div><pre class="tool-workbench__output">{{ mdOutput }}</pre></template><p v-if="error" class="tool-workbench__error" role="alert">{{ error }}</p></section><ToolDetail title="说明"><el-text>将 Markdown 导出为 DOCX，或从 DOCX 提取正文并转换为 Markdown。复杂排版可能需要手动调整。</el-text></ToolDetail></div>
</template>
<style scoped>.document-preview { box-sizing: border-box; width: 100%; height: 420px; border: 1px solid var(--app-border); border-radius: 10px; background: #fff; }</style>
