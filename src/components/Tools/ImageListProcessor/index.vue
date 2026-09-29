<script setup lang="ts">
import { computed, ref } from 'vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import { copy } from '@/utils/string'
import { makeZip } from '@/utils/zip'
import '../workbench.css'

const input = ref('')
const busy = ref(false)
const message = ref('')
const images = computed(() => [...new Set(input.value.split(/\r?\n/).map(line => line.trim()).filter(line => /^https?:\/\//i.test(line)))].map((url, index) => {
  let name = `image-${index + 1}.png`
  try { name = decodeURIComponent(new URL(url).pathname.split('/').pop() || name) } catch { /* keep generated name */ }
  name = name.replace(/[<>:"/\\|?*\x00-\x1f]/g, '_')
  return { url, name }
}))

function save(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}

async function downloadZip() {
  busy.value = true
  message.value = ''
  const entries: { name: string; content: Blob }[] = []
  let failed = 0
  try {
    for (const [index, item] of images.value.entries()) {
      try {
        const response = await fetch(item.url)
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const name = item.name.replace(/(\.[^.]+)?$/, `_${index + 1}$1`)
        entries.push({ name, content: await response.blob() })
      } catch { failed++ }
    }
    if (entries.length) save(await makeZip(entries), 'images.zip')
    message.value = entries.length ? `已打包 ${entries.length} 张图片${failed ? `，${failed} 张因跨域或网络问题未能下载` : ''}` : '图片均无法读取，请检查地址或改用下载脚本'
  } catch (cause) { message.value = cause instanceof Error ? cause.message : '下载失败' }
  finally { busy.value = false }
}

function exportScript(kind: 'powershell' | 'bash') {
  const quote = (value: string) => `'${value.replace(/'/g, kind === 'powershell' ? "''" : "'\\''")}'`
  const lines = images.value.map((item, index) => {
    const name = item.name.replace(/(\.[^.]+)?$/, `_${index + 1}$1`)
    return kind === 'powershell'
      ? `Invoke-WebRequest -Uri ${quote(item.url)} -OutFile ${quote(name)}`
      : `curl -L --fail --output ${quote(name)} ${quote(item.url)}`
  })
  save(new Blob([`${kind === 'bash' ? '#!/usr/bin/env bash\nset -e\n' : ''}${lines.join('\n')}\n`], { type: 'text/plain' }), kind === 'bash' ? 'download-images.sh' : 'download-images.ps1')
}
</script>

<template>
  <div class="tool-workbench">
    
    <section class="tool-workbench__panel">
      <label class="tool-workbench__label">图片 URL 列表（{{ images.length }} 张）</label>
      <el-input v-model="input" type="textarea" :rows="8" placeholder="每行一条 http:// 或 https:// 图片地址，重复地址会自动去重" />
      <div class="tool-workbench__row" style="margin-top: 16px">
        <el-button type="primary" :loading="busy" :disabled="!images.length" @click="downloadZip">下载 ZIP</el-button>
        <el-button :disabled="!images.length" @click="exportScript('powershell')">Windows 脚本</el-button>
        <el-button :disabled="!images.length" @click="exportScript('bash')">Linux 脚本</el-button>
        <el-button :disabled="!images.length" @click="copy(images.map(item => item.url).join('\n'))">复制地址</el-button>
        <el-button @click="input = ''; message = ''">清空</el-button>
      </div>
      <p v-if="message" class="tool-workbench__hint">{{ message }}</p>
      <div class="image-grid"><div v-for="item in images" :key="item.url" class="image-card"><img :src="item.url" :alt="item.name" referrerpolicy="no-referrer" loading="lazy" /><strong :title="item.name">{{ item.name }}</strong><small :title="item.url">{{ item.url }}</small></div></div>
    </section>
    <ToolDetail title="说明"><el-text>输入图片地址后可预览、去重并打包下载；若目标网站限制跨域访问，可导出 PowerShell 或 Bash 下载脚本。</el-text></ToolDetail>
  </div>
</template>

<style scoped>
.image-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; }
.image-card { min-width: 0; padding: 10px; border: 1px solid var(--app-border); border-radius: 10px; color: var(--app-text); }
.image-card img { display: block; width: 100%; height: 130px; object-fit: contain; background: var(--app-surface-muted); border-radius: 6px; }
.image-card strong, .image-card small { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-top: 6px; }
.image-card small { color: var(--app-text-muted); }
</style>
