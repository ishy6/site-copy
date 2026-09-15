# ALSO：核心交互、视觉风格与代码解析

本文基于 2026-09-15 的本地代码，描述 <https://ridealso.com/> 的复刻。当前生效的是原站完整页面和主题 Web Components，加上本地请求适配层；`src` 中较早的 Vue 页面不是已采集路由的主要实现。

## 1. 实际运行结构

| 入口 | 职责 |
| --- | --- |
| [vite.config.ts](../vite.config.ts)、[scripts/reference-plugin.ts](../scripts/reference-plugin.ts) | 优先匹配快照路由、开发/预览服务与构建输出 |
| [public/reference/manifest.json](../public/reference/manifest.json) | 页面、query 模板、partial 与源地址索引 |
| [public/reference/local-adapter.js](../public/reference/local-adapter.js) | 本地购物车 API、商品/推荐、筛选、账户与结账跳转 |
| [public/reference/configurator-route.js](../public/reference/configurator-route.js) | 在主题组件初始化前恢复 variant URL |
| [public/reference/local-adapter.css](../public/reference/local-adapter.css) | 本地购物车、提示与补充表单样式 |
| [public/reference/assets/21dc2093cc8235ad.css](../public/reference/assets/21dc2093cc8235ad.css) | 当前采集的主要主题 CSS，文件名随重新采集可能变化 |
| [scripts/serve-built.mjs](../scripts/serve-built.mjs) | 只读取 dist 的独立构建服务器 |
| [tests/fidelity.spec.ts](../tests/fidelity.spec.ts) | 实际构建产物的浏览器交互验证 |

项目保留 Vue 3、TypeScript、Vite 的工程环境；主题自身的 custom elements、轮播、Lottie 与媒体代码随页面加载。不要只改 `src/components` 后就假定原站页面中的同名功能已经改变。

## 2. 视觉风格

| 规则 | 当前实现与用途 |
| --- | --- |
| 品牌表达 | 车辆和配件摄影、宽幅视频、大标题与强对比产品展示 |
| 色彩 | 黑白基础界面与产品/章节配色交替，主题变量定义 primary/secondary 等语义色 |
| 字体 | 主题以 `--title-font`、`--body-font`、`--heading-font`、`--display-font` 分工，不能用旧 Vue 样式代替 |
| 背景 | 页面包含渐变背景模块与 `noise-canvas` 纹理，具体由原站样式和组件驱动 |
| 导航 | 桌面 mega menu、手机分级 Shop 菜单；不同层有独立展开状态 |
| 产品页 | 大幅媒体、规格与变体选择、Quick Add、相关推荐 |
| 配置器 | 车辆预览与分步选项、当前配置摘要、保存和预订入口相互联动 |

视觉还原依赖完整的页面内主题变量、CSS 顺序和素材，不能仅复用一个按钮类。大型视频和部分配置图仍使用原始 CDN。

## 3. 核心交互

| 场景 | 触发入口 | 可见结果 |
| --- | --- | --- |
| 首页轮播 | 主题分页点 | 当前 slide 与 active bullet 同步 |
| 导航 | hover/点击与手机子菜单 | 展开 mega menu 或分级导航 |
| 商品变体 | variant-selector | 颜色、尺寸、图片与加入购物车数据改变 |
| Quick Add | collection-grid-tile 内操作 | 加载 partial 商品内容到主题弹窗 |
| 车辆配置 | configurator-app | 组件组合匹配 variant，更新预览和预订项 |
| 分享配置 URL | `variant` + `view` | 刷新后恢复配置和选中项 |
| 分类筛选 | product type、price 查询参数 | 过滤本地商品网格，刷新仍应用条件 |
| 购物车 | 主题 Cart 调用 | 本地增删改与持久化，金额和数量更新 |
| 账户/结账/订阅 | 本地校验与外部提示 dialog | 跳转 ALSO 完成实际服务 |

## 4. 核心模块代码解析

### 4.1 referencePages：URL 不仅由 pathname 决定

`reference-plugin.ts` 先规范化 pathname，再拼入 `?view=...` 或 `?page=...` 作为索引键。`view=configure`、`view=performance` 和博客分页对应不同 HTML，不能直接退化成同一 SPA 页面。

开发和预览由中间件返回对应快照。构建阶段为无 query 页面生成目录入口；带 query 的版本仍保留在 reference 下，由路由表和本地适配处理。`local-adapter.js` 可跳转到快照文件，再通过 `__route` 恢复公开地址。

`/cart/add/:id` 会转换为购物车加载入口，以便分享或直接访问时也能加入对应预订项。独立 `serve-built` 的目的就是验证这些行为在 dist 中仍成立。

