# Wise：核心交互、视觉风格与代码解析

本文基于 2026-09-15 的本地代码，描述当前复刻实现。原站为 <https://wise.com/>，主要界面为香港地区中文首页；这里不实现账户系统或汇款交易。

## 1. 架构与阅读入口

项目使用 Vue 3、TypeScript、Vite 和 Lucide。页面与多数交互集中在 `App.vue`，没有引入 Vue Router 或独立全局状态库。这里所说的“计算器”“选择器”“费用弹窗”是该文件中的功能模块，不是已经拆出的 Vue 文件。

| 入口 | 职责 |
| --- | --- |
| [src/App.vue](../src/App.vue) | 页面、汇款计算、比较表、菜单、弹层及异步报价 |
| [src/FlagBelt.vue](../src/FlagBelt.vue) | 随滚动伸展的箭头与旋转旗帜 |
| [src/wiseData.ts](../src/wiseData.ts) | 币种、国家和功能覆盖的数据模型 |
| [src/wiseCurrencyData.ts](../src/wiseCurrencyData.ts) | 币种路线覆盖与采集的报价配置 |
| [src/style.css](../src/style.css) | 字体、页面布局、控件与响应式样式 |
| [vite.config.ts](../vite.config.ts) | 原站报价和汇率历史代理 |

建议先读 `App.vue` 的状态及 computed，再读 `requestLiveQuote`、选择器事件和模板，最后查 CSS。不能只从截图推断报价是静态常量。

## 2. 视觉风格

| 规则 | 当前实现与用途 |
| --- | --- |
| 品牌色 | `--forest: #163300`、`--lime: #9fe870`；深绿承担正文和深色区块，亮绿用于主要行动 |
| 中性色 | `--ink: #0e0f0c`、`--neutral: #eef0ec`、`--line: #d5d7d3`；费用、表格及输入区依靠层级与分隔线区分 |
| 字体 | CSS 加载 Averta、Wise Sans、Inter；全局默认 Inter，具体标题与区域存在覆盖 |
| 构图 | 大标题与明确的金额输入并置，长页面穿插深绿品牌段落、对比表和用户评价 |
| 控件 | 圆角输入、胶囊行动按钮、旗帜币种标识、说明图标；金额和费率优先可读性 |
| 响应式 | 桌面菜单与定位选择器，手机导航层与费用/帮助浮层；页脚按断点改为折叠组 |

样式文件包含多轮还原覆盖，修改颜色、字号或布局前应查找同一选择器的后续定义，以最终级联结果为准。

## 3. 核心交互

| 用户动作 | 状态变化 | 可见结果 |
| --- | --- | --- |
| 修改付款金额 | 更新金额及编辑草稿，触发延迟报价 | 收款金额、费用、到账提示、节省金额联动 |
| 选择付款/收款币种 | 更新对应币种和可用路线 | 币种旗帜、可选目标和计算结果更新 |
| 在比较表中修改币种或金额 | 使用独立的 comparison 状态 | 比较表更新，不覆盖主计算器输入 |
| 打开币种搜索 | 设置 `selector`、上下文、搜索词和活动索引 | 桌面浮层或手机选择界面，输入获得焦点 |
| 查看费用与汇率 | 切换费用页签、说明类型或历史周期 | 费用分项、供应商信息、历史曲线 |
| 展开导航或地区设置 | 互斥更新菜单与弹层 | 展示导航分组或语言/国家搜索 |
| 滚动页面 | 更新滚动方向、可见区域和 CSS 变量 | 导航收起/出现，旗帜带伸展和旋转 |

## 4. 核心模块代码解析

### 4.1 汇款计算器：输入、有效报价与回退分层

入口：`App.vue` 的 `sendAmount`、`sendAmountDraft`、`matchingLiveQuote`、`exchangeRate`、`feeAmount`、`receiveAmount`。

金额输入将“正在编辑的字符串”与“参与计算的数字”分开。`beginSendAmountEdit`、`updateSend`、`finishSendAmountEdit` 负责切换，避免每次键入都被千分位格式化打断，尤其是输入小数时。

报价显示按以下次序取值：

1. 与当前付款币种、收款币种、付款金额均匹配的远端报价。
2. `wiseQuoteProfiles` 中适用的采集配置，主要用于 HKD 路线。
3. 基于 `toHkd` 与本地费率的估算。

