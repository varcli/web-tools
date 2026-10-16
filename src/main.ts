import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus';
//@ts-ignore忽略当前文件ts类型的检测否则有红色提示(打包会失败)
//入口文件main.ts全局安装element-plus,element-plus默认支持语言英语设置为中文
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
//vite-plugin-svg-icons
import 'virtual:svg-icons-register'
//router
import router from './router'
//styles
import 'virtual:uno.css'
//element-plus css
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import './styles/uno.css'
//pinia
import pinia from './store'
//v-md-editor
import { setupMdEditor } from './plugins/v-md-editor'
//default-passive-events
import 'default-passive-events'
import { applyThemeColor, readStoredColor } from './utils/theme'


const app = createApp(App)
try {
  const storedTheme = localStorage.getItem('web-tools-theme')
  if (storedTheme === 'dark' || (storedTheme === null && window.matchMedia?.('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark')
    document.body.classList.add('dark-theme')
  }
} catch {
  // Theme preference is optional when storage is unavailable.
}
applyThemeColor(readStoredColor())
//安装仓库
app.use(pinia)
app.use(router)
app.use(ElementPlus, {
  locale: zhCn
})
setupMdEditor(app)
app.mount('#app')
