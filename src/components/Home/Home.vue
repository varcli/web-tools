<script setup lang="ts">
import { nextTick, onMounted, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { ArrowRight } from '@element-plus/icons-vue'
import { useToolsStore } from '@/store/modules/tools'

const toolsStore = useToolsStore()
const route = useRoute()
const colors = ['mint', 'sky', 'pink', 'amber', 'violet', 'orange', 'blue', 'indigo']
const scrollToSection = async () => {
  await nextTick()
  const section = typeof route.query.value === 'string' ? route.query.value : ''
  if (section) document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' })
}
onMounted(async () => {
  toolsStore.loadCollectedTools()
  if (!toolsStore.cates.length) await toolsStore.getToolCate()
  scrollToSection()
})
watch(() => route.query.value, scrollToSection)
</script>

<template>
  <div class="home-page">
    <section class="hero-panel">
      <div class="hero-copy">
        <h1>一个轻量的在线工具箱</h1>
        <p>集合多种实用工具，开箱即用，简单高效</p>
      </div>
    </section>

    <section v-if="toolsStore.collectedTools.length" id="collect" class="tool-section">
      <div class="section-heading"><div><h2>收藏工具</h2><p>快速打开常用工具</p></div></div>
      <div class="tool-grid">
        <RouterLink v-for="item in toolsStore.collectedTools" :key="item.url" :to="item.url" class="tool-card">
          <span class="tool-icon sky"><img :src="item.logo" :alt="item.title" /></span>
          <span class="tool-content"><strong>{{ item.title }}</strong><small>{{ item.desc }}</small></span>
          <span class="card-arrow"><el-icon><ArrowRight /></el-icon></span>
        </RouterLink>
      </div>
    </section>

    <section v-for="cate in toolsStore.cates" :id="'cate_' + cate.id" :key="cate.id" class="tool-section">
      <div class="section-heading">
        <div><h2>{{ cate.title }}</h2><p>{{ cate.desc || '实用、便捷的' + cate.title + '工具' }}</p></div>
      </div>
      <div class="tool-grid">
        <RouterLink v-for="(item, index) in cate.list" :key="item.url" :to="item.url" class="tool-card">
          <span class="tool-icon" :class="colors[Number(index) % colors.length]"><img :src="item.logo" :alt="item.title" /></span>
          <span class="tool-content"><strong>{{ item.title }}</strong><small>{{ item.desc }}</small></span>
          <span class="card-arrow"><el-icon><ArrowRight /></el-icon></span>
        </RouterLink>
      </div>
    </section>
    <el-backtop :right="24" :bottom="28" />
  </div>
</template>

<style scoped>
.home-page { width: 100%; box-sizing: border-box; padding: 8px 20px 48px 0; }
.hero-panel { min-height: 220px; position: relative; overflow: hidden; border-radius: 22px; display: flex; align-items: center; background: var(--app-hero-bg); }
.hero-panel::after { content: ''; position: absolute; width: 72%; height: 260px; right: -10%; bottom: -175px; border: 2px solid rgba(255,255,255,.55); border-radius: 50%; transform: rotate(-13deg); box-shadow: 0 -22px 70px rgba(255,255,255,.4); }
.hero-copy { position: relative; z-index: 2; padding: 24px 0 24px 48px; }
.hero-copy h1 { margin: 0 0 10px; font-size: clamp(28px, 2.5vw, 40px); line-height: 1.25; letter-spacing: .02em; color: var(--app-text); font-weight: 800; }
.hero-copy p { margin: 0; color: var(--app-text-muted); font-size: clamp(15px, 1.2vw, 19px); }
.tool-section { margin-top: 30px; scroll-margin-top: 88px; }
.section-heading { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin-bottom: 16px; }
.section-heading h2 { position: relative; margin: 0 0 3px; padding-left: 22px; color: var(--app-text); font-size: 23px; font-weight: 750; }
.section-heading h2::before { content: ''; position: absolute; left: 0; top: 2px; width: 8px; height: 34px; border-radius: 6px; background: linear-gradient(var(--el-color-primary), var(--el-color-primary-dark-2)); }
.section-heading p { margin: 0; padding-left: 22px; color: var(--app-text-muted); font-size: 14px; }
.tool-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 18px; }
.tool-card { height: 134px; box-sizing: border-box; display: flex; align-items: flex-start; gap: 16px; padding: 20px; border: 1px solid var(--app-border); border-radius: 18px; background: var(--app-surface); box-shadow: 0 10px 30px rgba(76,107,157,.055); text-decoration: none; transition: transform .2s, box-shadow .2s, border-color .2s; }
.tool-card:hover { transform: translateY(-4px); border-color: #b9d5ff; box-shadow: 0 16px 34px rgba(75,111,183,.14); }
.tool-icon { width: 56px; height: 56px; flex: none; display: grid; place-items: center; border-radius: 15px; }
.tool-icon img { width: 35px; height: 35px; object-fit: contain; }
.tool-icon.mint { background: #e8f9f2; }.tool-icon.sky { background: #ebf5ff; }.tool-icon.pink { background: #fff0f7; }.tool-icon.amber { background: #fff6eb; }.tool-icon.violet { background: #f2efff; }.tool-icon.orange { background: #fff2e8; }.tool-icon.blue { background: #eaf7ff; }.tool-icon.indigo { background: #efefff; }
.tool-content { min-width: 0; flex: 1; padding-top: 3px; }.tool-content strong { display: block; color: var(--app-text); font-size: 16px; line-height: 1.4; }.tool-content small { display: -webkit-box; margin-top: 7px; color: var(--app-text-muted); font-size: 13px; line-height: 1.6; overflow: hidden; -webkit-line-clamp: 3; -webkit-box-orient: vertical; }
.card-arrow { align-self: center; flex: none; display: grid; place-items: center; width: 35px; height: 35px; border-radius: 50%; color: var(--el-color-primary); background: var(--el-color-primary-light-9); }
@media (max-width: 1350px) { .tool-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }  }
@media (max-width: 1000px) { .tool-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }.hero-copy { padding-left: 30px; } }
@media (max-width: 700px) { .home-page { padding: 8px 0 32px; }.hero-panel { min-height: 184px; }.hero-copy { padding: 22px; }.hero-copy h1 { max-width: 300px; }.hero-copy p { max-width: 300px; }.tool-grid { grid-template-columns: 1fr; gap: 12px; }.tool-card { min-height: 110px; }.section-heading h2 { font-size: 20px; } }
</style>
