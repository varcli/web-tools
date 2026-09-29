<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { House, InfoFilled, Connection, Document, Reading, Picture, VideoCamera, Headset, DataAnalysis, Switch, Box } from '@element-plus/icons-vue'
import { useToolsStore } from '@/store/modules/tools'
import { useComponentStore } from '@/store/modules/component'

const router = useRouter()
const route = useRoute()
const toolsStore = useToolsStore()
const componentStore = useComponentStore()
const categoryIcons = [Connection, Document, Reading, Picture, VideoCamera, Headset, DataAnalysis, Switch, Box]
const activeCategory = ref('')
const closeDrawer = () => componentStore.setleftComDrawerStatus(false)
const updateActiveCategory = () => {
  if (route.path !== '/') { activeCategory.value = ''; return }
  const position = window.scrollY + 150
  let current = ''
  for (const cate of toolsStore.cates) {
    const section = document.getElementById('cate_' + cate.id)
    if (section && section.offsetTop <= position) current = 'cate_' + cate.id
  }
  activeCategory.value = current
}
const goCategory = async (id: number) => {
  closeDrawer()
  const value = 'cate_' + id
  activeCategory.value = value
  if (route.path === '/') await router.replace({ path: '/', query: { value } })
  else await router.push({ path: '/', query: { value } })
  await nextTick()
  document.getElementById(value)?.scrollIntoView({ behavior: 'smooth' })
}
onMounted(async () => {
  if (!toolsStore.cates.length) await toolsStore.getToolCate()
  await nextTick()
  updateActiveCategory()
  window.addEventListener('scroll', updateActiveCategory, { passive: true })
  window.addEventListener('resize', updateActiveCategory)
})
onUnmounted(() => {
  window.removeEventListener('scroll', updateActiveCategory)
  window.removeEventListener('resize', updateActiveCategory)
})
watch(() => route.path, async () => { await nextTick(); updateActiveCategory() })
</script>

<template>
  <aside class="sidebar">
    <router-link to="/" class="brand" @click="closeDrawer">
      <span class="brand-mark">T</span>
    </router-link>
    <el-scrollbar class="sidebar-scroll" always>
    <nav class="side-nav" aria-label="主导航">
      <router-link to="/" class="nav-item home-link" :class="{ active: route.path === '/' && !activeCategory }" @click="closeDrawer">
        <el-icon><House /></el-icon><span>首页</span>
      </router-link>
      <div class="category-list">
        <button v-for="(cate, index) in toolsStore.cates" :key="cate.id" type="button" class="nav-item category-link"
          :class="{ selected: route.path === '/' && activeCategory === 'cate_' + cate.id }"
          @click="goCategory(cate.id)">
          <el-icon><component :is="categoryIcons[index] || Box" /></el-icon><span>{{ cate.title }}</span>
        </button>
      </div>
      <div class="side-divider"></div>
      <router-link to="/about" class="nav-item about-link" :class="{ selected: route.path === '/about' }" @click="closeDrawer">
        <el-icon><InfoFilled /></el-icon><span>关于本站</span>
      </router-link>
    </nav>
    </el-scrollbar>
  </aside>
</template>

<style scoped>
.sidebar { position: sticky; top: 0; height: 100vh; display: flex; flex-direction: column; overflow: hidden; background: var(--app-surface); border-right: 1px solid var(--app-border); color: var(--app-text-muted); }
.brand { height: 76px; flex: none; display: flex; align-items: center; justify-content: center; color: #0c1529; text-decoration: none; }
.brand-mark { display: grid; place-items: center; width: 44px; height: 44px; flex: none; border-radius: 7px; color: white; font-size: 34px; font-weight: 800; background: linear-gradient(140deg,#08baf3,#1675e9); box-shadow: 0 5px 12px #a4d9ff; }
.sidebar-scroll { flex: 1; min-height: 0; }
.sidebar-scroll :deep(.el-scrollbar__bar.is-vertical) { right: 3px; width: 5px; opacity: 0; transition: opacity .2s ease; }
.sidebar-scroll:hover :deep(.el-scrollbar__bar.is-vertical) { opacity: 1; }
.sidebar-scroll :deep(.el-scrollbar__wrap) { overflow-x: hidden; scrollbar-width: none; }
.sidebar-scroll :deep(.el-scrollbar__thumb) { background: var(--el-color-primary-light-5); }
.side-nav { padding: 14px 12px 24px; }
.nav-item { width: 100%; height: 48px; box-sizing: border-box; display: flex; align-items: center; gap: 12px; padding: 0 13px; border: 0; border-radius: 15px; background: transparent; color: var(--app-text-muted); font: inherit; font-size: 15px; text-align: left; text-decoration: none; cursor: pointer; }
.nav-item .el-icon { font-size: 20px; flex: none; }.nav-item span:nth-child(2) { flex: 1; }
.nav-item:hover { color: var(--el-color-primary); background: var(--el-color-primary-light-9); }.nav-item.active { color: white; font-weight: 700; background: var(--el-color-primary); box-shadow: 0 7px 17px rgba(52,120,246,.22); }
.category-list { margin-top: 20px; }.category-link { margin: 4px 0; }.category-link.selected { color: var(--el-color-primary); background: var(--el-color-primary-light-9); font-weight: 650; }
.side-divider { height: 1px; background: var(--app-border); margin: 20px 6px; }.about-link { margin-top: 8px; }
</style>
