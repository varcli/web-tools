<template>
  <main class="about-page">
    <h1>关于 Web-Tools</h1>
    <p>Web-Tools 是一个轻量的在线工具箱，汇集开发运维、文本处理、教育学术、图片处理、数据图表、选择随机等常用工具，打开页面即可使用。</p>

    <h2>技术</h2>
    <p>本站基于 Vue 3、Vite 和 TypeScript 开发，使用 Element Plus 构建界面、UnoCSS 编写样式，并通过 Pinia 和 Vue Router 管理应用状态与页面路由。部分工具还使用了对应的开源库。</p>
  </main>
</template>

<style scoped>
.about-page {
  width: 100%;
  box-sizing: border-box;
  margin-top: 24px;
  padding: 36px 40px;
  border: 1px solid var(--app-border);
  border-radius: 16px;
  background: var(--app-surface);
  color: var(--app-text);
}
h1 { margin: 0 0 18px; font-size: 24px; }
h2 { margin: 32px 0 14px; font-size: 20px; }
p { max-width: 760px; margin: 0; color: var(--app-text-muted); line-height: 1.8; }
@media (max-width: 700px) { .about-page { padding: 24px; } }
</style>
