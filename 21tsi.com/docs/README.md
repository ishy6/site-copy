# 21TSI：核心交互、视觉风格与代码解析

本文基于 2026-09-15 的本地代码，描述 <https://21tsi.com/> 的多页面复刻。该站的关键不是 Vue 组件树，而是 HTML 数据钩子、原站运行时与视觉素材之间的契约。

## 1. 实际运行结构

| 入口 | 职责 |
| --- | --- |
| [index.html](../index.html)、[fr/index.html](../fr/index.html) | 英法首页的完整 DOM、章节与交互数据属性 |
| [vite.config.ts](../vite.config.ts) | 首页、招聘、法律/隐私等 6 个 HTML 构建入口 |
| [src/main.ts](../src/main.ts)、[src/App.vue](../src/App.vue) | 挂载 `#replica-runtime`；App 的 render 返回 null |
| [public/assets/scripts/main.js](../public/assets/scripts/main.js) | 原站打包运行时，负责滚动、WebGL、文字、菜单与声音 |
| [public/assets/styles/main.css](../public/assets/styles/main.css) | 原站完整样式与字体规则 |
| [scripts/audit.mjs](../scripts/audit.mjs) | DOM/素材契约与原站 CSS/JS 哈希检查 |
| [scripts/compare-source.mjs](../scripts/compare-source.mjs) | 原站与本地比较工具 |

Vue 依赖存在，但并不生成主要页面。修改 `src/App.vue` 不会自动修改首页章节；应该先检查 HTML 和原站运行时的选择器。

原站 JavaScript 是压缩 bundle，内部包含动画、WebGL 渲染及 CookieConsent 等实现。以下用稳定的 DOM 选择器和事件名定位模块，不把压缩后的短变量名视为长期 API。

## 2. 视觉风格

| 规则 | 当前实现与用途 |
| --- | --- |
| 字体 | Saans 可变字体，`font-weight: 100 1000`，来自 `SaansVF.woff2` |
| 颜色 | 黑白高对比为主，`#3eff54` 亮绿穿插；内容与背景明暗变化协调 |
| 页面结构 | 长距离滚动叙事，章节背景、粘性内容和文字入场按滚动阶段衔接 |
| 标题 | 大字号、分行/分词裁切入场；不能随意删除供动画使用的 line/word/char 包裹 |
| 媒体 | 全幅摄影、WebGL 场景转场、圆环系统与背景模糊共同形成景深 |
| 导航 | 顶部线条、精简文字导航、圆形发现按钮、手机全屏菜单 |
| 响应式 | desktop/mobile 独立图片集，窄屏替换画面并调整粘性区段和文字尺寸 |

这套样式不是通用卡片型页面。还原重点是章节长度、触发位置、固定/粘性层关系和素材切换，而不只是静态颜色与字体。

## 3. 核心交互

| 场景 | 触发契约 | 可见反馈 |
| --- | --- | --- |
| 加载入场 | `.loading` 及其计数/序列子节点 | 标志、计数、序列和首屏内容按时间线进入 |
| 章节跳转 | `data-scroll-to` 对应 `data-scroll-target` | 导航和发现按钮移动到准确章节 |
| 连续滚动 | `data-scroll-event-progress`、`data-scroll-call` | 背景转场、标题、圆环和内容联动 |
| 折叠叙事 | `collapseProgress`、`data-collapse`、`data-index` | 随进度切换当前内容与配图 |
| 品牌悬停 | `.recognition .brand`、`data-brand` | 品牌标志浮层跟随鼠标 |
| 手机菜单 | `.navbar_menuToggle`、`.menu_close`、`data-menu-target` | 打开/关闭菜单并跳至对应章节 |
| 声音 | `.ambienceSoundToggle` | 桌面环境音开关；当前初始化受 min-width 768px 条件限制 |
| Cookie 偏好 | CookieConsent 配置 | 英法文同意提示、拒绝及偏好设置 |

## 4. 核心模块代码解析

### 4.1 HTML 数据属性就是场景配置

以首页为例：`data-scroll-target="sphere"` 声明目标，`data-scroll-to="sphere"` 声明入口；`data-scroll-event-progress="sectionTransition"` 指定连续事件，`data-from`、`data-to` 指定转场两端。

`data-scroll-offset` 定义触发范围，`data-scroll-call` 对应进入/离开类事件。运行时接收的 event.detail 包含 target、progress 或 way/from 等上下文，再把数值派发给视觉模块。

