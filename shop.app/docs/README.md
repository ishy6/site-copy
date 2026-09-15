# Shop：核心交互、视觉风格与代码解析

本文基于 2026-09-15 的本地代码，描述 <https://shop.app/> 的复刻项目。它提供本地搜索、已采集商品/商店页面与界面流程，不是 Shopify 的搜索或支付后端。

## 1. 架构与阅读入口

项目使用 Vue 3、TypeScript、Vite 和 Lucide。`App.vue` 根据 pathname 和查询参数选择页面，没有使用 Vue Router。搜索、商品、商店等目前属于一个组件中的功能模块，不能把文档中的模块名当作已有独立文件。

| 入口 | 职责 |
| --- | --- |
| [src/App.vue](../src/App.vue) | 路径解析、搜索、过滤、商品/商店页面、面板、语言与存储 |
| [src/useHeroParallax.ts](../src/useHeroParallax.ts) | 首页鼠标视差与减少动态效果处理 |
| [src/data.ts](../src/data.ts)、[src/catalogData.ts](../src/catalogData.ts) | 首页内容与商品集合 |
| [src/verifiedCatalog.ts](../src/verifiedCatalog.ts) | 可打开详情的已验证商品与商店数据 |
| [src/categoryDetailData.ts](../src/categoryDetailData.ts) | 分类主题、编辑推荐与商品货架 |
| [src/loginLocaleData.ts](../src/loginLocaleData.ts)、[src/termsLocaleData.ts](../src/termsLocaleData.ts) | 登录和条款本地化文案 |
| [src/components/SiteFooter.vue](../src/components/SiteFooter.vue)、[src/components/ShopIcon.vue](../src/components/ShopIcon.vue) | 共享页脚和图标 |
| [src/style.css](../src/style.css) | 页面、搜索浮层、商品卡和响应式布局 |

## 2. 视觉风格

| 规则 | 当前实现与用途 |
| --- | --- |
| 字体 | GT Standard 系列，另有 Heavy 和 GTStandard-M 字体声明用于不同区域 |
| 品牌色 | `--purple: #5433eb`，与白底、`#111111` 正文和 `#e8e8e8` 分隔线搭配 |
| 首页 | 围绕搜索入口安排商品媒体，素材带不同角度与深度，强调购物发现 |
| 结果页 | 紧凑工具栏、筛选胶囊、多列商品网格；图片占主导，价格和商店信息次之 |
| 商品页 | 大图、多变体选择、价格与购买入口；评论、分享等次级内容放入面板 |
| 商店页 | 品牌头部、集合导航、货架与商店信息；保留品牌内容与商品目录的层级 |
| 手机端 | 菜单和工具入口重新排布，搜索按触发来源定位，宽表面改为窄屏面板 |

当前 CSS 有后续校准覆盖。修改首屏图片位置、商品密度或搜索层时，需要查完整选择器，不能仅修改文件前部的第一条规则。

## 3. 核心交互

| 场景 | 状态/数据 | 结果 |
| --- | --- | --- |
| 首页/粘性搜索入口 | `searchOrigin`、`searchAnchor`、`searchDraft` | 在对应位置展开搜索，并保持焦点不引起页面跳动 |
| 文字搜索与历史 | `query`、`searchHistory` | URL 进入结果页，保留最多 6 条去重历史 |
| 图片搜索 | 本地文件指纹、`visualSearchSeed` | 将稳定指纹写入 URL，选择本地演示结果集合 |
| 多条件筛选 | 分类、价格、颜色、尺寸、评分、配送地、快捷条件 | computed 重新过滤并排序结果 |
| 打开商品 | 已验证的商品路径索引 | 展示详情，记录最近浏览，初始化变体和图片 |
| 商品切色/规格 | `selectedProductVariantIndexes` | 图片、选项与详情联动 |
| 商店过滤与面板 | 独立商店搜索、排序、价格、评论状态 | 商店内列表变化，不覆盖全站搜索条件 |
| 登录/保存入口 | 本地登录表单与路径导航 | 邮箱界面反馈；未连接真实账户认证 |

## 4. 核心模块代码解析

### 4.1 路由和目录边界

入口：`currentPath`、`route`、`navigate`、`syncLocation`、`currentProduct`、`currentBrand`。

`navigate` 调用 History API 后统一进入 `syncLocation`，更新路径、查询参数与页面状态；浏览器前进后退也通过同一同步逻辑恢复。商品详情通过 `verifiedProductByPath` 查找，商店路径通过已验证路径集合判断。

`canOpenProduct`、`canOpenBrand` 和分类判断限制可操作入口。页面中展示了一张商品图片，不意味着已有完整的商品详情数据。

