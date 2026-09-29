<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, ArrowRight, Close, House, MoreFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { toolsList } from '@/components/Tools/tools'
import { normalizeToolPath, isToolRouteName } from '@/router/toolTabs'
import { useToolTabsStore, type ToolTab } from '@/store/modules/toolTabs'
import { useToolsStore } from '@/store/modules/tools'

const emit = defineEmits<{ refresh: [path: string] }>()
const route = useRoute()
const router = useRouter()
const tabsStore = useToolTabsStore()
const toolsStore = useToolsStore()
const menu = reactive({ visible: false, path: '/', x: 0, y: 0 })
const menuElement = ref<HTMLElement | null>(null)
const scroller = ref<HTMLElement | null>(null)
const overflow = reactive({ left: false, right: false })
const activePath = computed(() => route.path === '/' ? '/' : normalizeToolPath(route.path))
const catalog = new Map<string, ReturnType<typeof toolsList>[number]>()
toolsList().forEach(tool => { const path = normalizeToolPath(tool.url); if (!catalog.has(path)) catalog.set(path, tool) })
const targetTab = computed(() => tabsStore.tabs.find(tab => tab.path === menu.path))
const targetIndex = computed(() => tabsStore.tabs.findIndex(tab => tab.path === menu.path))

watch(() => route.fullPath, async () => {
  tabsStore.syncRoute(route)
  menu.visible = false
  await nextTick()
  const active = scroller.value?.querySelector<HTMLElement>('.tool-tabbar__tab.is-active')
  if (active && scroller.value) {
    const area = scroller.value.getBoundingClientRect()
    const item = active.getBoundingClientRect()
    if (item.left < area.left) scroller.value.scrollLeft += item.left - area.left - 8
    else if (item.right > area.right) scroller.value.scrollLeft += item.right - area.right + 8
  }
  syncOverflow()
}, { immediate: true })

watch(() => tabsStore.tabs.length, async () => { await nextTick(); syncOverflow() })

function syncOverflow() {
  const element = scroller.value
  if (!element) return
  overflow.left = element.scrollLeft > 1
  overflow.right = element.scrollLeft + element.clientWidth < element.scrollWidth - 1
}
function scrollTabs(direction: -1 | 1) {
  scroller.value?.scrollBy({ left: direction * Math.max(150, (scroller.value?.clientWidth || 0) * .8), behavior: 'smooth' })
}
let resizeObserver: ResizeObserver | undefined

function closeMenu(event: Event) {
  if (menuElement.value?.contains(event.target as Node)) return
  menu.visible = false
}
function onKeyDown(event: KeyboardEvent) { if (event.key === 'Escape') menu.visible = false }
onMounted(() => {
  toolsStore.loadCollectedTools()
  tabsStore.pruneUnknown(new Set(router.getRoutes().filter(item => isToolRouteName(item.name)).map(item => String(item.name))))
  resizeObserver = new ResizeObserver(syncOverflow)
  if (scroller.value) resizeObserver.observe(scroller.value)
  syncOverflow()
  window.addEventListener('pointerdown', closeMenu)
  window.addEventListener('keydown', onKeyDown)
})
onBeforeUnmount(() => { resizeObserver?.disconnect(); window.removeEventListener('pointerdown', closeMenu); window.removeEventListener('keydown', onKeyDown) })

async function showMenuAt(path: string, x: number, y: number) {
  menu.path = path
  menu.x = x
  menu.y = y
  menu.visible = true
  await nextTick()
  const rect = menuElement.value?.getBoundingClientRect()
  if (rect) {
    menu.x = Math.max(8, Math.min(menu.x, window.innerWidth - rect.width - 8))
    menu.y = Math.max(8, Math.min(menu.y, window.innerHeight - rect.height - 8))
  }
}
function showMenu(event: MouseEvent, path: string) {
  event.preventDefault()
  event.stopPropagation()
  showMenuAt(path, event.clientX, event.clientY)
}
function showButtonMenu(event: MouseEvent, path: string) {
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  showMenuAt(path, rect.right - 4, rect.bottom + 4)
}
function open(tab: ToolTab) { router.push(tab.fullPath) }

