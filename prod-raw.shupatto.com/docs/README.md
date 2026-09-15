# Shupatto：核心交互、视觉风格与代码解析

本文基于 2026-09-15 的本地代码，描述 <https://prod-raw.shupatto.com/> 的复刻。项目包含日英双语 48 个已采集路由，沿用 Vue 3 + TypeScript + Vite 工程，通过本地页面快照与原站交互引擎还原体验。

## 1. 架构与阅读入口

| 入口 | 职责 |
| --- | --- |
| [src/App.vue](../src/App.vue) | 加载状态、快照挂载、错误与未知路由 |
| [src/reference.ts](../src/reference.ts) | 路由加载、元信息、字体、配置与脚本初始化 |
| [src/style.css](../src/style.css) | Vue 包裹层、加载和错误界面的最小适配 |
| [public/reference/manifest.json](../public/reference/manifest.json) | 日英路径到快照文件的索引 |
| [public/assets/202601151311/js/main.js](../public/assets/202601151311/js/main.js) | 当前原站版本的首页、商品、声音与菜单模块 |
| [public/assets/202601151311/css/app.css](../public/assets/202601151311/css/app.css) | 原站布局与响应式样式 |
| [scripts/sync-reference.mjs](../scripts/sync-reference.mjs)、[scripts/cache-fonts.mjs](../scripts/cache-fonts.mjs) | 页面/媒体采集和每页字体子集缓存 |
| [vite.config.ts](../vite.config.ts) | 为每个采集路由输出静态入口 |

页面直接渲染在本地文档，没有 iframe 或运行时原站代理。首页的摄影动画是 **2D 帧序列/精灵图**，不是 Three.js 模型；改变帧偏移和裁切即可得到折叠、展开及转场。

## 2. 视觉风格

| 规则 | 当前实现与用途 |
| --- | --- |
| 背景 | 灰白摄影棚画面与轻微色调变化，产品色彩是主要视觉强调 |
| 字体 | GillSansNova Book/Medium/SemiBold、CezannePro M/DB 等原站字体子集按页缓存 |
| 首页 | 全屏摄影序列，品牌、章节标签、声音和导航分布在画面边缘 |
| 详情 | 产品图居中，规格文案、价格、色板和 BUY 围绕主图排布 |
| 列表 | 分类别呈现产品，通过自动角度变化与颜色预览表达不同款式 |
| 控件 | 小型色点、细线、英文分类、文字菜单，界面不抢产品主体 |
| 手机端 | 使用 sp 图集，首页拖动方向由横向变为纵向，详情和菜单重新排布 |

Vue 的 `#app` 和 `.reference-document` 使用 `display: contents`，避免新增 wrapper 改变原站布局。原站文字换行依赖字体宽度，未加载字体就初始化尺寸会影响整页排版。

## 3. 核心交互

| 场景 | 输入/状态 | 可见反馈 |
| --- | --- | --- |
| 首页开场 | html_onIntro、帧进度 | 摄影折叠动画结束后进入可交互首页 |
| 滚动/拖动 | 场景连续位置、场景内部展开进度 | 切换场景，或先展开当前左右/上下分区 |
| 声音 | 音频启动和 muted 状态 | 背景声/交互音与声音控件联动 |
| 产品列表 | 桌面 hover、手机 tap 色板 | 预览切色，链接携带选中 color |
| 商品详情 | 颜色、图片区域点击、手机滑动 | 更换产品图、颜色名和关联内容 |
| 刷新商品页 | `?color=N` | 恢复对应颜色；URL 从 1 开始，内部索引从 0 开始 |
| 菜单/语言 | modal 类与本地日英路径 | 菜单展开、站内跳转、语言页面切换 |
| 说明书 | 本地 PDF 链接 | 下载实际 PDF 文件 |

## 4. 核心模块代码解析

### 4.1 Snapshot 生命周期：先有 DOM，再启动原站模块

`Snapshot` 保存 route、title、description、lang、name、htmlClass、bodyClass、body、config、scripts 和可选 fontStyles。

初始化顺序是：

1. `loadSnapshot` 规范化 pathname 并查 manifest，未知路径返回 null。
2. App 设置 snapshot，通过 `v-html` 插入 body，等待 `nextTick`。
3. `initializeReference` 恢复 html/body 的 class、语言、data-name、标题与描述。
4. 执行采集的页面配置，加载本页字体 CSS 并等待 `document.fonts.ready`。
5. 按顺序插入原站脚本；head.js 之后调用 `INIT_VH`。
6. 为菜单和声音设置可访问名称，通过 MutationObserver 同步菜单 aria 状态。

`FONTPLUS.isloading` 在本地字体加载后返回 false，满足原站生命周期判断；它不是跳过字体加载。失败路径显示错误，未知路由显示返回首页入口。

实现思路：原站模块启动时会查找固定 DOM 并测量布局，因此不能与 v-html 挂载或字体加载并行执行。当前按整页生命周期初始化，不应直接套成未清理旧实例的 SPA 热切换。

### 4.2 首页控制器：场景位置与展开状态

