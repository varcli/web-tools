<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Download, Fold, Moon, Search, Sunny } from '@element-plus/icons-vue'
import { useToolsStore } from '@/store/modules/tools'
import { useComponentStore } from '@/store/modules/component'
import type { ToolsInfo } from '@/components/Tools/tools.type'
import { applyThemeColor, readStoredColor, THEME_COLORS } from '@/utils/theme'

const router = useRouter()
const toolsStore = useToolsStore()
const componentStore = useComponentStore()
const isDark = ref(document.documentElement.classList.contains('dark'))
const themeColor = ref(readStoredColor())
const colorPanel = ref(false)
const customColor = ref(themeColor.value)

const normalizeHex = (input: string) => {
  const value = String(input || '').trim().replace(/^#/, '')
  if (/^[0-9a-fA-F]{3}$/.test(value)) return `#${value.split('').map(c => c + c).join('').toLowerCase()}`
  if (/^[0-9a-fA-F]{6}$/.test(value)) return `#${value.toLowerCase()}`
  return ''
}
const selectColor = (value: string) => {
  themeColor.value = applyThemeColor(value, isDark.value)
  customColor.value = themeColor.value
  colorPanel.value = false
}
const applyCustomColor = (value: string | null) => {
  const normalized = normalizeHex(value || '')
  if (!normalized) return
  themeColor.value = applyThemeColor(normalized, isDark.value)
  colorPanel.value = false
}
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
  // 明暗切换后重算主色派生色，暗色下主色需提亮
  applyThemeColor(themeColor.value, isDark.value)
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
      <el-popover v-model:visible="colorPanel" placement="bottom" :width="224" trigger="click" popper-class="theme-color-popover">
        <template #reference>
          <button class="icon-button color-button" type="button" aria-label="切换主题色" title="切换主题色">
            <svg class="color-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M12 3a9 9 0 1 0 0 18c1.2 0 1.8-.8 1.8-1.6 0-.5-.2-.8-.5-1.1-.3-.3-.5-.7-.5-1.1 0-.9.7-1.6 1.6-1.6h1.7A4.9 4.9 0 0 0 21 11c0-1.5-.6-2.9-1.6-4" />
              <circle cx="7.6" cy="11.2" r="1.25" fill="currentColor" stroke="none" />
              <circle cx="10.2" cy="7.4" r="1.25" fill="currentColor" stroke="none" />
              <circle cx="14.6" cy="7.6" r="1.25" fill="currentColor" stroke="none" />
            </svg>
          </button>
        </template>
        <div class="theme-color-panel">
          <p class="theme-color-panel__title">主题色</p>
          <div class="theme-color-panel__swatches">
            <button v-for="item in THEME_COLORS" :key="item.value" type="button" class="theme-swatch"
              :class="{ 'is-active': themeColor === item.value }" :style="{ background: item.value }"
              :title="item.name" :aria-label="item.name" @click="selectColor(item.value)"></button>
          </div>
          <div class="theme-color-panel__custom">
            <el-color-picker v-model="customColor" size="small" :predefine="THEME_COLORS.map(item => item.value)" @change="applyCustomColor" />
            <span>自定义颜色</span>
          </div>
        </div>
      </el-popover>
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
.color-button { color: var(--el-color-primary); }
.color-icon { display: block; width: 22px; height: 22px; }
.theme-color-panel__title { margin: 0 0 10px; color: var(--app-text-muted); font-size: 12px; font-weight: 600; }
.theme-color-panel__swatches { display: grid; grid-template-columns: repeat(8, 1fr); gap: 8px; }
.theme-swatch { width: 100%; aspect-ratio: 1; padding: 0; border: 2px solid transparent; border-radius: 8px; cursor: pointer; transition: transform .15s ease, box-shadow .15s ease; }
.theme-swatch:hover { transform: scale(1.08); }
.theme-swatch.is-active { border-color: var(--app-text); box-shadow: 0 0 0 2px var(--app-surface) inset; }
.theme-swatch:focus-visible { outline: 2px solid var(--el-color-primary); outline-offset: 2px; }
.theme-color-panel__custom { display: flex; align-items: center; gap: 10px; margin-top: 14px; padding-top: 12px; border-top: 1px solid var(--app-border); color: var(--app-text-muted); font-size: 13px; }

@media (max-width: 1100px) { .topbar { gap: 13px; }.topbar-actions { gap: 5px; } }
@media (max-width: 700px) { .topbar { padding: 0 2px; height: 64px; gap: 12px; }.tool-search :deep(.el-select__wrapper) { min-height: 39px; } }
</style>
