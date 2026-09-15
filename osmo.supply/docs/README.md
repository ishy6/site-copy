# Osmo：核心交互、视觉风格与代码解析

本文基于 2026-09-15 的本地代码，描述 <https://www.osmo.supply/> 的复刻首页。核心是资源展示与交互动效，并未在本项目内实现完整会员资源后台。

## 1. 架构与阅读入口

项目使用 Vue 3、TypeScript、Vite 和 Lucide。大部分页面内容及轮播协调逻辑在 `App.vue`，通用按钮和运动计算已单独抽出。

| 入口 | 职责 |
| --- | --- |
| [src/App.vue](../src/App.vue) | 菜单、产品展示、案例轮播、视频弹窗、定价和订阅 |
| [src/motion.ts](../src/motion.ts) | 连续位置动画、循环索引和案例卡片姿态 |
| [src/components/MotionButton.vue](../src/components/MotionButton.vue) | 链接/按钮语义和禁用逻辑 |
| [src/components/ButtonLabel.vue](../src/components/ButtonLabel.vue) | 双文字层翻转和图标移动 |
| [src/components/BillingSwitch.vue](../src/components/BillingSwitch.vue) | 季付/年付切换与键盘导航 |
| [src/style.css](../src/style.css)、[src/fidelity.css](../src/fidelity.css) | 基础样式和还原校准层 |

主运动实现采用 `requestAnimationFrame`、Web Animations API、CSS 和 IntersectionObserver；不能因为页面展示 GSAP 资源，就把当前页面的动画代码归为 GSAP 实现。

## 2. 视觉风格

| 规则 | 当前实现与用途 |
| --- | --- |
| 底色与文字 | `#f4f4f4` 的浅灰纸面、`#201d1d` 的深色正文，深浅全宽区段交替 |
| 强调色 | `--green: #b1ff69`、`--violet: #6541f4`；校准层也使用更贴近特定区域的色值 |
| 字体体系 | Haffer 正文、Haffer XH 展示文字、Haffer Mono 辅助信息、Brisa Pro 手写批注 |
| 版式 | 大标题、紧凑导航、横向资源带、错位叠放的产品/案例卡片、宽幅页脚标志 |
| 动作语言 | 按钮文字沿远端圆心翻转；卡片旋转、缩放、透明度随连续位置变化 |
| 响应式 | 产品展示和导航针对窄屏调整；页脚按独立断点切换折叠行为 |

`fidelity.css` 是重要的最终覆盖层。复制组件时必须一并检查其依赖的变量和覆盖规则，单取 `style.css` 不一定得到当前页面效果。

## 3. 核心交互

| 场景 | 输入与状态 | 反馈 |
| --- | --- | --- |
| 产品展示 | 标签点击、方向键、横向拖动，更新 `activeProduct` 与连续位置 | 居中产品、卡片位移与缩放同步变化 |
| 案例展示 | 左右切换、拖动、释放速度 | 叠放卡片切换到目标案例，释放后抑制误点击 |
| 最新资源/评价 | 自动计时、手动方向操作、hover/focus 暂停 | 内容及进度变化，离屏或页面隐藏时停止累计 |
| 菜单与弹窗 | 打开、关闭、Escape、Tab | 锁定背景滚动、限制焦点范围、恢复触发器焦点 |
| Showreel | 播放、暂停、静音、进度拖动 | 控制真实 video 元素 |
| 计费切换 | 季付/年付 | 定价相关显示联动，选中态与 `aria-pressed` 同步 |
| Newsletter | 姓名、邮箱、隐私同意 | 校验、提交中、成功或错误状态 |

## 4. 核心组件代码解析

### 4.1 MotionButton + ButtonLabel：语义层和动画层分开

`MotionButton.vue` 依据是否传入 `href` 选择 `<a>` 或 `<button>`，透传属性，并统一处理 disabled。禁用链接取消默认跳转、设置 `aria-disabled` 并移出 Tab 顺序。

`ButtonLabel.vue` 把同一文案绘制两份，第二份为 `aria-hidden`，读屏只读一次。旋转中心由文案长度和 `full` 计算，长按钮使用更远的圆心，形成接近竖向翻滚的轨迹。

`rotate` 监听最近的交互父元素 `pointerenter` 与 `focusin`：

1. 减少动态效果或父元素禁用时取消动画。
2. 已有运行中动画时直接返回，避免 hover 与 focus 重复触发。
3. 两层文字使用 `element.animate`，第二层错开 75ms。
4. 普通文字持续 500ms，full 变体持续 750ms；直属 SVG 图标有独立轨迹。
5. 动画完成、文案改变或组件卸载时取消实例并恢复初始状态。

