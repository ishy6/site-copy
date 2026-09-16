# ThoughtLab 站点复刻

基于 <https://www.thoughtlab.com/> 公开页面的独立 Vue 3 + TypeScript + Vite 项目，页面于 2026 年 9 月 15 日捕获。沿用仓库已有的原站模板、原主题脚本和本地交互适配方式，不使用 iframe 或运行时原站代理。

## 运行与验证

```bash
npm install
npm run dev
```

开发地址为 <http://127.0.0.1:5179/>；在仓库根目录可执行 `npm run dev:thoughtlab`。

```bash
npm run typecheck
npm run build
npm run preview
npm test
```

预览与自动化验证端口为 5191。`npm test` 自动构建，再使用只读取 `dist/` 的独立静态 HTTP 服务启动测试，不依赖 Vite 的路由中间件。测试浏览器使用本机 Google Chrome；测试前请关闭手动启动的 5191 服务。

构建为每个已捕获路由生成独立 `index.html`，支持直接访问、内部跳转、返回和刷新。`dist/404.html` 提供未知路由页面。部署到静态主机时，应启用目录 `index.html` 和自定义 `404.html`。

## 页面范围

当前共 138 条本地路由，完整清单位于 `public/reference/manifest.json`：

- 首页、About、Contact、Privacy Policy 和 Thank You。
- Projects 列表及全部 22 个作品详情。
- Careers 列表、软件工程师职位详情和申请页面。
- 15 个能力服务详情和 4 个城市地点页面。
- Toniq 博客前两页、72 篇文章、全部 10 个分类首页和其中 4 个分类的第二页。

首页保留玻璃形体、文字折射、鼠标响应、3 个精选作品、介绍、4 项能力、3 条新闻、Salt Lake City 和联系页脚。原主题 Three.js、GSAP 和页面转场继续在本地运行。桌面采用原主题的平滑滚动，浏览器自动化应使用滚轮事件；移动端保留原生文档滚动和响应式布局。

博客分类选择器已适配为本地 URL。原站部分选项同时包含完整 URL 和基础地址，本地适配避免重复拼接。导航、菜单、作品链接、分类选择、文章阅读和表单类型切换均可使用。

## 本地资源与表单

当前保存 633 个资源文件，约 1.06 GB，包括 38 个作品视频、照片、SVG 标识、9 个字体文件、WebGL 字体图集和立方体环境纹理。GPU 能力检测用到的 benchmark JSON 也已保存到本地；已捕获页面的渲染不需要原站服务器。

Vue 适配层在提交前执行原生表单验证，随后显示可通过键盘操作的本地反馈对话框。联系、订阅和职位申请均不会发送消息、附件或订阅请求，也不会保存个人资料；对话框提供原站联系入口。外部社交、电话和未捕获的历史文章仍保留原地址。

原站的 `/locations/` 当前返回 404，相关入口保留明确的原站 URL；Salt Lake City、New York City、Atlanta 和 San Francisco 的实际详情页已捕获。快照不是整个 WordPress 内容库的镜像，未捕获历史文章和分页会打开原站。

## 同步与证据

```bash
npm run reference:sync
npm run reference:audit
```

同步脚本会复用 `public/reference/raw/` 内已抓取的原始 HTML 和已有媒体，再解析内部链接、模块依赖、CSS 字体、延迟加载图像和视频。默认每轮遍历最多 110 个页面，并保留此前已捕获页面；可以通过 `PAGE_LIMIT` 调整遍历上限。若需重新下载特定原页面，请先删除对应的 `raw/` 缓存文件。原始记录仅供核对，不用于运行时代理。

`artifacts/` 保存桌面、移动、菜单、滚动和本地表单截图，以及 WebGL 像素检查与全部静态页面检查结果。浏览器验证覆盖 canvas 非空与跨帧变化、指针与滚轮、双端菜单、内部路由、分类及刷新、表单验证与零发送、资源缺失、横向溢出和未知路由。

页面文案、职位、文章与作品内容反映捕获时状态。图像、字体、视频和原主题资源归原权利人所有。
