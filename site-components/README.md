# Site Components 交互组件库

独立的 Vue 3 + TypeScript + Vite 组件展示项目。界面延续 `osmo.supply` 的 Haffer 字体、黑白底色、紫色与荧光绿点缀。收录八个站点的 43 个可独立预览交互组件，原站无需同时启动。

## 运行

```bash
npm install
npm run dev
```

默认地址为 `http://127.0.0.1:5190`。也可在仓库根目录执行 `npm run dev:components`。

```bash
npm run typecheck
npm test
npm run build
npm run test:browser
npm run test:loading
npm run test:implementation
npm run test:examples
npm run test:highlighting
```

浏览器检查需要本机 Google Chrome 与已启动的服务器。`test:browser` 和 `test:implementation` 可通过 `COMPONENTS_TEST_URL` 指向其他地址，包括 `npm run preview` 启动的生产预览；`test:loading` 拦截开发源码请求，必须使用开发服务器。常规截图和下载包检查结果保存在 `/tmp/site-components-verification`。

## 组件目录

| 来源 | 数量 | 核心组件 |
| --- | --- | --- |
| Osmo | 8 | 旋转按钮、计费切换、展开导航、工具包轮播、堆叠作品集、会员定价、评价轮播、视频弹层 |
| Wise | 5 | 汇率换算、产品导航、币种选择、费用明细、服务商比较 |
| Shop | 6 | 收藏商品卡、分类浏览、搜索面板、邮箱登录、商品筛选、商品配置 |
| Jitter | 6 | 动效卡、时间线、产品导航、套餐定价、模板浏览、问答折叠 |
| 21TSI | 4 | 焦点手风琴、进度导航、奖项轮播、品牌选择器 |
| MAKR | 5 | 材质商品卡、目录搜索、商品图库、规格购买、购物袋 |
| ALSO | 4 | 订阅表单、模块化车型配置、车架尺寸指南、骑行套件比较 |
| Shupatto | 5 | 照片折叠序列、商品配色、产品家族、地区门店目录、椭圆导航 |

`Existing component` 表示从原站已有组件提取，`Extracted pattern` 表示从页面区域或样式中抽象。注册表记录精确来源，组件的封装边界由 props、emits 与插槽定义。

收录标准：组件须具有可直接操作的任务行为，例如选项联动、搜索筛选、计算、表单校验、内容切换、媒体控制，或是这些流程使用的基础控件。仅展示单图、静态信息、hover 装饰或附带跳转按钮的卡片不作为独立组件收录。图片可作为交互中的素材，属性面板能修改文案或图片不等于组件具有交互。

## 预览和复用

- 列表支持中英文搜索、站点与类别筛选、名称排序和本地收藏。
- 详情提供实时预览、桌面/平板/手机宽度、可编辑参数、重置、实现详解、源码、使用示例和独立预览链接。
- 所有预览运行在独立 iframe 中；组件样式使用 scoped CSS，字体使用独立名称，避免各站点视觉样式互相覆盖。
- 组件实现按需加载，列表缩略图接近可视区域时才创建 iframe。首屏、预览和源码均有 loading 状态；预览画布尺寸固定，组件及首屏素材就绪后显示内容，加载失败可重试。
- Source 只请求当前文件，成功结果缓存；复制和 ZIP 下载复用同一加载器，压缩工具也在下载时才加载。
- 「实现详解」逐项展示完整 API、事件处理、状态计算、DOM/CSS 更新、键盘行为与业务边界，附真实代码摘录与行号。点击源码引用可跳到对应文件并定位代码。文档和 Markdown 解析器按需加载，提供加载态、重试、复制和 Markdown 下载。
- 实现详解、Source 与 Usage 使用 Shiki 的 VS Code Dark+ 语法高亮，支持 Vue 内嵌模板、TypeScript 和 CSS；高亮引擎与语法按需加载，复制和导出保留原始代码，高亮不可用时仍可阅读纯文本。
- Download 导出 ZIP，包含 `src/library` 中的依赖文件、`public/assets` 中的必要图片/视频/字体、`implementation/<组件 ID>.md` 详解及中文集成说明。文档引用的测试文件作为阅读参考一起提供，运行它们需使用完整项目。Osmo 包额外提供字体样式表。下载后的组件依赖 Vue 3.5+，图标组件依赖 lucide-vue-next 1.x。
- Styles 展示八个项目的真实配色与字体。色板可复制，CSS 变量可下载；字体资源随对应组件包提供。
- 列表、商品、选项、价格和业务回调通过 props / emits 注入；轮播、筛选、选配、数量和表单保留完整的本地交互。MAKR 与 ALSO 的异步操作回调使用 `addItem`、`prepareCheckout`、`saveBuild` 等名称，与结果事件分开。
- 收藏只保存在当前浏览器的 localStorage。站点没有后端；Wise 汇率是可注入的本地示例数据，登录、购买、结算和订阅由宿主服务接入。

