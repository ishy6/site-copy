# Site Copy 站点复刻与交互组件库

仓库包含十个可独立安装、运行和构建的站点复刻项目，以及一个用于提取、预览和复用交互组件的 `site-components` 项目。各项目使用 Vite，多数应用代码使用 Vue 3 和 TypeScript；采用快照的项目还保留已捕获的原站模板、主题脚本和本地交互适配层。

`site-components` 沿用 Osmo 的视觉风格，收录八个站点的 **43 个交互组件**及八套配色、字体。支持参数编辑、独立预览、源码与用法查看、本地收藏、代码级实现详解和包含源码、素材及实现文档的 ZIP 下载。

## 项目入口

| 目录 | 参考站点 | 在仓库根目录运行 |
| --- | --- | --- |
| `wise.com` | <https://wise.com/> | `npm run dev:wise` |
| `osmo.supply` | <https://www.osmo.supply/> | `npm run dev:osmo` |
| `shop.app` | <https://shop.app/> | `npm run dev:shop` |
| `21tsi.com` | <https://21tsi.com/> | `npm run dev:21tsi` |
| `jitter.video` | <https://jitter.video/?noredir=1> | `npm run dev:jitter` |
| `makr.com` | <https://makr.com/> | `npm run dev:makr` |
| `ridealso.com` | <https://ridealso.com/> | `npm run dev:ridealso` |
| `prod-raw.shupatto.com` | <https://prod-raw.shupatto.com/> | `npm run dev:shupatto` |
| `thoughtlab.com` | <https://www.thoughtlab.com/> | `npm run dev:thoughtlab` |
| `slush.app` | <https://slush.app/> | `npm run dev:slush` |
| `site-components` | 本地交互组件与风格库 | `npm run dev:components` |

组件库默认地址：<http://127.0.0.1:5190/>。其运行和扩展方式见 [组件库说明](site-components/README.md)，逐组件实现分析见 [实现文档索引](site-components/implementation/README.md)。

## 安装与验证

在仓库根目录按需安装项目依赖，各项目独立维护 `package.json` 和锁文件：

```bash
npm --prefix wise.com install
npm --prefix osmo.supply install
npm --prefix shop.app install
npm --prefix 21tsi.com install
npm --prefix jitter.video install
npm --prefix makr.com install
npm --prefix ridealso.com install
npm --prefix prod-raw.shupatto.com install
npm --prefix thoughtlab.com install
npm --prefix slush.app install
npm --prefix site-components install
```

以下命令依次验证十个复刻项目与组件库；任意子项目失败都会使对应命令停止：

```bash
npm run typecheck
npm test
npm run build
```

只验证组件库时：

```bash
npm run typecheck:components
npm run test:components
npm run build:components
```

## 本地交互与外部服务

账户、支付、联系和汇款相关界面按各项目自己的实现提供本地演示或跳转入口。真实认证、付款、订阅和预约需要原提供方服务，本地交互不代表已经下单、发送邮件或完成转账。

MAKR 与 ALSO 的 `public/reference/` 包含页面快照、字体、样式和缓存商品图。`scripts/` 提供源页面同步、资源缓存和验证工具。MAKR 使用 Vue 渲染快照并在本地维护导航、搜索、规格选择与购物袋；ALSO 保留原主题组件和配置器，通过本地适配层处理购物车及筛选请求。带查询参数的模板也会生成到生产构建中。

部分大视频、第三方嵌入内容，以及未捕获的 MAKR 页面仍可能依赖网络。快照中的价格、库存和文案反映捕获时的数据，不会自动跟随原站更新。素材与字体的原有授权范围不因本地复用或导出而改变。

## 项目专项验证

MAKR 和 ALSO 的浏览器检查使用本机安装的 Google Chrome。先在独立终端启动 MAKR：

```bash
npm --prefix makr.com run dev -- --host 127.0.0.1 --port 5176
```

随后运行：

```bash
npm --prefix makr.com run test:fidelity
npm --prefix ridealso.com run build
npm --prefix ridealso.com run test:fidelity
```

ALSO 浏览器测试自动在 5188 端口启动构建产物服务。MAKR 与 ALSO 当前没有 Vitest 单元测试，其 `test` 脚本允许空测试集；浏览器检查承担交互验证。

Shupatto 使用 Vue 加载 48 个日文和英文页面快照，并保留原交互模块、本地照片序列、音频、字体与 PDF 手册。开发端口为 5178；浏览器测试先构建，再在 5189 端口启动隔离预览。同步和对比方式见 [Shupatto 项目说明](prod-raw.shupatto.com/README.md)。

ThoughtLab 与 Slush 同样是独立项目，保留原站页面结构、字体、媒体和动画模块。ThoughtLab 默认开发端口为 5179，Slush 为 5180；各自的浏览器测试构建后使用 5191 和 5192 端口。可从根目录分别验证：

```bash
npm run typecheck:thoughtlab
npm run test:thoughtlab
npm run build:thoughtlab
npm run typecheck:slush
npm run test:slush
npm run build:slush
```

页面覆盖、资源同步、截图证据及外部服务边界分别见 [ThoughtLab 项目说明](thoughtlab.com/README.md) 和 [Slush 项目说明](slush.app/README.md)。
