# MAKR：核心交互、视觉风格与代码解析

本文基于 2026-09-15 的本地代码，描述 <https://makr.com/> 的复刻。实现采用“原站结构与样式 + Vue 管理状态 + 本地商品数据”的组合，未执行真实订单或账户操作。

## 1. 架构与阅读入口

| 入口 | 职责 |
| --- | --- |
| [src/App.vue](../src/App.vue) | 外壳挂载、快照路由、事件委托、抽屉、搜索、商品变体与购物袋 |
| [src/reference.ts](../src/reference.ts) | 商品/目录类型、HTML 生成、价格与图片辅助函数 |
| [src/live-reference.ts](../src/live-reference.ts) | 未采集页面与搜索的远端补充、DOM 清理、图片地址映射 |
| [src/components/CheckoutView.vue](../src/components/CheckoutView.vue) | 本地邮箱步骤与订单摘要 |
| [public/reference/shell.html](../public/reference/shell.html) | 原站公共导航、抽屉和页面插槽 |
| [public/reference/original.css](../public/reference/original.css)、[src/style.css](../src/style.css) | 原站样式和少量本地适配 |
| [public/reference/routes.json](../public/reference/routes.json)、[public/reference/products.json](../public/reference/products.json) | 路由索引和商品变体数据 |
| [scripts/verify-fidelity.mjs](../scripts/verify-fidelity.mjs) | 浏览器交互验证 |

技术栈为 Vue 3、TypeScript、Vite、Splide。实际入口为 `src/main.ts`；`src` 中保留的旧 `.js` 文件和未被入口导入的组件不应当作当前主流程。

## 2. 视觉风格

| 规则 | 当前实现与用途 |
| --- | --- |
| 色彩 | 灰绿/中性背景、黑色文字、细分隔线；具体页面背景来自快照的 bodyStyle |
| 字体 | 原站 CSS 包含 Akzidenz Grotesk Black、NimbusSan、Sohne 与 CircularXXMono 等字体规则 |
| 商品展示 | 产品摄影大面积展示，目录按 collection/subcategory 组织，名称、材质与价格紧贴商品 |
| 详情 | 桌面和手机各自的标题/图库插槽，参数、生产说明、相关产品形成纵向阅读顺序 |
| 导航 | Shop/Info 抽屉与悬停图片，购物袋使用侧向抽屉，背景遮罩明确当前层级 |
| 动效 | Splide 淡入轮播、抽屉显隐、商品覆盖层与通知展示；节奏偏克制 |

视觉基线主要在 `original.css`。`src/style.css` 只补充焦点、加载反馈和本地控件；修改它不会替代原站所有布局规则。

## 3. 核心交互

| 场景 | 状态或条件 | 反馈 |
| --- | --- | --- |
| 打开目录/详情 | route、snapshot、catalogs、products | 本地快照渲染，标题与页面背景随路由变化 |
| Shop/Info/手机菜单 | `panel` 联合类型 | 互斥抽屉、背景遮罩与悬停预览 |
| 搜索 | 输入防抖 200ms、至少 3 个字符 | 本地结果先显示，必要时请求原站补充 |
| 选规格 | selectedVariant | 尺寸、价格、库存状态和加入购物袋按钮更新 |
| 加入购物袋 | 已选择且可用的变体 | 同 variant 合并数量，打开购物袋 |
| 改数量 | 0..99 | 更新金额；数量为 0 移除该行 |
| 关闭通知/订阅 | 本地到期时间 | 记住关闭选择，使用 90 天有效期 |
| 邮箱与结账 | 浏览器字段校验 | 本地反馈，引导到原站完成后续操作 |

## 4. 核心模块代码解析

### 4.1 外壳 + Teleport：保留原始 DOM 插槽

App 先并行加载 shell、routes、catalogs、products、search 和 media-map，再通过 `v-html` 渲染 shell。`nextTick` 确保 `#main_content` 存在，之后 Teleport 把页面内容送入该插槽。

页面展示由 `pageHtml` 决定：目录调用 `collectionHtml`，商品调用 `productHtml`，其余使用 snapshot.html。`v-html` 内部不会编译 Vue 的事件指令，因此交互统一采用 document 级事件委托。

实现思路：原站 DOM id 是模板与逻辑之间的契约。移动或重命名插槽时，应同时检查 HTML 生成函数、事件 closest 选择器和 CSS。

### 4.2 navigate：缓存、竞争请求与第三方实例生命周期