实现思路：采集和部署都必须保留 query 路由语义。新增 view 时，要区分完整页面和供弹窗加载的 partial。

### 4.2 原站组件 + fetch 适配：保留前端契约

`local-adapter.js` 保存 nativeFetch，再包装 `window.fetch`。只处理明确的本地商品、购物车、推荐、filter 与 partial 请求，其余交给原生 fetch。

| 请求 | 本地处理 |
| --- | --- |
| `/cart.js`、`/cart/add.js`、`/cart/change.js`、`/cart/update.js`、`/cart/clear.js` | 读取或更新本地购物车，返回主题期望的 JSON |
| `/products/:handle.js` | 从 products.json 返回采集商品 |
| `/recommendations/products.json` | 根据 product_id 返回采集推荐 |
| `/collections/gear?...filter...` | 返回筛选后的 HTML 文档 |
| 带 partial view 的请求 | 返回对应 reference 片段 |
| 带 sections 的购物车请求 | 返回主题需要的 section HTML 映射 |

实现思路：适配层模拟的是主题已经使用的接口形状，避免重写每个 custom element。扩展接口时必须保留价格单位、字段名称和响应类型，不能随意将 HTML 改成 JSON。

### 4.3 configurator-route：在组件启动之前恢复选项

入口：`script[type="configurator/config"]`、`configurator-app`、`script[type="product/data"]`。

脚本从 URL 读取 variant id，在配置 JSON 中找到目标 variant，设置 selected 标记和 `selected-variant-id`。随后同步组件勾选值、初始图片/canvas 标签、摘要 step 与 deposit 链接。

普通商品则更新 product/data 中的 default 标记、variant-selector 单选项和图库 selected image。初始化后，local-adapter 的 change 监听继续同步当前 `_variant` 对应的标签和目标 URL。

实现思路：把初始选择写回主题读取的数据源，比组件启动后仅修改某个 radio 的外观可靠。否则 UI 看似选中了新颜色，实际订单仍可能使用默认 variant。

### 4.4 购物车模型与预订映射

`addItem` 先在采集商品中找 variant；找不到时尝试 deposits.json，把预订 id 映射成车辆预订商品。行身份由 `variant.id + JSON.stringify(properties)` 组成，因此同一变体但不同配置属性不会直接合并。

`saveCart` 移除非正数量，重新计算行金额、item_count 和总价，写入 `also-replica-cart-v1`。价格单位为分，`money` 显示时除以 100。`cartMarkup` 生成本地行内容，仍交由主题 Cart 事件协调更新。

结账生成 ALSO 的 cart permalink，将变体和数量交给原站；这不等于已经创建远端订单。Save build 也进入账户流程，没有在本地建立真实云端配置账户。

实现思路：普通商品与预订商品共享购物车形状，但 id 来源不同。维护时分别验证这两条加入路径及刷新恢复。

### 4.5 分类筛选：改 DOM 并保留表单状态

`filteredCollection` 读取 gear 快照、products 和 categories，根据 product type 与价格上下界删除不匹配的 collection-grid-tile。随后更新结果数量、空状态和输入 checked/value，返回完整 HTML。

页面带 filter query 首次加载时，DOMContentLoaded 阶段调用 `collection-facets.apply` 重新应用条件，因而可以从共享 URL 恢复筛选。

实现思路：返回结果同时包含数据视图与表单状态。只过滤图片而不更新 checked/value，会造成刷新后“看起来未筛选但结果已筛选”。

### 4.6 外部服务边界与小型本地表单

账户和结账由 capture 阶段事件拦截，校验后显示 `externalDialog`；真正服务由 ALSO 页面完成。Newsletter 校验邮箱并保存 session 草稿，然后提示前往原站完成订阅。Cookie 选择保存于独立 localStorage key，不执行真实广告同意同步。

实现思路：保留用户可理解的下一步和选择信息，同时在适配层明确哪些操作仅为本地反馈。不要把成功打开外部 dialog 当作远端提交成功。

## 5. 维护与验证

运行 `npm run typecheck`、`npm run build`，再执行 `npm run test:fidelity`。Playwright 按配置启动 dist 服务器；普通 `npm test` 使用 `--passWithNoTests`，不能替代浏览器测试。

已有覆盖包括：首页菜单/轮播、商品变体与购物车、分类与价格、query 配置器、共享 variant、Quick Add、账户跳转、博客分页、订阅校验和手机导航。本文未重新执行它们。

更新顺序为采集页面、缓存商品、缓存媒体、finalize、构建。具体命令见 [项目 README](../README.md)。手动追加检查 canvas 预览与配置是否一致、外部媒体失败、两个 view 来回切换、部署到纯静态环境后的 query 路由。
