# 数学可视化实验室 V2.4.1

一个无需后端和构建步骤的纯静态 HTML/CSS/JavaScript 数学实验网站。

## 运行与部署

- 本地预览：在本目录启动任意静态 HTTP Server，然后访问首页；不要使用 `file://`。
- Cloudflare Pages：构建命令留空，输出目录填写 `.`（项目根目录）。
- 网站发布后自动使用 HTTPS；首页会注册 Service Worker，并支持添加到主屏幕。

## PWA 更新

发布新版本时，把 `sw.js` 第一行的缓存名称改成新版本，例如从 `math-visual-lab-v2-4-1-r2` 改为 `math-visual-lab-v2-4-2`。浏览器激活新版本后会清理本项目的旧缓存。

## 离线支持

全部页面、图标以及 Three.js r128 / OrbitControls 已放在项目内并预缓存。用户至少在线访问一次网站后，基础实验可离线再次打开。Three.js 文件保留原项目使用的固定版本及 MIT 许可标头。

## 项目结构

- `index.html`：首页
- `*.html`：数学实验页面
- `manifest.webmanifest`、`sw.js`、图标：PWA 文件
- `vendor/`：本地化的 Three.js 固定版本
- `_headers`：Cloudflare Pages 的缓存和安全响应头
- `UPDATE_GUIDE.md`：零基础更新说明