实现思路：业务按钮只声明文案、链接与点击行为，视觉运动交给标签层。新增按钮优先复用 `MotionButton`，而不是再造另一套 hover CSS。

### 4.2 useMotionPosition：离散选项与连续运动

入口：`motion.ts` 的 `wrapIndex`、`circularOffset`、`useMotionPosition`、`showcasePose`。

`wrapIndex` 将负数与越界索引映射回循环范围；`circularOffset` 求每张卡相对当前连续位置的环形距离。`moveTo` 在每次新动画前取消旧帧，用时间进度插值，支持指数缓出与弹性模式。减少动态效果时直接赋目标值。

`showcasePose` 按距离在预设姿态间插值，返回 x、y、rotation、scale、opacity。这样拖到半张卡时也有连续的中间状态，而不是等索引改变后才启动 CSS transition。

实现思路：保留所有卡片节点，通过位置决定姿态。这样视频、焦点和资源加载状态不会因为切换中心卡而反复重建。

### 4.3 拖动控制：方向判定、速度与误点击隔离

入口：`App.vue` 的 `startSwipe`、`moveSwipe`、`finishSwipe`，及 product/showcase 专用包装函数。

按下时记录 pointerId、坐标、时间和起始连续位置，同时停止自动吸附动画。移动超过 8px 才进入拖动态；纵向位移占优时取消，让手机页面继续正常滚动。确定横向拖动后才调用 `setPointerCapture`。

速度由相邻采样的距离和时间计算，释放阶段根据位移与速度选择目标，然后调用位置动画吸附。真正发生拖动后设置 350ms 点击抑制窗口，防止松手误打开链接。取消手势会释放捕获并恢复稳定状态。

实现思路：手势状态与产品索引分开，拖动中改变连续位置，释放才确认目标项；不能只把 pointerup 当作普通点击。

### 4.4 自动轮播与可见性

入口：`startCarouselTimers`、`carouselVisible`、`latestPaused`、`testimonialPaused` 和两个 IntersectionObserver。

最新资源和评价通过 50ms 定时累加进度，周期分别为 3 秒和 4 秒。只有在页面可见、区域入屏且未暂停时才累加。hover 与 focus 分开记录，避免鼠标移出时错误恢复仍被键盘聚焦的轮播。

另一 observer 负责 `.reveal` 的入场可见类；不要把资源是否在视口中与“是否已执行过入场”混成一个状态。减少动态效果会停止定时器，卸载时清理 observer、timer 和监听。

### 4.5 BillingSwitch：受控选择组件

组件通过 `defineModel<'quarterly' | 'annual'>` 接收父级状态。点击仅在值确实变化时写回；Home/End 定位首尾，左右键循环选择并移动焦点。视觉由两个 `MotionButton` 与 `aria-pressed` 表示。

实现思路：计费周期是父级数据，控件不自行保存另一份价格或周期，避免多个定价区块不同步。

### 4.6 视频、弹层与 Newsletter

`openModal`、`closeModal` 和 watch 负责渲染后聚焦、关闭恢复、背景锁定；视频的 play 异常被处理，进度控制修改真实 `currentTime`。

Newsletter 的 `submitNewsletter` 检查姓名、邮箱和同意项，使用 `idle/loading/success/error` 状态，并防止 loading 时重复提交。当前代码会 POST 到 Outseta 的公开订阅接口，**不是纯本地模拟提交**；现有单测通过 mock 验证请求与反馈，维护时不能误将它描述为离线功能。

## 5. 维护与验证

运行 `npm test`、`npm run typecheck`、`npm run build`。相关测试为 [App.spec.ts](../src/App.spec.ts)、[motion.spec.ts](../src/motion.spec.ts)、[MotionButton.spec.ts](../src/components/MotionButton.spec.ts) 和 [BillingSwitch.spec.ts](../src/components/BillingSwitch.spec.ts)。

手动检查重点：连续快速 hover、鼠标与焦点重叠、拖动后链接误触、手机纵向滚动、拖动取消、离屏轮播暂停、视频弹窗关闭、减少动态效果。文档记录测试覆盖，不表示本次重新执行测试。

产品与会员目的地址仍可能跳转 Osmo；案例站点和部分媒体来自外部服务。调整主按钮之前先检查它是本地弹层触发器还是外链，二者不能使用同一种导航处理。
