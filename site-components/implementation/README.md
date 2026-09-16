# 交互组件实现详解

本目录对应注册表中的 43 个可预览交互组件。每篇从当前 `src/library` 的实际实现出发，逐项解释参数与默认值、事件处理函数、状态更新、计算公式、DOM/CSS 变化、键盘行为、资源清理和业务接入边界，附源码位置、逐字摘录和完整 Vue 接入示例。

组件详情页的「实现详解」可阅读同一份 Markdown。点击源码引用或代码段上方的文件名会切换到 Source，并定位相应行；测试文件也可查看。文档与解析器在打开详解时加载，加载失败可重试。ZIP 包包含该组件的文档、必要源码、素材，以及文档引用的测试源码。

## Osmo：8 个组件

| 组件 | 重点执行链路 |
| --- | --- |
| [文字旋转按钮](osmo-motion-button.md) | 原生 button/a、禁用链接拦截、pointerenter/focusin 触发 Element.animate 双层文字旋转 |
| [计费周期切换](osmo-billing-switch.md) | defineModel、aria-pressed 按钮组、方向键与焦点移动、去重后的 update:modelValue |
| [展开导航](osmo-expanding-navigation.md) | 分组菜单、open 状态、导航事件、Escape 关闭与焦点归还 |
| [工具包轮播](osmo-toolkit-carousel.md) | 索引归一化、pointerdown/up 位移阈值、拖后 click 屏蔽、tablist 键盘行为 |
| [堆叠作品集](osmo-stacked-gallery.md) | 卡片相对索引到 transform/z-index、Pointer Events 切页、inert 与当前卡焦点 |
| [会员定价](osmo-pricing-plans.md) | BillingSwitch 组合、按周期取折算月价、Intl 格式化、当前周期与价格选择事件 |
| [评价轮播](osmo-testimonial-slider.md) | interval 计时器、悬停/焦点/减少动效条件、明确播放优先级与清理 |
| [视频弹层](osmo-reel-dialog.md) | 原生 dialog.showModal、按需挂载 video、原生 controls、close 时暂停与焦点恢复 |

## Wise：5 个组件

| 组件 | 重点执行链路 |
| --- | --- |
| [汇率换算](wise-currency-converter.md) | 金额 input、币种 select、汇率/手续费/到账金额 computed 与完整报价事件 |
| [产品导航](wise-product-navigation.md) | 分区按钮点击、展开/收起、Escape 后焦点归还和原生链接 navigate 事件 |
| [币种选择](wise-currency-picker.md) | 搜索过滤、listbox 活动索引、键盘确认、modelValue 同步与空结果 |
| [费用明细](wise-fee-breakdown.md) | 明细/比较 radio、有限费用合计、update:view 与注入比较数据 |
| [服务商比较](wise-provider-comparison.md) | 到账金额重算、35% 下限比例横条、单行费用展开与报价边界 |

## Shop：6 个组件

| 组件 | 重点执行链路 |
| --- | --- |
| [收藏商品卡](shop-product-card.md) | 收藏切换、update:saved/select、独立按钮、折扣与图片错误降级 |
| [分类浏览](shop-category-rail.md) | 分类组索引、roving tabindex 与键盘焦点、带分组上下文的分类选择 |
| [搜索面板](shop-search-panel.md) | 查询提交、建议/历史、文件选择、Object URL 图片预览与释放 |
| [邮箱登录](shop-email-sign-in.md) | 原生 validity、本地错误、宿主 status 回写与 reset 事件 |
| [商品筛选](shop-product-filters.md) | 排序/库存/促销/价格 range/颜色多选、价格归一化与 update:modelValue/apply |
| [商品配置](shop-product-configurator.md) | 颜色/主图/数量联动、缺货禁用、同步 add 事件与本地提示 |

## Jitter：6 个组件

| 组件 | 重点执行链路 |
| --- | --- |
| [动效卡](jitter-motion-tile.md) | HTMLVideoElement.play/pause、IntersectionObserver、页面可见性、加载占位与错误重试 |
| [动效时间线](jitter-motion-timeline.md) | 原生 range input、requestAnimationFrame、时间归一化与 ew-resize 光标 |
| [产品导航](jitter-product-navigation.md) | 桌面/移动菜单独立开关、选择后关闭、Escape 焦点归还与目标路径事件 |
| [套餐定价](jitter-pricing-plans.md) | 月/年周期按钮、读取对应月价、完整套餐与账期双参数事件 |
| [模板浏览](jitter-template-browser.md) | 本地查询与分类交集、两种清除动作、空结果、完整模板选择事件 |
| [问答折叠](jitter-faq-list.md) | 单个 opened 索引、重复点击收起、v-show、按钮与答案的 aria 关联 |

## 21TSI：4 个组件

