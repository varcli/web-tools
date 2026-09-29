# 项目开发规范

本项目是 Vue 3 + TypeScript + Vite 在线工具箱，使用 Element Plus、UnoCSS、Pinia 和 Vue Router。新增和改动工具时，以项目现有的工具页、导航和主题样式为准，保持视觉与操作方式一致。

## 文件与入口

- 每个工具放在 `src/components/Tools/<ToolName>/`，入口统一为 `index.vue`。该工具专用子组件放在 `components/`；解析、计算、转换等纯逻辑放在同目录的 `.ts` 文件。
- 多个工具共用的组件放在 `src/components/Layout/` 或其他共享目录。先复用现有组件和样式，再增加新的公共抽象。
- 新增工具时，同时登记 `src/router/router.ts` 和 `src/components/Tools/tools.ts`。路由使用懒加载并指向工具的 `index.vue`；配置准确的 `title`、`keywords`、`description`、工具名称、简短说明和图标。首页、侧栏、搜索从工具清单读取，不另建清单。
- 保留已有 URL。分类顺序由 `getToolsCate()` 决定；同一类型或连续工作流的工具相邻，基础操作排在扩展操作之前。

## 页面结构

- 工具页使用 `.tool-workbench` 作为根容器，主体使用 `.tool-workbench__panel`。工具说明使用 `ToolDetail`。不在工具页重复放标题栏、收藏按钮或返回首页按钮；这些由全局 `ToolTabBar` 提供。
- 引入 `src/components/Tools/workbench.css`，优先使用其中的 `__row`、`__toolbar`、`__options`、`__grid`、`__stack`、`__split`、`__field`、`__label`、`__result`、`__output`、`__hint` 和 `__error`。工具特有的布局写在本工具的 scoped 样式中，不复制公共面板和操作区样式。
- 选项和操作按钮放在对应输入区的上方；结果区的复制、下载等操作放在结果区顶部。相关控件按操作顺序排列，不把主要按钮单独堆在页面底部。
- 单输入工具按“选项/操作 → 输入 → 结果 → 说明”组织；双栏工具使用 `__grid` 或 `__split`。复杂工具可以拆成页内组件或 Element Plus 标签页，但仍沿用相同的面板、间距和反馈样式。
- 示例结构：

  ```vue
  <div class="tool-workbench">
    <section class="tool-workbench__panel">
      <div class="tool-workbench__toolbar"><!-- 选项和操作 --></div>
      <div class="tool-workbench__grid"><!-- 输入和结果 --></div>
      <p v-if="error" class="tool-workbench__error" role="alert">{{ error }}</p>
    </section>
    <ToolDetail title="说明"><!-- 用途和必要的使用提示 --></ToolDetail>
  </div>
  ```

## 组件与视觉

- 表单、按钮、标签、提示和弹窗优先使用 Element Plus。主操作使用 `type="primary"`；次要操作使用默认按钮，危险操作使用相应的危险状态。按钮文字写清动作，例如“格式化”“复制结果”“下载文件”。
- 代码或结构化文本沿用现有 CodeMirror；普通短文本和数值使用 Element Plus 输入组件。CodeMirror 的公共边框与聚焦样式在 `src/styles/uno.css`，不要在各工具中另设一套。
- 页面背景、面板、文字和边框使用 `--app-*` 变量；品牌色与状态色使用 `--el-*` 变量。亮色和 `html.dark` 都要可读，不在工具样式里固定白色面板、深色文字或另一套主题色。
- 使用公共间距和布局：工具面板默认 20px 内边距，窄屏为 16px；操作区允许换行，输入和结果容器设置 `min-width: 0`。长文本在容器内换行或滚动，不产生整页横向滚动。
- 图标沿用 Element Plus 图标或已有资源；新图标的尺寸、底色和圆角应与首页工具卡片及现有工具控件一致。

## 交互与状态

- 输入、选项和结果在工具组件内管理；切换工具标签时由 `KeepAlive` 保留当前状态。关闭或刷新标签时释放定时器、媒体流、对象 URL、网络连接和全局事件监听。
- 全局监听在 `onDeactivated` 时解除，在 `onActivated` 时恢复；需要持续运行的任务应明确其切换标签后的行为。避免隐藏的工具继续响应键盘或鼠标输入。
- 输入错误时保留原始内容，并在相应区域给出可操作的错误提示；耗时操作显示进行中状态，未产生结果时禁用复制或下载。提示文案使用中文，术语与工具清单保持一致。
- 文件处理和转换优先在浏览器本地完成。下载应有正确的文件内容、扩展名和文件名；及时释放临时资源。不展示尚未实现的选项或按钮。
- 工具应能从首页卡片、侧栏、搜索和直接 URL 打开；页面标题和 TabBar 名称应与工具清单一致。

## 验证

- 修改路由、入口或工具清单后运行 `npx vue-tsc --noEmit` 和 `npm run build`。
- 修改静态 HTML 生成器或工具清单后，运行 `npm run build:prod`，确认生成的页面标题、描述与资源路径正确。生成器从工具清单和路由元信息读取内容，不另维护一份手写列表；构建不得依赖本地浏览器。
- 新增纯转换逻辑时验证有效输入、无效输入和必要的往返转换；文件工具检查实际下载内容和文件名。
- 浏览器检查首页入口、直接路由、输入与结果、亮色和暗黑模式，以及窄屏下无整页横向滚动。
- 修改标签或工具页状态时检查：切换后输入保留，关闭后资源清理，刷新目标标签时其他标签不受影响。