商品、文章中的真实来源链接会打开原站。使用示例中的服务端地址和回调由接入方实现。字体与媒体来自仓库中的站点参考资源，沿用原有授权范围。

Shupatto 的折叠播放器使用 18 张真实图集中的 72 帧，支持播放、暂停、进度拖动、重置及失败恢复；门店目录包含 23 个地区的快照数据。`node scripts/extract-shupatto.mjs` 可从相邻原站快照重新生成数据和素材，需要先安装 `prod-raw.shupatto.com` 的依赖。

## 实现文档

[实现详解总索引](implementation/README.md) 按八个站点列出 43 篇文档和各自的核心机制。文档基于当前 `src/library` 的真实代码，区分原生 DragEvent、Pointer Events 与 range 输入事件；光标、焦点、动画和网络请求仅按已实现行为说明。

每段源码前使用 `<!-- source: src/library/...#L起始行-L结束行 -->` 标记。`npm test` 会对照实际文件校验摘录、行号、链接和 Vue 接入示例；实现修改后需同步更新文档。源码链接含测试文件，可在 Source 中阅读。

## 新增组件

1. 在 `src/library/<site>/` 中添加独立 Vue SFC，封装参数、事件与样式；仅依赖本目录代码和声明的 npm 依赖。
2. 将必要素材放到 `public/assets/<site>/`，控制体积，避免引用其他项目的运行服务。
3. 在 `src/registry/` 对应文件中添加 `ComponentEntry`，通过 `loadComponent: () => import(...)` 登记组件，并填写来源、分类、标签、可编辑 props、使用示例、所有源文件与素材。
4. 新站点需在 `src/registry/index.ts` 的 `sites` 中登记配色、字体与真实来源文件，并在 `SiteId` 中登记 ID。
5. 新建 `implementation/<组件 ID>.md`，补齐接口、事件链路、源码摘录、状态与样式、示例、测试边界，并在 `implementation/README.md` 登记。
6. 运行类型检查、相关行为测试、文档校验、生产构建和浏览器检查。

动态数组、复杂业务回调及插槽通过组件 API 使用，属性面板仅暴露适合直接编辑的基础参数。Vue SFC 中的 TypeScript 定义是完整 API 的来源。

## 结构

```text
src/
  library/       可带走的站点组件及其局部依赖
  registry/      组件目录、来源、参数、打包清单与风格数据
  components/    组件站工作台、隔离预览和目录界面
  catalog-state.ts
  export.ts
  implementation.ts       按需请求与缓存实现文档
  implementation-content.ts  Markdown 解析、净化和源码引用
implementation/  每个组件的代码级中文详解与总索引
public/assets/   组件所需本地素材与字体
scripts/         浏览器验证
```

组件使用原生交互语义、键盘操作和 `prefers-reduced-motion`。测试覆盖组件业务行为、目录筛选、链接参数防护、导出依赖闭包与示例编译。浏览器检查逐一打开所有组件的 720px / 320px / 280px 预览并下载 ZIP，验证素材加载、缩略图完整性、移动端溢出、目录操作及真实折叠画面的像素变化。

`test:loading` 使用开发服务器模拟延迟请求和网络失败，检查首屏占位、列表按需挂载、预览参数同步、源码按需请求和重试；截图保存在 `/tmp/site-components-loading`。

`test:implementation` 检查全部详解、源码定位、Markdown 与 ZIP 下载、320px 窄屏、延迟请求和错误重试；截图保存在 `/tmp/site-components-implementation`。Markdown 请求失败在面板内重试，解析器脚本加载失败时刷新页面并回到当前详解；`#/component/<组件 ID>?tab=implementation` 可直接打开详解。

`test:examples` 从实现文档提取完整 Vue 示例，在临时目录中执行 `vue-tsc`，检查参数、事件载荷、回调签名和模板类型，运行结束清理生成文件。

`test:highlighting` 验证所有组件详解的代码高亮、Source/Usage 的原文与复制、源码行定位、窄屏横向滚动，以及高亮资源按需加载；截图保存在 `/tmp/site-components-highlighting`。
