<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Download, Fold, Moon, Search, Sunny } from '@element-plus/icons-vue'
import { useToolsStore } from '@/store/modules/tools'
import { useComponentStore } from '@/store/modules/component'
import type { ToolsInfo } from '@/components/Tools/tools.type'

const router = useRouter()
const toolsStore = useToolsStore()
const componentStore = useComponentStore()
const isDark = ref(document.documentElement.classList.contains('dark'))
const searchValue = ref('')
const options = ref<ToolsInfo[]>([])
const loading = ref(false)
const searchTools = async (query: string) => {
  options.value = []
  if (!query) return
  loading.value = true
  try { options.value = await toolsStore.getTools({ cateId: 0, title: query, route: '' }) }
  finally { loading.value = false }
}
const chooseTool = (url: string) => { searchValue.value = ''; router.push(url) }
const toggleMenu = () => {
  if (window.innerWidth < 992) componentStore.setleftComDrawerStatus(!componentStore.leftComDrawer)
  else componentStore.setLeftComStatus(!componentStore.leftCom)
}
const createUrlShortcut = () => {
  const blob = new Blob(['[InternetShortcut]\nURL=' + encodeURI(window.location.href)], { type: 'text/plain' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = 'Web-Tools.url'
  link.click()
  URL.revokeObjectURL(link.href)
}
const toggleTheme = () => {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
  document.body.classList.toggle('dark-theme', isDark.value)
  try { localStorage.setItem('web-tools-theme', isDark.value ? 'dark' : 'light') } catch { /* storage is optional */ }
}
</script>

<template>
  <header class="topbar">
    <div class="topbar-leading">
      <button class="icon-button menu-button" type="button" aria-label="切换菜单" @click="toggleMenu"><el-icon><Fold /></el-icon></button>
    </div>
    <el-select v-model="searchValue" class="tool-search" filterable remote clearable reserve-keyword
      :remote-method="searchTools" :loading="loading" placeholder="输入关键词搜索，如文本、json、图片等">
      <template #prefix><el-icon><Search /></el-icon></template>
      <el-option v-for="item in options" :key="item.url" :label="item.title + ' · ' + item.desc" :value="item.url" @click="chooseTool(item.url)" />
    </el-select>
    <div class="topbar-actions">
      <button class="icon-button theme-button" type="button" aria-label="切换主题" title="切换主题" @click="toggleTheme"><el-icon><Moon v-if="isDark" /><Sunny v-else /></el-icon></button>
      <el-tooltip content="保存到桌面" placement="bottom">
        <button type="button" class="icon-button save-button" aria-label="保存到桌面" @click="createUrlShortcut"><el-icon><Download /></el-icon></button>
      </el-tooltip>
    </div>
  </header>
</template>

<style scoped>
.topbar { width: 100%; box-sizing: border-box; height: 76px; display: flex; align-items: center; gap: 26px; padding: 0 20px 0 8px; }
.topbar-leading { display: flex; align-items: center; flex: none; }
.icon-button { width: 34px; height: 38px; border: 0; background: none; color: var(--app-text-muted); display: inline-flex; justify-content: center; align-items: center; cursor: pointer; font-size: 22px; }
.icon-button:hover { color: var(--el-color-primary); }
.icon-button:focus-visible { outline: 2px solid var(--el-color-primary); outline-offset: 2px; border-radius: 8px; }
.tool-search { width: 420px; min-width: 0; flex: 0 1 420px; }.tool-search :deep(.el-select__wrapper) { min-height: 42px; border-radius: 13px; padding-left: 15px; background: var(--app-surface); box-shadow: 0 4px 16px rgba(82,112,171,.09); border: 1px solid var(--app-border); }.tool-search :deep(.el-select__prefix) { color: var(--app-text-muted); font-size: 18px; }
.topbar-actions { display: flex; align-items: center; gap: 8px; flex: none; margin-left: auto; }

@media (max-width: 1100px) { .topbar { gap: 13px; }.topbar-actions { gap: 5px; } }
@media (max-width: 700px) { .topbar { padding: 0 2px; height: 64px; gap: 12px; }.tool-search :deep(.el-select__wrapper) { min-height: 39px; } }
</style>
