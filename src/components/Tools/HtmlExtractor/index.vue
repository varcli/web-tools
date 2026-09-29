<script setup lang="ts">
import { computed, ref } from 'vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import { copy } from '@/utils/string'
import '../workbench.css'

interface Resource { type: string; value: string }
const html = ref('')
const baseUrl = ref('')
const category = ref('全部')
const resources = ref<Resource[]>([])
const error = ref('')
const categories = ['全部', '图片', '链接', '视频', '音频', 'CSS', 'JavaScript', 'Iframe', 'Meta']
const visible = computed(() => category.value === '全部' ? resources.value : resources.value.filter(item => item.type === category.value))
const asText = computed(() => visible.value.map(item => item.value).join('\n'))

function extract() {
  error.value = ''
  resources.value = []
  if (!html.value.trim()) { error.value = '请先输入 HTML'; return }
  try {
    if (baseUrl.value) new URL(baseUrl.value)
    const doc = new DOMParser().parseFromString(html.value, 'text/html')
    const seen = new Set<string>()
    const add = (type: string, raw: string | null) => {
      const value = raw?.trim()
      if (!value) return
      let resolved = value
      if (baseUrl.value && !value.startsWith('data:')) {
        try { resolved = new URL(value, baseUrl.value).href } catch { /* keep original */ }
      }
      const key = `${type}\u0000${resolved}`
      if (!seen.has(key)) { resources.value.push({ type, value: resolved }); seen.add(key) }
    }
    doc.querySelectorAll('img[src], source[srcset]').forEach(node => add('图片', node.getAttribute('src') ?? node.getAttribute('srcset')?.split(',')[0]?.trim().split(/\s+/)[0] ?? null))
    doc.querySelectorAll('a[href]').forEach(node => add('链接', node.getAttribute('href')))
    doc.querySelectorAll('video[src], video source[src]').forEach(node => add('视频', node.getAttribute('src')))
    doc.querySelectorAll('audio[src], audio source[src]').forEach(node => add('音频', node.getAttribute('src')))
    doc.querySelectorAll('link[rel="stylesheet"][href]').forEach(node => add('CSS', node.getAttribute('href')))
    doc.querySelectorAll('script[src]').forEach(node => add('JavaScript', node.getAttribute('src')))
    doc.querySelectorAll('iframe[src]').forEach(node => add('Iframe', node.getAttribute('src')))
    doc.querySelectorAll('meta[name], meta[property]').forEach(node => add('Meta', `${node.getAttribute('name') ?? node.getAttribute('property')}: ${node.getAttribute('content') ?? ''}`))
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : '提取失败'
  }
}
</script>

<template>
  <div class="tool-workbench">
    
    <section class="tool-workbench__panel">
      <div class="tool-workbench__row">
        <span class="tool-workbench__label" style="margin: 0">页面地址（可选）</span>
        <el-input v-model="baseUrl" placeholder="用于将相对地址补全，如 https://example.com/page" style="max-width: 440px" />
        <el-button type="primary" @click="extract">提取资源</el-button>
        <el-button @click="html = ''; resources = []; error = ''">清空</el-button>
      </div>
      <label class="tool-workbench__label">HTML 源码</label>
      <el-input v-model="html" type="textarea" :rows="10" placeholder="粘贴 HTML 源码" />
      <p v-if="error" class="tool-workbench__error" role="alert">{{ error }}</p>
      <div class="tool-workbench__row" style="margin-top: 18px">
        <span class="tool-workbench__label" style="margin: 0">结果（{{ visible.length }}）</span>
        <el-select v-model="category" style="width: 150px"><el-option v-for="item in categories" :key="item" :label="item" :value="item" /></el-select>
        <el-button :disabled="!visible.length" @click="copy(asText)">复制列表</el-button>
      </div>
      <el-table :data="visible" max-height="420" empty-text="暂无资源">
        <el-table-column prop="type" label="类型" width="130" />
        <el-table-column prop="value" label="内容" min-width="300" show-overflow-tooltip />
        <el-table-column label="操作" width="80"><template #default="scope"><el-button link type="primary" @click="copy(scope.row.value)">复制</el-button></template></el-table-column>
      </el-table>
    </section>
    <ToolDetail title="说明"><el-text>从粘贴的 HTML 中提取图片、链接、视频、音频、CSS、JavaScript、Iframe 和 Meta 内容。填写页面地址可补全相对资源路径。</el-text></ToolDetail>
  </div>
</template>