实现思路：增加详情页时，先补完整数据与路径映射，再启用卡片点击；不要仅通过商品标题临时拼接一个未实现的 URL。

### 4.2 搜索浮层：位置、焦点和提交解耦

入口：`openSearch`、`closeSearch`、`runSearch`。

首页触发时读取搜索按钮 `getBoundingClientRect`，将位置转换为文档坐标；粘性或非首页入口使用另一种布局。打开时保存触发器、关闭其他相冲突的层，将已提交 query 复制到 draft，`nextTick` 后使用 `focus({ preventScroll: true })`。

提交先规范化文本，再更新历史并生成 `/search/results?query=...`。只有确认搜索时才改 URL，键入草稿不会立即替换页面。关闭时清理附件并恢复仍在 DOM 中的触发器焦点。

实现思路：搜索入口位置、未提交输入与正式查询是三个独立状态。合并成一个 ref 容易导致焦点滚动、返回后草稿丢失或搜索层突然换位置。

### 4.3 结果过滤管线

入口：`searchCorpus`、`visibleResultProducts`、`priceInViewerCurrencyMinor`、`matchesShippingDestination`。

先由关键词意图、商店或图片指纹选择本地语料集合，再应用文本、促销、库存、配送、分类、评分、性别、尺寸、颜色与价格过滤，最后按价格排序。价格比较统一使用查看者币种的最小货币单位，避免在显示字符串上排序。

部分评分和颜色/性别条件来自本地推断。例如结果页评分过滤会根据评论数量推导分数区间，不能将其理解成实时商品评分服务。

实现思路：新增过滤器应进入同一管线，并明确定义缺失字段如何处理。结果为空时应保留清除条件的入口；直接在模板里逐项隐藏卡片会让计数和排序不一致。

### 4.4 图片附件：本地演示匹配

入口：`fingerprintImage`、`attachImage`、`clearAttachedImage`、`pendingImageFingerprint`。

附件选择生成预览并异步计算文件指纹。`runSearch` 等待该任务，避免在计算完成前生成 URL。URL 的 `visual` 参数使刷新仍能恢复同一演示集合；“Visual matches”会按指纹选择预置 corpus。

实现思路：这里没有上传到视觉检索模型，也不具备语义识别能力。接入真实服务时应保留附件生命周期和等待机制，替换指纹到 corpus 的映射，而不是把现有结果宣称为识别结果。

### 4.5 商品与商店：共享数据，独立交互状态

入口：`currentProductImages`、`currentProductVariantOptions`、`selectProductVariant`、`openProductPanel`、`showStorePanel`。

商品图库从 gallery 获取图片，没有时回退到主图。变体按选项组保存索引，切换商品时重新初始化。评论查询、排序和评分过滤属于商品面板；商店另外维护 collection、搜索、库存、价格和评论状态。

`readStoredCart`、`readStoredRecentlyViewed` 对存储数据读取和恢复；最近浏览按商品身份去重。购买链接使用采集的 `purchaseUrl` 或 `onlineStoreUrl`，不在本地完成商家支付。

实现思路：不要把 Gathre 等已采集详情特有的数据假定为所有商店都有。新增商店时，需要同时核对购买、配送、评价和集合路径。

### 4.6 useHeroParallax：帧率无关的平滑跟随

入口：`useHeroParallax.ts` 的 `handlePointer`、`animate`、`reset`。

指针坐标归一化到 `[-1, 1]`，每帧使用 `blend = 1 - 0.85^(elapsed / (1000 / 60))` 插值到目标位置，写入 `--hero-mouse-x/y`。动画收敛后停止申请新帧，避免静止时一直占用渲染循环。

触屏、宽度不超过 900px 或减少动态效果时不跟随鼠标。媒体查询变化与 hero 引用变化都会重置坐标；卸载时取消帧并移除监听。

实现思路：素材各自的 `--hero-depth` 决定视差强度，逻辑层只输出统一的归一化位移。新增素材无需添加新的全局 pointermove 监听。

## 5. 维护与验证

运行 `npm test`、`npm run typecheck`、`npm run build`。已有测试见 [App.test.ts](../src/App.test.ts) 和 [useHeroParallax.test.ts](../src/useHeroParallax.test.ts)，涉及路由、搜索起点、历史、附件、筛选、详情数据和视差。

手动回归：从两个搜索入口打开、附件计算中提交、刷新结果 URL、多条件清空、无详情商品、变体图片、商店集合、手机弹层和浏览器后退。本文记录现有测试，不表示本次重新执行。

本地图片搜索、登录反馈与本地存储不等同于真实 Shop 服务；过滤数据和库存为采集/演示数据，外部购买和商店政策仍依赖目标站点。
