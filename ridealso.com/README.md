# ALSO 参考站点复刻

当前站点使用捕获的 ALSO 公开页面文档，以及原主题的 CSS、字体和浏览器交互模块。早期 Vue 实现仍保留在 `src/`，Vite 优先提供更完整的参考路由，以保留原站布局、媒体图库、展开菜单、移动导航、商品规格、配置器、轮播与弹窗行为。

## 运行与构建

```bash
npm install
npm run dev -- --host 127.0.0.1 --port 5177
npm run build
npm run serve:built
npm run test:fidelity
```

示例开发端口为 5177，同时启动 Jitter 时应另选空闲端口。`serve:built` 只在 5188 端口提供 `dist`，不使用 Vite，也不读取源码目录。`?view=configure`、`?view=performance` 和博客分页等查询模板映射到各自完整文档，同时保留公开 URL。测试使用已安装的 Chrome 检查独立构建。

## 参考内容与更新

`public/reference/manifest.json` 记录每个原始 URL 及其快照。主题脚本、样式、响应式图片、字体和 Lottie 文件已缓存到本地；大视频与部分配置器图片变体仍使用原 CDN。

`scripts/` 通过 Cheerio 刷新页面、缓存图片与公开商品数据，再整理本地路由元信息。媒体缓存和整理步骤都会更新快照，需按以下顺序执行：

```bash
CRAWL=1 node scripts/sync-reference.mjs / /cart
node scripts/cache-reference-products.mjs
node scripts/cache-reference-media.mjs
node scripts/finalize-reference.mjs
npm run build
```

要更新某个查询模板，将带完整查询参数的站内路径传给 `sync-reference.mjs`，例如 `/products/tm-b?size=large`。脚本会将该路径拼接至原站域名，清单保留之前已捕获的路由。

## 本地行为与边界

`local-adapter.js` 提供持久化本地购物车接口、已捕获商品推荐、类别与价格筛选、Cookie 偏好、邮箱校验和原规格 URL 初始化。

本项目不会向线上提交购买、订阅、登录或预约。账户和结算页面明确引导用户到 ALSO；订阅先验证邮箱，再提示到原站完成操作。活动报名和第三方支持保留原外部地址。

`configurator-route.js` 在原主题自定义元素初始化之前应用分享 URL 中的规格，因此刷新后仍保留选中的车架、颜色、套件和驾驶舱。