async function removeTabs(paths: string[], preferred?: string) {
  if (!paths.length) return
  const removed = new Set(paths)
  if (removed.has(activePath.value)) {
    const currentIndex = tabsStore.tabs.findIndex(tab => tab.path === activePath.value)
    const survivors = tabsStore.tabs.filter(tab => !removed.has(tab.path))
    const next = (preferred && survivors.find(tab => tab.path === preferred)) || survivors[Math.min(Math.max(currentIndex - 1, 0), survivors.length - 1)]
    await router.push(next?.fullPath || '/')
  }
  tabsStore.remove(paths)
  menu.visible = false
}
function closeTab(path: string) { removeTabs([path]) }
function closeOthers() { removeTabs(tabsStore.tabs.filter(tab => tab.path !== menu.path).map(tab => tab.path), menu.path) }
function closeLeft() { removeTabs(tabsStore.tabs.slice(0, targetIndex.value).map(tab => tab.path), menu.path) }
function closeRight() { removeTabs(tabsStore.tabs.slice(targetIndex.value + 1).map(tab => tab.path), menu.path) }
function closeAll() { removeTabs(tabsStore.tabs.map(tab => tab.path)) }

function toggleFavorite() {
  const tool = catalog.get(menu.path)
  if (!tool) return
  if (toolsStore.isCollected(tool.url)) {
    toolsStore.removeCollect(tool.url)
    ElMessage.success('已取消收藏')
  } else {
    toolsStore.addCollect(tool)
    ElMessage.success('已收藏')
  }
  menu.visible = false
}
async function copyLink() {
  const fullPath = targetTab.value?.fullPath || '/'
  try {
    await navigator.clipboard.writeText(new URL(fullPath, window.location.origin).href)
    ElMessage.success('链接已复制')
  } catch { ElMessage.error('复制失败，请检查浏览器剪贴板权限') }
  menu.visible = false
}
function refresh() {
  if (menu.path === '/') {
    menu.visible = false
    router.push('/')
    return
  }
  emit('refresh', menu.path)
  menu.visible = false
}
</script>

<template>
  <nav class="tool-tabbar" aria-label="已打开的工具">
    <button class="tool-tabbar__home" :class="{ 'is-active': activePath === '/' }" type="button" aria-label="全部工具" title="全部工具" :aria-current="activePath === '/' ? 'page' : undefined" @click="router.push('/')" @contextmenu="showMenu($event, '/')">
      <el-icon><House /></el-icon>
    </button>
    <button v-if="overflow.left || overflow.right" class="tool-tabbar__scroll-button" type="button" aria-label="向左滚动标签" :disabled="!overflow.left" @click="scrollTabs(-1)"><el-icon><ArrowLeft /></el-icon></button>
    <div ref="scroller" class="tool-tabbar__scroller" @scroll="syncOverflow">
      <div v-for="tab in tabsStore.tabs" :key="tab.path" class="tool-tabbar__tab" :class="{ 'is-active': activePath === tab.path }" @contextmenu="showMenu($event, tab.path)" @auxclick.middle.prevent="closeTab(tab.path)">
        <button class="tool-tabbar__select" type="button" :title="tab.title" :aria-current="activePath === tab.path ? 'page' : undefined" @click="open(tab)">
          <img v-if="tab.logo" :src="tab.logo" alt="" /><span>{{ tab.title }}</span>
        </button>
        <button class="tool-tabbar__icon-button tool-tabbar__more" type="button" :aria-label="`${tab.title} 更多操作`" @click="showButtonMenu($event, tab.path)"><el-icon><MoreFilled /></el-icon></button>
        <button class="tool-tabbar__icon-button tool-tabbar__close" type="button" :aria-label="`关闭 ${tab.title}`" @click.stop="closeTab(tab.path)"><el-icon><Close /></el-icon></button>
      </div>
    </div>
    <button v-if="overflow.left || overflow.right" class="tool-tabbar__scroll-button" type="button" aria-label="向右滚动标签" :disabled="!overflow.right" @click="scrollTabs(1)"><el-icon><ArrowRight /></el-icon></button>
    <button class="tool-tabbar__scroll-button" type="button" aria-label="标签操作" title="标签操作" @click="showButtonMenu($event, activePath)"><el-icon><MoreFilled /></el-icon></button>
    <Teleport to="body">
      <div v-if="menu.visible" ref="menuElement" class="tool-tabbar__menu" role="menu" :style="{ left: `${menu.x}px`, top: `${menu.y}px` }" @contextmenu.prevent>
        <div class="tool-tabbar__menu-title">{{ targetTab?.title || '全部工具' }}</div>
        <button v-if="targetTab && catalog.get(menu.path)" role="menuitem" type="button" @click="toggleFavorite">{{ toolsStore.isCollected(catalog.get(menu.path)!.url) ? '取消收藏' : '收藏工具' }}</button>
        <button v-if="targetTab" role="menuitem" type="button" @click="refresh">刷新页面</button>
        <button role="menuitem" type="button" @click="copyLink">复制页面链接</button>
        <div v-if="tabsStore.tabs.length" class="tool-tabbar__menu-divider"></div>
        <button v-if="targetTab" role="menuitem" type="button" @click="closeTab(menu.path)">关闭标签</button>
        <button v-if="targetTab && tabsStore.tabs.length > 1" role="menuitem" type="button" @click="closeOthers">关闭其他标签</button>
        <button v-if="targetTab && targetIndex > 0" role="menuitem" type="button" @click="closeLeft">关闭左侧标签</button>
        <button v-if="targetTab && targetIndex < tabsStore.tabs.length - 1" role="menuitem" type="button" @click="closeRight">关闭右侧标签</button>
        <button v-if="tabsStore.tabs.length" role="menuitem" type="button" @click="closeAll">关闭所有工具标签</button>
      </div>
    </Teleport>
  </nav>