本地 routes 有记录时读取快照，否则调用 `createReferenceLoader.load`。完成后放入 Map 缓存。每次导航递增 `navigationId`，异步结果只在 id 仍匹配时应用，避免慢请求覆盖新页面。

切换时销毁旧 Splide 实例，再更新 bodyClass、bodyStyle、title 和 History。渲染后处理 hash 或 collection 锚点，最后给 `.splide` 初始化 fade 轮播和 nearby 懒加载。

`/checkout` 是单独分支，使用 Vue 组件而不是普通 HTML 快照。浏览器 popstate 调用同一 navigate，但不重复 push history。

实现思路：DOM 被替换时，第三方实例必须先销毁。不要仅更新页面字符串而让旧 slider 继续持有已移除节点。

### 4.3 reference.ts：从结构化商品更新原站模板

`Product` 保存 productId、标题段、finish、说明、图库与 `variantData`；`Variant` 保存 id、尺寸、价格、salePrice、isAvailable 等；购物袋 `CartLine` 只保存 url、variantId、quantity。

`productHtml` 用 DOMParser 解析快照，通过已知 id 替换标题、尺寸、价格、图库、相关产品和规格选项。多规格未选择时显示起价；库存控制按钮 disabled 与缺货登记表单。

生成普通文本和属性时使用 `escapeHtml`。产品说明等富文本仍按受信任的采集 HTML 插入，因此这里不是允许用户任意输入 HTML 的渲染组件。

实现思路：保持商品数据为单一来源，桌面/手机插槽从同一 Product 更新。不要让手机模板保留旧价格而只修桌面块。

### 4.4 抽屉与事件委托

`panel` 为 shop、info、mobile、cart 或 null；`syncPanels` 将状态同步为原站 active/open 类、aria-expanded 和 inert。打开抽屉时保存焦点，关闭后恢复。

`onClick` 通过 `closest` 依次处理导航、遮罩、通知、规格和数量，最后处理链接。保留 Ctrl/Meta/Shift 等修饰键与 `_blank` 行为，内部链接才进入本地 navigate。`onKey` 支持 Escape、伪按钮 Enter/Space 和抽屉内 Tab 循环。

实现思路：事件优先级很重要。规格选择必须在通用链接处理之前结束，否则一次点击可能既切规格又导航。

### 4.5 搜索：本地优先，远端补充

`onInput` 防抖后调用 `performSearch`。查询不足 3 字符时清空结果；有精确 searchFixture 则直接使用，否则对本地索引执行多词全部匹配，生成临时 Catalog。

未命中 fixture 时启动远端搜索；使用 AbortController 取消前一次任务，并在返回时再次比较 search.value。失败保留本地结果。`live-reference.ts` 负责规范化相对商品路径和本地/远端图片地址。

实现思路：两阶段搜索需要明确结果替换条件。新增过滤条件时，也要纳入请求有效性判断，否则旧结果可能覆盖新的条件。

### 4.6 购物袋与 CheckoutView

`addToCart` 先验证规格选择和库存，按 variantId 合并已有行。deep watch 将购物袋写入 `makr-cart-v2`，并调用 `renderCart` 更新数量、合计及 HTML。初次读取会过滤不存在的商品/变体及无效数量。

`CheckoutView` 用 props 中的 cart/products 计算摘要；邮箱提交、优惠码只给本地提示。显示的税费为界面示意，不具备真实物流、税费或支付计算能力。

实现思路：商品价格不重复存入 CartLine，而从变体数据取值。接入正式交易时必须由服务器重新验证价格与库存，不能信任 localStorage。

## 5. 维护与验证

运行 `npm run typecheck`、`npm run build`。`npm test` 使用 `--passWithNoTests`，当前不能当成已有单元测试通过的证明；交互覆盖来自 `npm run test:fidelity`，运行前需按脚本要求启动本地站点（当前使用 5176）。

手动重点：多规格缺货、未选规格加入、数量归零、刷新购物袋、三字符搜索边界、快速换搜索词、导航竞争、抽屉焦点、手机图库与通知关闭恢复。

未采集页面和补充搜索仍请求 makr.com，可能受跨域或网络影响；Vimeo 嵌入也依赖外网。源站同步工具位于 [scripts/sync-reference.mjs](../scripts/sync-reference.mjs) 等脚本中，更新原始数据后需重新验证 HTML 契约。本文未改动运行时代码，也未重新执行应用测试。
