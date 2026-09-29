<div align="center">
  <img src="public/logo.svg" width="72" height="72" alt="Web-Tools 标志" />
  <h1>Web-Tools</h1>
  <p>只需简单几步，即可快速搭建属于自己的在线工具箱。</p>

[![node](https://img.shields.io/badge/any_text-22.21.1-red?label=node)](node)
[![vue](https://img.shields.io/badge/any_text-3.3.10-origin?label=vue)](vue)
[![unocss](https://img.shields.io/badge/any_text-66.3.1-yellow?label=unocss)](unocss)
[![elementplus](https://img.shields.io/badge/any_text-2.7-blue?label=element-plus)](elementplus)
[![license](https://img.shields.io/github/license/varcli/web-tools)](LICENSE)

</div>

## 目录

- [功能展示](#功能展示)
- [开始使用](#开始使用)
  - [Vercel部署](#Vercel部署)
  - [手动部署](#手动部署)
- [工具列表](#工具列表)
- [其他](#其他)

## 功能展示

在线站点：<a href="https://tools.varcli.com" target="_blank">Web-Tools</a>

## 开始使用

### Vercel部署

1. Fork 或将本仓库推送到你的 GitHub 账号下
2. 打开 <a href="https://vercel.com/new" target="_blank">vercel.com/new</a>，导入该仓库
3. Vercel 会自动识别 `vercel.json` 中的配置（Vite 框架）：
   - Install Command: `pnpm install`
   - Build Command: `pnpm build:prod`
   - Output Directory: `dist`
4. 如需自定义站点标题或域名，在 Vercel 项目的 Settings → Environment Variables 中添加 `.env.example` 里对应的 `VITE_` 变量
5. 点击 Deploy，之后每次 push 到 GitHub 主分支会自动重新部署

访问：`https://<你的项目名>.vercel.app`


### 手动部署

安装`pnpm`
```
npm install pnpm -g
```

克隆
```
git clone --depth=1 https://github.com/varcli/web-tools.git
```

安装
```
# 进入项目
cd web-tools

# 复制配置文件
cp .env.example .env.development

# 安装
pnpm install
```

启动
```
pnpm dev
```

打包
```
pnpm build
```

升级依赖时运行 `pnpm taze`，按提示选择要升级的次版本依赖；完成后运行 `pnpm install` 更新锁文件，并用 `pnpm build` 验证。

生产构建使用 Node.js 为首页、关于页和工具清单中的页面生成静态 HTML，不依赖本地浏览器。页面初始 HTML 包含标题、描述和工具入口，交互由 Vue 应用加载后接管。可通过 `VITE_APP_TITLE`、`VITE_APP_DESC` 和 `VITE_APP_SITE_URL` 配置站点名称、描述和 canonical 域名；Vercel 未指定域名时自动使用项目生产域名，本地默认使用 `https://tools.varcli.com`。Vercel 使用此生产构建发布 `dist`。
```
pnpm build:prod
```

## 工具列表

以下按首页分类列出当前的 109 个工具入口。单位换算的各子入口共用同一工具页面，可直接打开对应的转换选项。

### 开发运维（31 个）

- JSON 格式化
- JSON 提取
- JSON 格式转换
- 代码格式化
- js代码格式化/压缩
- Html代码格式化
- Css代码格式化/压缩
- XML格式化
- SQL格式化
- 正则测试工具
- JWT解析
- HTTP状态码
- WebSocket 调试
- Cron 表达式生成
- 子网计算器
- Mock 数据生成器
- 键盘按键测试
- TOTP 动态口令生成器
- 占位图生成器
- URL编码/解码
- Base64加解密
- Unicode转中文
- html实体转义
- 随机密码生成
- UUID生成器
- 字符串生成器
- 时间工具箱
- MD5在线加密
- Hash计算器
- 进制转换计算器
- 数据存储单位换算

### 文本处理（18 个）

- 文本对比
- markdown编辑器
- 字数统计
- 文本去重
- ASCII字形生成器
- 在线文本编辑/HTML获取
- 文本替换
- 文本处理工作流
- 空格清理
- YML / Properties 互转
- HTML 提取
- HTML / Markdown 互转
- 简繁转换
- Markdown / Word 互转
- Markdown / PDF 互转
- CSS 渐变生成
- 批量文件重命名
- 词频统计

### 教育学术（12 个）

- 单位换算
- 摩斯电码
- 常用进制转换
- ASCII码表
- 长度单位转换
- 面积单位转换
- 重量单位转换
- 时间单位转换
- 温度单位转换
- 压力单位转换
- 热量单位转换
- 功率单位转换

### 图片处理（16 个）

- Base64 图片转换
- 图片压缩
- Favicon 生成
- 随机头像生成器
- 图片转 SVG
- 图片转 GIF
- GIF 编辑器
- 图片列表处理
- 二维码生成
- 条码生成器
- 在线图片处理
- 文本转图片
- 图片分割
- 传图取色
- 图片水印添加
- 颜色对比度检查器

### 视频处理（3 个）

- 视频 / 图片互转
- 视频转 GIF
- 动态照片制作与拆解

### 音频处理（1 个）

- 音频工作台

### 数据图表（5 个）

- 柱状图
- 折线图
- 饼图
- 散点图
- 词云生成

### 选择随机（6 个）

- 生成随机数
- 帮我决定
- 抛硬币
- 投骰子
- 抽签工具
- 转盘工具

### 其他工具（17 个）

- 数字转金额大写
- 手持弹幕
- 色板
- Color选择器
- 番茄时钟
- 反应速度测试
- m3u8在线播放
- 剪刀石头布
- Emoji表情大全
- 简易计算器
- 复利计算器
- 房贷计算器
- 提前还款计算器
- 每日热量计算器
- 体脂率计算器
- 个人所得税计算器
- 聊天记录模拟器

## 其他

Q: 我应该如何添加新功能？

A: 在 `src/components/Tools/<ToolName>/index.vue` 实现页面，并同步更新 `src/components/Tools/tools.ts` 与 `src/router/router.ts`。页面结构和验证要求见 [AGENTS.md](AGENTS.md)。

<br/>

Q: 我可以参与开发 `Web-Tools` 吗？

A: 当然可以，随时欢迎提交 `PR`
