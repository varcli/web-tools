import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(() => {
  return {
    base: '/',
    root: process.cwd(),
    server: {
      host: "0.0.0.0",
      port: 16975,
      open: false,
      warmup: {
        clientFiles: ["./index.html", "./src/{views,components}/*"],
      },
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify('production')
    },
    plugins: [
      vue(),
      UnoCSS(),
      createSvgIconsPlugin({
        // Specify the icon folder to be cached
        iconDirs: [path.resolve(process.cwd(), 'src/assets/icons')],
        // Specify symbolId format
        symbolId: 'icon-[dir]-[name]',
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve("./src")  //相对路径别名配置， 使用@替代src
      }
    },
    optimizeDeps: {
      exclude: ['xlsx']
    }
  }
})
