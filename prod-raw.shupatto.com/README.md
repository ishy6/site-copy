# Shupatto 参考站点复刻

基于 <https://prod-raw.shupatto.com/> 公开页面的独立 Vue 3 + TypeScript + Vite 项目，页面于 2026 年 9 月 9 日捕获。

## 运行与检查

```bash
npm install
npm run dev
```

开发地址为 <http://127.0.0.1:5178/>；在父目录可执行 `npm run dev:shupatto`。

```bash
npm run typecheck
npm run build
npm run preview
npm test
```

浏览器测试使用本机 Google Chrome，先构建项目，再在 5189 端口启动隔离预览。运行前需关闭占用该端口的手动预览。检查覆盖桌面和触摸布局、照片动画像素、音频启用和静音、导航、商品配色和 URL 恢复、语言切换、说明书 PDF 及未知路由。

开发服务运行期间，`npm run test:routes` 检查全部 48 条路由的桌面和移动端布局，包括可见图片、页面错误、缺失资源及横向溢出。结果保存到 `artifacts/routes.json`。

## 页面与交互实现

`src/App.vue` 加载匹配的页面快照。`src/reference.ts` 应用页面元信息和字体，在 Vue 挂载文档后初始化原页面模块，并补充菜单可访问属性。原 CSS、SVG 符号、动画引擎、图像序列和商品图集保留原站布局与过渡。内容直接渲染到本地文档，不使用 iframe 或运行时原站代理。

48 条日文和英文路由覆盖首页、产品列表、详情、品牌介绍、门店和下载页。原桌面与移动端照片序列、响应式图片、音频、PDF 手册和分页面字体子集位于 `public/`。商品配色会更新 URL，并在刷新后恢复。生产构建为每条捕获路由输出独立的 `index.html`。

首页使用二维照片序列，实现折叠开场、指针互动、可拖动场景过渡、滚动进度、音效和移动端布局。商品详情保留桌面悬停选色、触摸点击与滑动、图片过渡和滚动章节。

购买、零售商、Instagram 和联系链接保留原外部地址，需要网络。本项目不实现独立的 Marna 商店，也不会提交订单。已捕获页面及本地媒体的浏览不依赖原站服务器。

## 更新源数据

```bash
npm run reference:sync
npm run reference:fonts
npm run build
```

同步脚本抓取公开内部链接、解析编码后的商品数据、缓存响应式媒体和动画图集，并复用已下载文件。字体捕获通过 Chrome 打开原页面，将各页面实际返回的字体子集保存到本地。更换快照后应同时执行页面和字体同步。

`npm run reference:audit` 记录原站首页交互。`npm run reference:compare` 生成 1440×900 和 390×844 的原站与本地截图，并将几何尺寸和请求诊断保存到 `artifacts/comparison/`。为减少加载条件差异，对比时原站浏览器保留原文档，但从本地提供已经缓存的原图片和脚本。截图时动画仍可能处于不同帧。

价格、库存、商店地址和商品信息反映捕获时的数据。素材与字体归原权利人所有。
