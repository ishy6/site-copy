# Wise 产品导航：分区展开与焦点归还

组件 ID：`wise-product-navigation`。主要代码在 [WiseProductNavigation.vue](../src/library/wise/WiseProductNavigation.vue#L1)，数据结构在 [wiseNavigation.ts](../src/library/wise/wiseNavigation.ts#L1)，标志在 [WiseBrandMark.vue](../src/library/wise/WiseBrandMark.vue#L1)。

此组件负责切换 Personal / Business / Platform 的导航内容，展开或收起链接面板，并通过原生链接导航。它不是路由器，也没有鼠标悬停延迟、拖拽菜单或覆盖整个页面的模态遮罩。

## 数据和参数

| 参数 | 类型 | 默认值 | 使用位置 |
| --- | --- | --- | --- |
| `items` | `WiseNavigationItem[]` | `wiseNavigationItems` | 顶部触发按钮、移动端分区、当前面板 |
| `initialSection` | `string` | `personal` | 初始化 `activeId`；变化时由 watch 同步 |
| `initiallyOpen` | `boolean` | `true` | 初始化 `open`；变化时由 watch 同步 |
| `registrationHref` | `string` | `https://wise.com/register` | Register 的真实 href 和 navigate 载荷 |

分区数据必须有稳定且唯一的 `id`。当前高亮、DOM `data-section` 和 Escape 后查找触发按钮都使用该字段；不要用重复 ID。

<!-- source: src/library/wise/wiseNavigation.ts#L1-L9 -->
```ts
export interface WiseNavigationItem {
  id: string
  label: string
  title: string
  description: string
  image: string
  href: string
  links: { label: string; href: string }[]
}
```

`label` 是导航按钮名称，`title` 和 `description` 属于面板主入口，`image` 同时作为真实图片源。`href` 是主入口地址，`links` 是右侧细分资源；没有把地址从 label 拼接出来的逻辑。

| 事件 | 载荷 | 是否控制实际导航 |
| --- | --- | --- |
| `update:section` | 选中分区的 `id: string` | 不控制 href，仅通知分区切换 |
| `navigate` | 链接的 `href: string` | 通知事件；原生 a 仍执行默认导航 |

组件没有 `update:open`。菜单图标切换和 Escape 收起不会通知宿主当前 open 值。`initiallyOpen` 是可以后续同步的初值属性，不能直接写成 `v-model:open`。

## 内部状态与后备选择

<!-- source: src/library/wise/WiseProductNavigation.vue#L10-L18 -->
```ts
const emit = defineEmits<{ navigate: [href: string]; 'update:section': [id: string] }>()
const panelId = useId()
const open = ref(props.initiallyOpen)
const activeId = ref(props.initialSection)
const active = computed(() => props.items.find(item => item.id === activeId.value) ?? props.items[0])
const triggers = ref<HTMLButtonElement[]>([])
const menuButton = ref<HTMLButtonElement>()
watch(() => props.initialSection, value => { activeId.value = value })
watch(() => props.initiallyOpen, value => { open.value = value })
```

`useId()` 为每个组件实例创建面板 ID，桌面和移动端按钮的 `aria-controls` 指向同一面板。多实例不会复用手写的固定 ID。

`activeId` 找不到对应数据时，`active` 返回第一项。这个后备操作没有修改 `activeId` 或 emit；如果需要在 URL 中保存校正结果，应由父组件校验传入 ID。`items=[]` 时 `active` 为 undefined，`v-if="open && active"` 阻止渲染面板。

`triggers` 收集循环渲染的桌面按钮引用。代码通过 `data-section` 查找，而不是假设数组位置永远与分区固定对应。

## 点击分区的逐步行为

<!-- source: src/library/wise/WiseProductNavigation.vue#L19-L23 -->
```ts
function choose(item: WiseNavigationItem) {
  open.value = activeId.value === item.id ? !open.value : true
  activeId.value = item.id
  emit('update:section', item.id)
}
```

1. 点击当前分区时，先将面板开关取反。
2. 点击另一分区时，强制展开面板，避免切换后仍保持关闭。
3. 写入当前 ID，`active` 重算，替换图片、标题、描述和资源链接。
4. emit `update:section`；即使点击同一个分区只是收起，也仍发送该 ID。
5. `open && active?.id === item.id` 同时驱动桌面按钮 `.active` 和 `aria-expanded`。

移动端 `.mobile-sections` 按钮是另一条执行路径：直接写 `activeId` 并 emit，保持面板展开。它没有调用 `choose`，因此重复点击不会关闭面板。

右侧菜单按钮只做 `open = !open`，同步切换 `Menu` / `X` 图标、`aria-expanded` 以及无障碍名称。没有图标旋转动画或 JS 鼠标样式切换。

## Escape 和焦点归还

<!-- source: src/library/wise/WiseProductNavigation.vue#L24-L29 -->
```ts
function close() {
  open.value = false
  const trigger = triggers.value.find(item => item.dataset.section === active.value?.id)
  if (trigger?.offsetParent) trigger.focus()
  else menuButton.value?.focus()
}
```

根 `<header>` 的 `@keydown.esc.stop.prevent="close"` 接住后代冒泡的 Escape，阻止继续冒泡和浏览器默认动作。先关闭，再寻找当前桌面分区按钮；`offsetParent` 用于判断它是否仍在布局中。桌面按钮在窄容器中 `display:none` 后，焦点转交移动端菜单按钮。

这里没有 focus trap。面板是普通导航披露区，Tab 可继续访问外部内容。没有监听点击外侧自动关闭，也没有捕获滚动或给 document 上锁；这些行为不能从“可展开菜单”名称推断出来。

桌面分区使用普通按钮，Tab / Enter / Space 走浏览器默认行为；没有 `role="tablist"` 和左右方向键切换。移动端选择使用 `aria-pressed`，表达其当前状态。

## 样式如何跟随状态

样式集中在 [SFC 样式段](../src/library/wise/WiseProductNavigation.vue#L50)。桌面 `.product-tabs button.active` 把背景切到 `#163300`、文字切到 `#9fe870`。注册按钮始终使用荧光绿背景。

`.wise-navigation button { cursor:pointer }` 是静态 CSS，不由某个鼠标事件修改。资源链接 hover 只加下划线；所有链接与按钮通过 `:focus-visible` 显示 2px 焦点框。

容器宽度 520px 以下隐藏桌面分区，显示菜单按钮与面板内分区。350px 以下将 `.panel-content` 改为单列，同时把主入口图片缩为 74px 的左列。触发的是 `@container`，嵌入窄栏也能切换布局。

面板使用 `v-if`，关闭时链接节点被移除，而不只是透明化。这样隐藏导航不会继续出现在 Tab 顺序中。再次展开会重新创建这些节点。

## 完整接入示例

将示例放在 `src/examples/NavigationExample.vue`。示例链接指向宿主自身的哈希锚点；`navigate` 只记录地址，实际导航仍由 a 标签完成。

<!-- example -->
```vue
<script setup lang="ts">
import { ref } from 'vue'
import WiseProductNavigation from '../library/wise/WiseProductNavigation.vue'
import type { WiseNavigationItem } from '../library/wise/wiseNavigation'

const section = ref('account')
const lastHref = ref('')
const items: WiseNavigationItem[] = [{
  id: 'account',
  label: 'Account',
  title: 'Manage your account',
  description: 'Balances and payment records.',
  image: '/assets/wise/nav-personal.jpg',
  href: '#account',
  links: [
    { label: 'Balances', href: '#balances' },
    { label: 'Activity', href: '#activity' },
  ],
}]
function recordNavigation(href: string) {
  lastHref.value = href
}
</script>

<template>
  <WiseProductNavigation
    :items="items"
    :initial-section="section"
    :initially-open="true"
    registration-href="#register"
    @update:section="section = $event"
    @navigate="recordNavigation"
  />
  <output>{{ section }} {{ lastHref }}</output>
</template>
```

## 已有验证与接入边界

[wise-core.test.ts](../src/library/wise/wise-core.test.ts#L9) 验证点击 Business 后主入口标题变化，精确断言 `update:section` 为 `['business']`，然后发送 Escape 并确认面板消失与 `aria-expanded="false"`。

该单测没有断言真实浏览器中的焦点归还，因为 `offsetParent` 与 CSS 容器查询依赖布局引擎；接入不同容器后应实际检查窄宽度下 Escape 返回菜单按钮。链接的外站是否可达也不是这个测试的职责。

父组件若需要单页路由，应传可用 href 或另行适配链接渲染；仅处理 `navigate` 无法 `preventDefault`，因为事件载荷只有字符串，没有 MouseEvent。不要同时执行一次路由跳转并假定原生导航被取消。

没有计时器、Object URL 或全局监听需要卸载清理。导出时必须同时带上 `WiseBrandMark.vue`、`wiseNavigation.ts`、使用到的本地图像与字体。
