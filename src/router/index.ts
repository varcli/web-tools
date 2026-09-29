//通过vue-router插件实现模板路由配置
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { constantRoute } from './router'
import { isToolRouteName, toolComponentName } from './toolTabs'

const routes = constantRoute.map(record => {
  if (!isToolRouteName(record.name) || !('component' in record) || typeof record.component !== 'function') return record
  const load = record.component as () => Promise<{ default: { name?: string } }>
  return {
    ...record,
    component: async () => {
      const module = await load()
      module.default.name = toolComponentName(record.name!)
      return module.default
    },
  }
}) as RouteRecordRaw[]
//创建路由器
const router = createRouter({
  //路由模式hash
  // history: createWebHashHistory(),
  history: createWebHistory(),
  routes,
  //滚动行为
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.path === from.path) return false
    return {
      left: 0,
      top: 0,
    }
  },
})
const siteTitle = import.meta.env.VITE_APP_TITLE?.trim() || 'Web-Tools'
const siteDescription = import.meta.env.VITE_APP_DESC?.trim() || '一个轻量的在线工具箱'

// 路由后置守卫统一设置页面标题和 SEO 信息
router.afterEach((to) => {
  const { title , keywords, description } = to.meta
  const detailTitle = typeof title === 'string' ? title.trim() : ''
  document.title = detailTitle ? `${detailTitle} - ${siteTitle}` : `${siteTitle} - ${siteDescription}`

  const pageDescription = typeof description === 'string' && description.trim() ? description : siteDescription
  document.querySelector('meta[name="keywords"]')?.setAttribute('content', typeof keywords === 'string' ? keywords : '')
  document.querySelector('meta[name="description"]')?.setAttribute('content', pageDescription)
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', document.title)
  document.querySelector('meta[property="og:site_name"]')?.setAttribute('content', siteTitle)
  document.querySelector('meta[property="og:description"]')?.setAttribute('content', pageDescription)
})
export default router