</template>

<style scoped>
.tool-tabbar { box-sizing: border-box; display: flex; align-items: center; gap: 8px; width: 100%; min-width: 0; height: 48px; padding: 4px 18px 4px 24px; border-top: 1px solid var(--app-border); border-bottom: 1px solid var(--app-border); background: var(--app-surface); color: var(--app-text-muted); }
.tool-tabbar button { font: inherit; cursor: pointer; }
.tool-tabbar__home { flex: none; display: inline-flex; align-items: center; justify-content: center; width: 34px; height: 34px; padding: 0; border: 0; border-radius: 9px; background: transparent; color: var(--app-text-muted); }
.tool-tabbar__home:hover, .tool-tabbar__home.is-active { background: var(--app-surface-muted); color: var(--app-text); }
.tool-tabbar__scroller { display: flex; align-items: center; gap: 4px; flex: 1; min-width: 0; height: 100%; overflow-x: auto; overflow-y: hidden; scrollbar-width: none; }
.tool-tabbar__scroller::-webkit-scrollbar { display: none; }
.tool-tabbar__scroll-button { display: grid; flex: none; place-items: center; width: 28px; height: 30px; padding: 0; border: 0; border-radius: 7px; background: transparent; color: var(--app-text-muted); }
.tool-tabbar__scroll-button:hover:not(:disabled) { background: var(--app-surface-muted); color: var(--app-text); }
.tool-tabbar__scroll-button:disabled { opacity: .35; cursor: default; }
.tool-tabbar__tab { flex: none; display: flex; align-items: center; max-width: 230px; height: 34px; border: 1px solid transparent; border-radius: 9px; }
.tool-tabbar__tab:hover { background: var(--app-surface-muted); }
.tool-tabbar__tab.is-active { background: var(--el-color-primary-light-9); border-color: var(--el-color-primary-light-7); color: var(--el-color-primary); }
.tool-tabbar__select { display: flex; align-items: center; gap: 7px; min-width: 0; height: 100%; padding: 0 7px 0 10px; border: 0; background: transparent; color: inherit; white-space: nowrap; }
.tool-tabbar__select img { flex: none; width: 16px; height: 16px; object-fit: contain; }
.tool-tabbar__select span { overflow: hidden; text-overflow: ellipsis; }
.tool-tabbar__icon-button { display: grid; flex: none; place-items: center; width: 22px; height: 25px; padding: 0; border: 0; border-radius: 5px; background: transparent; color: inherit; }
.tool-tabbar__icon-button:hover { background: var(--el-color-primary-light-8); color: var(--el-color-primary); }
.tool-tabbar__close { margin-right: 4px; }
.tool-tabbar__more { display: none; }
.tool-tabbar__menu { position: fixed; z-index: 4000; display: flex; flex-direction: column; min-width: 176px; padding: 5px; border: 1px solid var(--app-border); border-radius: 10px; background: var(--app-surface); box-shadow: 0 12px 32px rgba(16, 38, 78, .18); color: var(--app-text); }
.tool-tabbar__menu button { width: 100%; padding: 8px 11px; border: 0; border-radius: 6px; background: transparent; color: inherit; font-size: 13px; text-align: left; }
.tool-tabbar__menu button:hover, .tool-tabbar__menu button:focus-visible { background: var(--el-color-primary-light-9); color: var(--el-color-primary); outline: none; }
.tool-tabbar__menu-title { max-width: 220px; overflow: hidden; padding: 7px 11px; color: var(--app-text-muted); font-size: 12px; font-weight: 600; text-overflow: ellipsis; white-space: nowrap; }
.tool-tabbar__menu-divider { height: 1px; margin: 4px 6px; background: var(--app-border); }
@media (max-width: 700px) { .tool-tabbar { height: 45px; padding: 4px 14px; gap: 4px; }.tool-tabbar__tab { max-width: 170px; }.tool-tabbar__more { display: grid; }.tool-tabbar__select { padding-left: 7px; } }
</style>