实现思路：增加章节时，先定义目标名称、滚动范围、前后场景和媒体资源，再接入展示内容。只复制可见 HTML 而遗漏数据属性，会出现页面存在但动效完全不响应的情况。

### 4.2 背景渲染器：统一处理场景和进度

入口：bundle 中 `sectionTransition` 事件、渲染器的 `prepare`、`render`、`onProgress`、`changeSlide`。

运行时先准备场景资源，再开启 `requestAnimationFrame` 渲染。`sectionTransition` 从当前触发元素读取 `data-from` 和 `data-to`，将 progress 交给背景渲染器。只有元素处于 `is-inview` 时才应用对应转场。

背景不是普通 `<img>` 淡入淡出的全部效果；bundle 内有 WebGL shader、纹理和 framebuffer 处理。修改时应保留场景资源和 shader 依赖，不应根据项目仅声明 Vue 就误认为图形运行时来自 Vue。

实现思路：让一个渲染循环处理背景，滚动模块提供场景与进度。不要为每个章节再建立独立 canvas 和全局渲染循环。

### 4.3 圆环系统：离散场景与连续滚动叠加

入口：`.circles`、`.circle--1/2/3`、`triggerCircles`、`data-state`。

进入触发区域时，运行时读取 `data-state` 调用 `setState`，切换圆环布局。连续滚动另外更新 `--c-rotate`、`--c-rotate-inverse` 和 `--c-scale`，其中缩放还依赖滚动速度。

切换场景前会移除上一轮圆环动画，避免两条时间线同时写同一元素。布局状态负责“圆环在什么位置”，滚动参数负责“在当前位置如何转动/缩放”。

实现思路：将大状态切换和每帧运动分离。调整某个 state 的姿态时，应同时观察正反向滚动和快速跨章节。

### 4.4 滚动折叠组：进度映射到活动索引

入口：`collapseProgress`、`.collapses[data-collapse]`、`.collapse.active`、`initFirstCollapse`。

运行时按触发器的 `data-collapse` 找到组，再将 `0 < progress < 1` 映射为 `floor(progress × 项目数)`。只有索引变化时才切换 active 类、更新 `data-current-index`、收起旧内容并展开新内容，同时通知背景切图。

首页英法版本均有 7 个 collapse，分布在不同叙事组中。默认项通过 `initFirstCollapse` 的进入事件初始化，不是用户每次都需要点击标题才展开的普通 FAQ。

实现思路：组内数量、连续 data-index、默认项和配图顺序必须一致。新增一项会改变进度分段，因此还需复核滚动长度。

### 4.5 文字按钮与品牌悬浮预览

文字由 `data-split` 对应的拆分处理生成 `.char`、`.word`、`.line`。导航 hover 用 stagger 延迟移动字符，发现按钮使用两层文字和两枚箭头在裁切区域内交换。

品牌预览通过 `data-brand` 匹配标志，mouseenter 加 active，mousemove 把浮层 translate 到 clientX/clientY，mouseleave 清理。手机 CSS 隐藏该指针专用层。

实现思路：重复文字是动画轨迹的一部分；修改文案应保持拆分规则和包裹层。指针预览应只用于支持 hover 的环境，不能代替手机必须可见的品牌信息。

### 4.6 多页面与外部招聘

招聘与法律页面为独立 HTML，采用 `.edito` 的封面、粘性标题、滚动内容与返回入口。`coverZoom` 更新 `--cover_scale` 与 `--cover_mask`。招聘页加载 Rippling 的 job-board 脚本，因此职位内容需要外部服务。

## 5. 修改与验证方式

运行 `npm test`、`npm run typecheck`、`npm run build`；`npm run compare:source` 用于源站比较。`npm test` 是 Node 静态审计，**不是浏览器端到端测试**。

现有审计检查 6 个入口、导航目标、菜单/声音控件、英法 Cookie 文案、7 个 collapse、双端素材和 CSS/JS 的固定 SHA-256。若决定修改原站 bundle 或 CSS，哈希检查会失败；应说明修改原因并重新核对基线，不能只删除断言。

手动重点为：加载完成、慢速与快速正反滚动、菜单跳转、折叠组边界、桌面声音、手机图片、Cookie 两层面板，以及招聘嵌入失败时页面主体是否仍可访问。本文不新增或执行这些浏览器检查。
