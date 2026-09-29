<script setup lang="ts">
import { computed, ref } from 'vue'
import type { UploadFile } from 'element-plus'
import PdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?worker'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import { markdownToHtml } from '@/components/Tools/HtmlMarkdownConverter/convert'
import { copy } from '@/utils/string'
import { saveBlob } from '@/utils/gif'
import '../workbench.css'

const mode = ref<'mdToPdf' | 'pdfToMd'>('mdToPdf')
const input = ref('# 文档标题\n\n请输入 **Markdown** 内容。')
const frame = ref<HTMLIFrameElement | null>(null)
const pdfFile = ref<File | null>(null)
const mdOutput = ref('')
const busy = ref(false)
const error = ref('')
const html = computed(() => `<!doctype html><html><head><meta charset="utf-8"><style>body{font-family:Arial,'Microsoft YaHei',sans-serif;line-height:1.65;color:#222;margin:28px}table{border-collapse:collapse}td,th{border:1px solid #ccc;padding:6px}pre{background:#f3f5f8;padding:12px;white-space:pre-wrap}@page{size:A4;margin:20mm}@media print{body{margin:0}}</style></head><body>${markdownToHtml(input.value)}</body></html>`)
function printPdf() { frame.value?.contentWindow?.focus(); frame.value?.contentWindow?.print() }
function loadPdf(file: UploadFile) { pdfFile.value = file.raw || null; mdOutput.value = ''; error.value = '' }
function downloadMarkdown() { saveBlob(new Blob([mdOutput.value], { type: 'text/markdown;charset=utf-8' }), 'document.md') }
async function convertPdf() {
  if (!pdfFile.value) return
  busy.value = true; error.value = ''; mdOutput.value = ''
  let worker: Worker | null = null
  try {
    const pdfjs = await import('pdfjs-dist')
    worker = new PdfWorker()
    pdfjs.GlobalWorkerOptions.workerPort = worker
    const loadingTask = pdfjs.getDocument({ data: new Uint8Array(await pdfFile.value.arrayBuffer()) })
    const document = await loadingTask.promise
    if (document.numPages > 100) throw new Error('PDF 超过 100 页，请使用较短的文档')
    const pages: string[] = []
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber++) {
      const page = await document.getPage(pageNumber)
      const content = await page.getTextContent()
      const items = content.items.filter((item): item is typeof item & { str: string; transform: number[]; width: number } => 'str' in item)
        .filter(item => item.str.trim())
        .map(item => ({ text: item.str.trim(), x: item.transform[4], y: item.transform[5], size: Math.hypot(item.transform[0], item.transform[1]), width: item.width }))
        .sort((a, b) => Math.abs(a.y - b.y) > 3 ? b.y - a.y : a.x - b.x)
      const sizes = items.map(item => item.size).sort((a, b) => a - b)
      const normal = sizes[Math.floor(sizes.length / 2)] || 12
      const lines: { y: number; size: number; text: string; lastX: number }[] = []
      items.forEach(item => {
        const line = lines[lines.length - 1]
        if (line && Math.abs(line.y - item.y) <= 3) {
          line.text += (item.x - line.lastX > item.size * .35 ? ' ' : '') + item.text
          line.lastX = item.x + item.width
          line.size = Math.max(line.size, item.size)
        } else lines.push({ y: item.y, size: item.size, text: item.text, lastX: item.x + item.width })
      })
      pages.push(lines.map(line => `${line.size > normal * 1.7 ? '# ' : line.size > normal * 1.3 ? '## ' : ''}${line.text}`).join('\n'))
      page.cleanup()
    }
    mdOutput.value = pages.join('\n\n---\n\n')
    await loadingTask.destroy()
  } catch (cause) { error.value = cause instanceof Error ? cause.message : 'PDF 文本提取失败' }
  finally { worker?.terminate(); busy.value = false }
}
</script>
<template>
  <div class="tool-workbench"><section class="tool-workbench__panel"><div class="tool-workbench__row"><el-radio-group v-model="mode"><el-radio-button label="mdToPdf">Markdown → PDF</el-radio-button><el-radio-button label="pdfToMd">PDF → Markdown</el-radio-button></el-radio-group></div><template v-if="mode === 'mdToPdf'"><div class="tool-workbench__row"><el-button type="primary" @click="printPdf">打印 / 保存为 PDF</el-button><span class="tool-workbench__hint">在浏览器打印窗口中选择“另存为 PDF”</span></div><div class="tool-workbench__grid"><div><label class="tool-workbench__label">Markdown</label><el-input v-model="input" type="textarea" :rows="18" /></div><div><label class="tool-workbench__label">A4 预览</label><iframe ref="frame" class="document-preview" :srcdoc="html" title="PDF 内容预览"></iframe></div></div></template><template v-else><div class="tool-workbench__row"><el-upload accept=".pdf,application/pdf" :auto-upload="false" :show-file-list="false" :on-change="loadPdf"><el-button>选择 PDF</el-button></el-upload><span>{{ pdfFile?.name }}</span><el-button type="primary" :disabled="!pdfFile" :loading="busy" @click="convertPdf">提取 Markdown</el-button><el-button :disabled="!mdOutput" @click="copy(mdOutput)">复制</el-button><el-button :disabled="!mdOutput" @click="downloadMarkdown">下载 Markdown</el-button></div><pre class="tool-workbench__output">{{ mdOutput }}</pre></template><p v-if="error" class="tool-workbench__error" role="alert">{{ error }}</p></section><ToolDetail title="说明"><el-text>Markdown 可通过浏览器打印为 PDF；PDF 可提取文本并按行与字号生成 Markdown。扫描件没有可提取的文本。</el-text></ToolDetail></div>
</template>
<style scoped>.document-preview { box-sizing: border-box; width: 100%; height: 420px; border: 1px solid var(--app-border); border-radius: 10px; background: #fff; }</style>
