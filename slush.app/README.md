# Slush 站点复刻

基于 <https://slush.app/> 公开页面的独立 Vue 3 + TypeScript + Vite 项目，页面于 2026 年 9 月 15 日捕获。

## 运行与验证

```bash
npm install
npm run dev
```

开发地址为 <http://127.0.0.1:5180/>，在父目录可执行 `npm run dev:slush`。

```bash
npm run typecheck
npm run build
npm test
```

浏览器测试使用本机 Google Chrome，先构建，再在 5192 端口启动隔离预览。46 项桌面与触摸测试覆盖全部 19 条路由、本地资源、横向溢出、标签内容切换、拖动轮播定位、视频播放、菜单、导航和浏览器历史、法律页面、表单及未知路由。测试会阻断外部请求，截图与逐页资源诊断保存到 `artifacts/`。

## 页面与交互

`src/App.vue` 通过本地页面清单加载快照，`src/reference.ts` 初始化原站 Webflow、GSAP、Barba、Lenis 和 Lottie 脚本，并处理本地导航、页面元信息与可访问属性。页面直接渲染在本地文档中，不使用 iframe 或运行时原站代理。

19 条公开路径覆盖首页、Get Started、DeFi、安全、下载、指南列表及 7 篇指南、Card、品牌素材、地区说明和法律页面。生产构建为每条路径输出独立的 `index.html`，支持直接访问和刷新。首页保留字标开场、Lottie 图形、滚动视差、平台标签、可拖动卡片、评价轮播和设备演示视频。导航保留原站页面切换动画。

Card 使用原站的独立页面生命周期，保留卡片开场、背景视频、滚动动画及 ActiveFrame 编码照片序列。照片序列在支持 WebCodecs 的桌面浏览器中绘制到 canvas；其他环境保留原站静态照片。进入 Card 时执行整页导航，以初始化其独立脚本。

图片、字体、视频、Lottie 和主题依赖已缓存到 `public/reference/assets/`。原始 HTML、可供页面切换使用的完整文档和结构化快照分别保存于 `public/reference/original/`、`public/reference/documents/` 和 `public/reference/`。

## 外部服务

钱包、应用商店、DeFi、支持中心、社交网站和品牌下载保留官方公开链接。订阅表单在本地校验输入并明确显示未发送邮件，提供原站订阅入口。Card 候补注册校验邮箱后提供官方注册页；本地不会发送验证码、连接钱包或生成虚构的候补排名。

## 更新快照

```bash
npm run reference:sync
npm run reference:audit
```

同步默认复用已捕获的原始 HTML，并重新读取依赖样式和脚本以补齐嵌套资源。设置 `REFRESH_SOURCE=1 npm run reference:sync` 可重新抓取公开页面。同步脚本从 sitemap 和页面链接发现路径，处理响应式图像、CSS 字体、Lottie 附属图片、视频和 ActiveFrame 文件。完整资源映射和失败清单保存在 `public/reference/manifest.json`。

`reference:audit` 打开原站并保存桌面与触摸布局的滚动截图，便于更新后对照。动态动画帧、视频播放进度和跑马灯的位置可能因截图时机不同而有差异。

快照中的产品与法律信息反映捕获时的数据。素材与字体归原权利人所有。
