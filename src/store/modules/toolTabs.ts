import { defineStore } from 'pinia'
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import { toolsList } from '@/components/Tools/tools'
import { isToolRouteName, normalizeToolPath } from '@/router/toolTabs'

export interface ToolTab {
  path: string
  fullPath: string
  routeName: string
  title: string
  logo: string
}

const storageKey = 'web-tools-open-tabs-v1'
const catalog = new Map<string, ReturnType<typeof toolsList>[number]>()
toolsList().forEach(tool => {
  const path = normalizeToolPath(tool.url)
  if (!catalog.has(path)) catalog.set(path, tool)
})

function restoreTabs(): ToolTab[] {
  try {
    const raw = JSON.parse(sessionStorage.getItem(storageKey) || '[]') as unknown
    if (!Array.isArray(raw)) return []
    const seen = new Set<string>()
    return raw.filter((item): item is ToolTab => {
      if (!item || typeof item !== 'object') return false
      const tab = item as Record<string, unknown>
      if (typeof tab.path !== 'string' || typeof tab.fullPath !== 'string' || typeof tab.routeName !== 'string' || typeof tab.title !== 'string' || typeof tab.logo !== 'string') return false
      if (!tab.path.startsWith('/') || !tab.fullPath.startsWith('/') || !isToolRouteName(tab.routeName) || seen.has(tab.path)) return false
      seen.add(tab.path)
      return true
    })
  } catch { return [] }
}

export const useToolTabsStore = defineStore('toolTabs', {
  state: () => ({ tabs: restoreTabs() }),
  actions: {
    persist() {
      try { sessionStorage.setItem(storageKey, JSON.stringify(this.tabs)) } catch { /* session storage is optional */ }
    },
    syncRoute(route: RouteLocationNormalizedLoaded) {
      if (!isToolRouteName(route.name)) return
      const path = normalizeToolPath(route.path)
      const tool = catalog.get(path)
      const tab: ToolTab = {
        path,
        fullPath: route.fullPath,
        routeName: String(route.name),
        title: tool?.title || String(route.meta.title || route.name),
        logo: tool?.logo || '',
      }
      const index = this.tabs.findIndex(item => item.path === path)
      if (index < 0) this.tabs.push(tab)
      else this.tabs[index] = tab
      this.persist()
    },
    remove(paths: string[]) {
      const removed = new Set(paths)
      this.tabs = this.tabs.filter(tab => !removed.has(tab.path))
      this.persist()
    },
    pruneUnknown(knownNames: Set<string>) {
      this.tabs = this.tabs.filter(tab => knownNames.has(tab.routeName))
      this.persist()
    },
  },
})
