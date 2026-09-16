# Osmo 展开导航：ExpandingNavigation

组件 ID：`osmo-expanding-navigation`。源码：[ExpandingNavigation.vue](../src/library/osmo/ExpandingNavigation.vue#L1)。从原站 header/menu-expansion 抽象为有明确开关状态的导航，分组数据与业务事件可注入。

## 参数和事件

| prop | 类型 | 默认值 | 作用 |
| --- | --- | --- | --- |
| `brand` | `string` | `'Osmo'` | 中央品牌文字 |
| `initiallyOpen` | `boolean` | `true` | 初始化展开状态；后续变化也同步内部 open |
| `joinLabel` | `string` | `'Join'` | 右侧行动按钮文案 |
| `items` | `{label:string;href?:string;group:string}[]` | 6 项，2 组 | 菜单数据，含产品和 Explore 分组 |

| emit | 参数 | 触发点 |
| --- | --- | --- |
| `navigate` | 完整 `{label,href?,group}` 对象 | 分组菜单项，或课程 Discover 按钮 |
| `join` | 无参数 | 顶栏 Join 按钮 |
| `open-change` | `boolean` | open 实际变化，由 watcher 发出 |

组件引用 MotionButton 和其 ButtonLabel；课程图使用 `/assets/osmo/toolkit-course.avif`。课程推荐栏目前是固定内容，不随 items 自动变化；菜单 items 是可替换部分。

## 状态与关闭顺序

<!-- source: src/library/osmo/ExpandingNavigation.vue#L12-L18 -->
```ts
const emit = defineEmits<{ navigate: [item: { label: string; href?: string; group: string }]; join: []; 'open-change': [open: boolean] }>()
const open = ref(props.initiallyOpen)
const trigger = ref<HTMLButtonElement>()
const id = useId()
watch(() => props.initiallyOpen, value => { open.value = value })
watch(open, value => emit('open-change', value))
async function close() { open.value = false; await nextTick(); trigger.value?.focus() }
```

`open` 是本地状态，`initiallyOpen` 的 watcher 允许预览参数更新后重新展开/收起；它不是 v-model。初始构造 open 不会触发 open-change，因为 watcher 没有 immediate。父组件改变 initiallyOpen 导致实际 open 变化时同样会发出 open-change。

`trigger` 保存顶栏菜单按钮引用；`useId` 为菜单 body 生成实例独立 ID，避免页面放多个导航时 aria-controls 冲突。Escape 走异步 close：先 open=false，等待 Vue 删除菜单 body，再聚焦仍然存在的 trigger。

<!-- source: src/library/osmo/ExpandingNavigation.vue#L20-L27 -->
```vue
<template>
  <div class="osmo-nav" @keydown.esc.stop="close">
    <nav aria-label="Osmo navigation"><button ref="trigger" type="button" :aria-expanded="open" :aria-controls="id" aria-label="Toggle menu" @click="open = !open"><component :is="open ? X : Menu" :size="17" /><span>Menu</span></button><span class="osmo-nav__brand">{{ brand }}<Asterisk :size="22" /></span><button type="button" class="osmo-nav__join" @click="$emit('join')">{{ joinLabel }}<ArrowUpRight :size="16" /></button></nav>
    <div v-if="open" :id="id" class="osmo-nav__body">
      <div v-for="group in [...new Set(items.map(item => item.group))]" :key="group" class="osmo-nav__group"><h3>{{ group }}</h3><component :is="item.href ? 'a' : 'button'" v-for="item in items.filter(item => item.group === group)" :key="item.label" :href="item.href" :type="item.href ? undefined : 'button'" @click="emit('navigate', item); open = false">{{ item.label }}</component></div>
      <div class="osmo-nav__feature"><img src="/assets/osmo/toolkit-course.avif" alt="Page transition course" /><MotionButton label="Discover" variant="lime" @click="$emit('navigate', { label: 'Page Transition Course', group: 'Our products' })" /></div>
    </div>
  </div>
```

根节点 `@keydown.esc.stop` 接受从菜单内部冒泡的 Escape，并停止继续冒泡。菜单按钮直接取反 open；图标用动态 component 在 X/Menu 之间切换，aria-expanded 与同一 open 绑定。

分组先 `new Set(items.map(...))` 去重，保持首次出现顺序，再对每组过滤 items。不是树形菜单、也没有递归。每个分组标题不是交互元素。

菜单项 href 存在时渲染原生 a，否则渲染 button。点击先发 navigate，再 open=false；有 href 的链接没有 preventDefault，因此浏览器默认导航仍会发生。要完全由路由器接管，可给 items 省略 href 并在 navigate 中按 label 映射路由，或在业务层使用自己封装的导航策略。

课程 Discover 按钮只发 navigate，源码没有附加 open=false，因此它与普通菜单项的自动收起行为不同。Join 同样只发事件，不自动关闭菜单，也不调用注册接口。

## 可访问性及响应式细节

`nav` 有名称，trigger 同时绑定 aria-expanded、aria-controls 和 Toggle menu 标签。普通菜单项保留原生 Tab、Enter/空格语义；没有方向键菜单导航、焦点陷阱、自动聚焦第一项或全局外部点击关闭。因为这是页面内展开区域，它也没有使用 dialog。

<!-- source: src/library/osmo/ExpandingNavigation.vue#L35-L44 -->
```css
.osmo-nav__body { display: grid; grid-template-columns: 1.1fr .8fr 1fr; gap: 24px; padding: 24px; border-top: 1px solid #ffffff20; }
.osmo-nav__group { min-width: 0; display: flex; flex-direction: column; align-items: start; gap: 17px; }
.osmo-nav h3 { font-size: 10px; color: #a59f9a; font-weight: 400; margin: 0 0 6px; }
.osmo-nav__group > a, .osmo-nav__group > button { padding: 0; border: 0; text-decoration: none; text-align: left; background: none; font: inherit; color: inherit; cursor: pointer; overflow-wrap: anywhere; }
.osmo-nav__group > :hover { color: #b1ff69; }
.osmo-nav__feature { min-width: 0; display: flex; flex-direction: column; gap: 16px; }
.osmo-nav__feature img { width: 100%; aspect-ratio: 1.3; object-fit: cover; border-radius: 3px; }
.osmo-nav__feature :deep(.osmo-button) { min-height: 36px; padding: 8px 12px; font-size: 13px; gap: 12px; }
.osmo-nav button:focus-visible, .osmo-nav a:focus-visible { outline: 2px solid #b1ff69; outline-offset: 3px; }
@media(max-width: 520px) { .osmo-nav__body { grid-template-columns: 1fr 1fr; gap: 22px 14px; padding: 18px; } .osmo-nav__feature { grid-column: 1 / -1; flex-direction: row; align-items: center; } .osmo-nav__feature img { width: 90px; aspect-ratio: 1.5; } .osmo-nav nav { gap: 6px; padding: 12px; } .osmo-nav nav button > span { display: none; } .osmo-nav__brand { font-size: 19px; } }
```

宽屏 body 三列分别给两个分组和课程推荐。520px 以下改为两列，推荐栏横跨全宽并改成横向布局。顶栏 Menu 的文字 span 隐藏，但图标按钮的 aria-label 仍存在。

交互项 cursor:pointer；hover 只给链接/按钮文字改荧光绿，focus-visible 用同色轮廓。没有 drag 或触摸滑动识别。菜单 v-if 直接挂载/移除，没有基于高度的展开动画、Transition 或 setTimeout。

## 可运行接入示例

示例文件放在 `src/examples/`，使用业务事件选择内容，不产生隐式链接跳转。

<!-- example -->
```vue
<script setup lang="ts">
import { ref } from 'vue'
import ExpandingNavigation from '../library/osmo/ExpandingNavigation.vue'

const selected = ref('')
const items = [
  { label: '组件', group: '产品' },
  { label: '模板', group: '产品' },
  { label: '价格', group: '了解更多' },
]
function navigate(item: { label: string; href?: string; group: string }) {
  selected.value = `${item.group} / ${item.label}`
}
</script>
<template>
  <ExpandingNavigation brand="Studio" :items="items"
    :initially-open="false" join-label="加入"
    @navigate="navigate" @join="selected = '加入流程'" />
  <p role="status">{{ selected }}</p>
</template>
```

## 已有测试与边界

[core.test.ts](../src/library/osmo/core.test.ts#L83) 从分组按钮发 Escape，验证菜单被移除且焦点归还 trigger。当前测试没有覆盖 href 导航、推荐入口与菜单项关闭行为差异、多个实例及 520px 媒体查询。

items=[] 时仍有顶栏与课程推荐，分组为空；重复 label 会在相同分组产生重复 Vue key，调用方应保证每组 label 唯一。组件没有异步资源加载状态或图片错误替代，也没有自己的全局监听/定时器。