本地收款计算为 `max(0, (付款金额 - 手续费) × 汇率)`。有匹配报价时直接使用其 `targetAmount`，不能把估算公式当作 Wise 的真实定价规则。

`requestLiveQuote` 获取 `/wise-reference/`，用 `DOMParser` 解析 `__NEXT_DATA__`，提取报价及视图模型。请求通过 `AbortController` 取消旧任务，computed 再验证报价参数，防止快速改币种后显示旧报价。主计算器与比较表分别持有 controller 和 timer；动态收费路线另有 60 秒刷新逻辑。

实现思路：把输入状态、远端结果和展示派生值分层。新增报价字段时，应同时处理远端正常返回、字段缺失、请求失败和输入已变化四种情况。

### 4.2 币种选择器：共享 UI，隔离上下文

入口：`selectorContext`、`availableTargetCurrencies`、`availableComparisonTargetCurrencies`、`openSelector`、`chooseCurrency`、`onSelectorKeydown`。

`SelectorType` 区分国家、付款币种、收款币种；`SelectorContext` 区分主计算器和比较表。可用目标来自 `wiseTargetCurrenciesBySource`，不是所有币种任意组合。搜索按币种代码与名称过滤，再分为热门和其余选项。

桌面定位由 `updateSelectorPosition` 读取触发器尺寸并计算可用高度。键盘活动项与选中项分离，方向键移动活动项，确认动作才提交选择。关闭时恢复触发按钮焦点。

实现思路：共享过滤、定位和键盘逻辑，但让“把结果写到哪组状态”由上下文决定。新增第三种调用入口时，不应复制整个弹层。

### 4.3 费用比较与历史曲线

入口：`feeDetailRows`、`matchingLiveComparisonQuote`、`refreshRateHistory`、`ratePeriod`、`onFeeTabKeydown`。

费用分项优先采用报价的明细，没有时再由本地服务费与动态费组成。比较区的数据状态与主输入独立；历史请求随币种和周期变化，使用独立的取消控制器。

实现思路：费率、费用和供应商结果的来源必须保持一致。修改历史周期时，应检查新请求失败后是否仍展示了另一币种的旧数据，而不是只检查曲线能否画出。

### 4.4 菜单、地区抽屉与焦点管理

入口：`openMobileMenu`、`openLanguageDrawer`、`openLocalePopover`、`closeOverlays`、`trapFocus`、`onKeydown`。

菜单、地区抽屉、费用弹窗均用明确的 ref 管理。打开时记住先前焦点，渲染后聚焦第一个可用控件；Tab 在当前层内循环，Escape 按当前状态关闭。地区抽屉内部还有第二层国家/语言搜索，因此关闭内部选择器与关闭整个抽屉不是同一个动作。

实现思路：弹层可见性、背景滚动和焦点恢复应同时设计。仅添加 `v-if` 不足以完成键盘交互。

### 4.5 FlagBelt：滚动值映射到 CSS

入口：`FlagBelt.vue` 的 `scheduleScroll`、`updateScroll`、`resetMotion`。

scroll 事件只安排一个 `requestAnimationFrame`，同一帧多个事件不会重复布局计算。组件离开视口或用户选择减少动态效果时跳过更新。

以 `distance = innerHeight - 元素顶部` 为输入，箭头宽度写入 `distance × 0.8px`，旗帜旋转写入 `distance × 0.4deg`。布局由 CSS 自定义属性驱动，反向滚动自然产生反向变化。卸载时移除监听并取消未执行的帧。

实现思路：装饰动画无需把每帧数值写回页面业务状态，直接更新局部 CSS 变量即可；国旗图片仍使用 Wise 的远端地址。

## 5. 维护与验证

在本项目目录运行 `npm test`、`npm run typecheck`、`npm run build`。已有测试见 [tests/App.test.ts](../tests/App.test.ts) 和 [tests/contracts.test.mjs](../tests/contracts.test.mjs)，覆盖导航地址、金额编辑、选择器、弹层与旗帜带等行为。

手动回归应覆盖：小数输入、快速切换两个币种、无可用路线、远端报价失败、手机弹层、Tab/Escape、减少动态效果，以及修改比较表不影响主计算器。

报价代理仅在 Vite dev/preview 配置中定义；部署纯静态产物时需要另外实现对应代理，或接受本地回退。注册、登录与汇款按钮跳转 Wise。文档描述已有代码与测试覆盖，不代表本次重新执行过应用测试。