| 组件 | 重点执行链路 |
| --- | --- |
| [焦点手风琴](tsi-focus-accordion.md) | 点击开关索引、描述与配图同步、图片错误替代、多实例 aria 关联 |
| [进度导航](tsi-progress-navigation.md) | 章节索引到进度线/节点/内容的计算、activeIndex 同步、移动菜单选择后关闭 |
| [奖项轮播](tsi-recognition-carousel.md) | 循环索引、tablist 方向键与焦点、空数组、标题 key 驱动 CSS 淡入 |
| [品牌选择器](tsi-brand-portfolio.md) | 索引到品牌详情联动、logo key 淡入、品牌切换与入口选择事件 |

## MAKR：5 个组件

| 组件 | 重点执行链路 |
| --- | --- |
| [材质商品卡](makr-product-finish.md) | 材质 ID 到图片/色板同步、change/add 事件、缺货与空数据 |
| [目录搜索](makr-catalog-search.md) | input/submit、query watch 与 computed、多关键词 AND 匹配及清空恢复 |
| [商品图库](makr-product-gallery.md) | 缩略图选择、键盘切图、原生 dialog 放大与焦点归还 |
| [规格购买](makr-variant-purchase.md) | 原生尺寸 select、单价/尺寸/数量联动、库存校验、addItem Promise 与错误恢复 |
| [购物袋](makr-shopping-bag.md) | 内部明细副本、update:items/移除、整数分币汇总、prepareCheckout Promise |

## ALSO：4 个组件

| 组件 | 重点执行链路 |
| --- | --- |
| [订阅表单](also-newsletter.md) | 原生 reportValidity、必选同意、onSubscribe Promise、失败重试和完成后重新编辑 |
| [车型配置](also-bike-configurator.md) | 三步 radio 选配、车架尺寸协调、存在性/available 校验、加价公式与 saveBuild Promise |
| [车架尺寸指南](also-frame-fit.md) | 原生 range/input、厘米内部值、英寸闭区间匹配、按原数据顺序推荐首个尺寸 |
| [骑行套件比较](also-ride-comparison.md) | 任意套件列、Set 过滤共享规格、selectedId 单选与 select(RidePackage) |

## Shupatto：5 个组件

| 组件 | 重点执行链路 |
| --- | --- |
| [照片折叠序列](shupatto-fold-sequence.md) | 72 帧/18 张图集、RAF 时钟、range 拖动、裁剪偏移与加载失败恢复 |
| [商品配色](shupatto-product-palette.md) | 产品/颜色联动、方向键、图片映射和选择事件 |
| [产品家族](shupatto-product-lineup.md) | Set 派生分类、失效分类恢复 All、filter(category)/select(product) 与空结果 |
| [地区门店目录](shupatto-store-directory.md) | 地区 select、名称 input、分组过滤与外部链接 |
| [椭圆导航](shupatto-oval-navigation.md) | 菜单展开、Escape、语言状态与焦点归还 |

## 如何对照代码

以工具包轮播为例，其触摸切页由 `pointerdown` 记录起点、`pointerup` 比较横纵位移并调用 `move` 实现。当前代码不使用 HTML `dragstart/drag/dragend`，没有跟随指针移动的 `pointermove` 和动态 `grab/grabbing` 光标。时间线和折叠播放器则使用原生 `input[type=range]` 的 `input` 事件读取进度。各篇分别说明实际绑定的事件与 CSS，不把不同交互统一称为原生拖拽。

源码摘录前的隐藏注释固定为 `<!-- source: src/library/站点/文件#L起始行-L结束行 -->`，代码块内容必须逐字对应这些行。文档中的相对链接适用于当前目录和 ZIP 的 `implementation/` 目录。接入示例以 `src/examples/Example.vue` 为位置，因此导入使用 `../library/...`；将示例移至其他目录时需调整导入路径。

## 验证与维护

在 `site-components` 目录运行：

```bash
npm run typecheck
npm test
npm run build
npm run test:implementation
npm run test:examples
```

`src/implementation.test.ts` 校验注册表与文档一一对应、源码摘录与行号、相对链接是否存在，以及示例的 Vue 编译与本地导入路径。`test:examples` 将完整示例提取到临时目录，用 `vue-tsc` 检查 props、事件和模板类型，结束后自动清理。`ImplementationView.test.ts` 检查加载、错误重试、异步结果过期与源码引用事件。浏览器检查覆盖每篇详解、Markdown/ZIP 下载、桌面与窄屏布局，以及文档请求的懒加载和失败恢复。

每篇结尾列出该组件已有测试断言和未覆盖的行为。代码编译、摘录一致性和本地演示不代表支付、汇率、登录、订阅等外部业务已经接通；请按对应篇章的宿主接口提供服务。

组件行为改变时，同步修改实现文档与源码摘录；仅行号改变也需更新 source 注释及链接。新增组件须在注册表、本目录和本索引中同时登记。底层辅助组件和共享函数归入使用它们的组件文档，避免将无独立交互价值的单图展示重新收录为组件。
