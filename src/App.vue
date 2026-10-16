<script setup lang="ts">
import Header from "@/components/Layout/Header/Header.vue";
import Left from "@/components/Layout/Left/Left.vue";
import Floor from "@/components/Layout/Floor/Floor.vue";
import ToolTabBar from "@/components/Layout/ToolTabBar/ToolTabBar.vue";
import { computed, nextTick, ref } from "vue";
import { useRoute } from "vue-router";
import {
  isToolRouteName,
  normalizeToolPath,
  toolComponentName,
} from "@/router/toolTabs";
import { useToolTabsStore } from "@/store/modules/toolTabs";
import { useComponentStore } from "@/store/modules/component";

//store
const componentStore = useComponentStore();
const route = useRoute();
const toolTabs = useToolTabsStore();
const cacheVersions = ref<Record<string, number>>({});
const suspendedNames = ref<string[]>([]);
const cachedTools = computed(() =>
  toolTabs.tabs
    .map((tab) => toolComponentName(tab.routeName))
    .filter((name) => !suspendedNames.value.includes(name)),
);

async function refreshTool(path: string) {
  const tab = toolTabs.tabs.find((item) => item.path === path);
  if (!tab) return;
  const name = toolComponentName(tab.routeName);
  suspendedNames.value = [...suspendedNames.value, name];
  await nextTick();
  cacheVersions.value[path] = (cacheVersions.value[path] || 0) + 1;
  await nextTick();
  suspendedNames.value = suspendedNames.value.filter((item) => item !== name);
}
</script>

<template>
  <el-container>
    <!-- left -->
    <transition name="left-sidebar">
      <el-aside
        v-if="!componentStore.leftCom"
        class="desktop-sidebar fixed top-0 left-0 h-full z-10"
        width="200px"
      >
        <Left></Left>
      </el-aside>
    </transition>
    <el-drawer
      show-close
      size="200px"
      :with-header="false"
      v-model="componentStore.leftComDrawer"
      direction="ltr"
    >
      <Left></Left>
    </el-drawer>

    <!-- right -->
    <el-container
      :class="!componentStore.leftCom ? 'c-md:ml-[200px]' : ''"
      class="main-container"
    >
      <el-header class="app-header">
        <Header />
      </el-header>
      <ToolTabBar
        v-if="route.path === '/' || isToolRouteName(route.name)"
        @refresh="refreshTool"
      />
      <el-main class="app-main">
        <router-view v-slot="{ Component, route: viewRoute }">
          <transition name="animation" mode="out-in">
            <keep-alive :include="cachedTools">
              <component
                :is="Component"
                :key="`${normalizeToolPath(viewRoute.path)}:${cacheVersions[normalizeToolPath(viewRoute.path)] || 0}`"
              />
            </keep-alive>
          </transition>
        </router-view>
      </el-main>
      <el-footer class="md:mb-6 mt-12 c-xs:mb-12">
        <Floor />
      </el-footer>
    </el-container>
  </el-container>
</template>

<style scoped>
/* 过度动画配置代码 */
.animation-enter-from,
.animation-leave-to {
  transform: translateX(20px);
  opacity: 0;
}
.animation-enter-to,
.animation-leave-from {
  opacity: 1;
}
.animation-enter-active {
  transition: all 0.7s ease;
}
.animation-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.6, 0.6, 1);
}

/* 左侧菜单折叠动画 */
.left-sidebar-enter-from,
.left-sidebar-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

.left-sidebar-enter-to,
.left-sidebar-leave-from {
  transform: translateX(0);
  opacity: 1;
}

.left-sidebar-enter-active,
.left-sidebar-leave-active {
  transition: all 0.3s ease;
}

/* 主内容区域动画 */
.main-container {
  transition: margin-left 0.3s ease;
}
</style>

<style>
/* 全局科技感样式 */
body {
  margin: 0;
  background: var(--app-bg);
  color: var(--app-text);
  min-height: 100vh;
}

.el-header.app-header {
  height: 76px;
  padding: 0 18px;
}
.el-main.app-main {
  padding: 0 0 24px 24px;
  min-width: 0;
  overflow-x: hidden;
}
.tech-footer {
  box-sizing: border-box;
}
.sidebar-scroll .el-scrollbar__wrap::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}
.dark-theme .sidebar .nav-item {
  color: var(--app-text-muted);
}
.dark-theme .sidebar .nav-item.selected {
  color: var(--el-color-primary);
}
.dark-theme .tool-card .tool-icon {
  background: var(--app-surface-muted);
}
.dark-theme .card-arrow {
  background: var(--app-surface-muted);
}
@media (max-width: 700px) {
  .el-header.app-header {
    height: 64px;
    padding: 0 14px;
  }
  .el-main.app-main {
    padding: 0 14px 20px;
  }
}
@media (max-width: 991px) {
  .desktop-sidebar {
    display: none !important;
  }
  .main-container {
    margin-left: 0 !important;
    width: 100%;
  }
}

/* 滚动条 */
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-thumb {
  background: #d5d8de;
  border-radius: 4px;
}
</style>