定位 bundle 的 `.js_home` 模块、`_goNext`、`_interactStart`、`_interactUpdate`、`_interactEnd`、`tick`。

首页控制器保存连续 num、主场景 mainIndex、相邻 index、插值进度、dragging 与 interacted 等状态。每帧从连续位置算出两侧场景、过渡比例和布局，再让各 section/clip 渲染。

`_goNext` 并非永远进入下一页：当当前是 split view 且方向满足条件时，用约 700ms 改变场景内部展开和平衡；否则以约 1200ms 改变场景位置。首次离开首屏、再次展开当前场景、再进入下一场景是不同动作。

实现思路：场景切换与场景内部形变使用两个进度层。测试应观察标题/分类的位置和图像变化，不能只断言 `.js_home` 的 `is_fv` 类消失，该类并不可靠表示当前场景。

### 4.3 输入归一化：滚轮与双端拖动

滚轮模块监听 body 的 wheel，归一化横纵 delta，再用衰减和短历史判断手势开始，避免每一个 wheel 事件都启动一次转场。只有开场结束后才接受场景交互。

拖动开始记录原位置和场景状态，移动量除以视口较短边；横屏使用 dx，竖屏使用 dy。释放时结合方向和移动量决定吸附目标。控制器同时维护一段 interacted 时间，避免用户操作立即被自动推进打断。

实现思路：保留原站滚轮过滤和拖动方向逻辑，不能用普通 `scrollTop += deltaY` 替代全屏场景系统。移动端的纵向首页手势和商品横向切色是两个不同控制器。

### 4.4 摄影帧序列：四帧合图与局部缓存

定位 `getCombinedFrameImgPath`、`.js_home_clipBodyInner`、`_setImgPos` 和图像轮换模块。

一个 WebP 图集包含连续摄影帧，模块根据当前帧找到图集地址，将当前/邻近图集借入 DOM，并通过 top 百分比选择帧。背景、cover 与主体分开，主体尺寸还依赖 crop、zoom 和横竖屏配置。

首页资源分别有 pc、sp、pc_large 版本。只缓存首屏图片会导致后续展开、宽屏或手机场景缺图，采集脚本因此显式枚举序列资源。

实现思路：保持图片裁切、帧数、图集顺序和背景配置一致；不要把单张精灵图直接用 object-fit 当成最终产品图。

### 4.5 产品预览：数据颜色到 URL 的双向对应

定位 `.js_lineup`、`.js_detailFv`、`.js_productImage`、`_colorChanged`、`dragEnd`。

列表桌面通过 hover、手机通过 tap 切换颜色，并把颜色编号写入商品 href。详情初始化把 `color=N` 转成内部 `N-1`，选色后同步按钮 active、颜色文字、详细图段、购买地址参数，再调用 `history.replaceState`。

产品图由纵向角度精灵图控制；切色时有 clip-path 边界过渡，桌面指针还影响产品角度。手机横向拖动在左右候选图之间切换，释放后激活对应颜色。

实现思路：选中样式、实际媒体、颜色文字和 URL 必须一起更新。桌面直接拖图片可能触发浏览器原生图片拖拽，现有原站亦如此；测试桌面切色使用点击/hover，手机使用滑动。

### 4.6 声音与菜单：保留运行时，补语义属性

声音按钮启动原站音频系统并切换静音；自动播放受浏览器手势规则约束。`shupatto_sound_started` 保存在 sessionStorage，音量变化由音频 gain 控制，不能仅凭按钮外观推断是否静音。

菜单实际由原站 modal 逻辑驱动，html 的 `is_modalShow` 反映展开状态。本地 `installAccessibilityAttributes` 只补 aria-label、aria-expanded 和 aria-hidden，没有重写菜单控制，也没有额外实现 Escape 关闭。

## 5. 资源更新与验证

按顺序执行 `npm run reference:sync`、`npm run reference:fonts`、`npm run build`。同步页面会重写快照，字体步骤必须随后执行，为每页重新设置 fontStyles。`SKIP_CRAWL=1` 可复用快照扫描资源。

构建插件为所有已采集路径生成 index.html，并输出 404.html。BUY 保留 Marna 商城地址，零售商、联系与社交链接也可能跳出本站；不实现外部商城结账。

| 检查 | 命令/入口 | 范围 |
| --- | --- | --- |
| 交互 | `npm test`，[tests/fidelity.spec.ts](../tests/fidelity.spec.ts) | 双端首页、声音、拖动、颜色、导航、PDF、未知路由；自动构建并启动预览 |
| 全路由 | `npm run test:routes`，[scripts/smoke-routes.mjs](../scripts/smoke-routes.mjs) | 需开发服务运行，48 路由 × 两个尺寸的资源、脚本和溢出检查 |
| 视觉比较 | `npm run reference:compare`，[scripts/compare-reference.mjs](../scripts/compare-reference.mjs) | 1440×900 与 390×844 的截图和几何数据 |

比较动画页面时应控制随机值、开场与自动推进参数，静态详情比较还应排除延迟的滚动提示。标题对齐不代表每一帧都相同，应同时检查真实图片像素与交互变化。这里记录已有验证工具，不表示本次文档任务再次执行了测试。
