# Jitter 产品导航：ProductNavigation

组件 ID：`jitter-product-navigation`。源码：[ProductNavigation.vue](../src/library/jitter/ProductNavigation.vue#L1)。桌面产品下拉与窄屏完整菜单使用两份独立开关，但选中任意导航项都会一起关闭，并把真实目标交给宿主。

## Props 和事件

<!-- source: src/library/jitter/ProductNavigation.vue#L5-L11 -->
```ts
export interface ProductLink { label: string; target: string; description?: string }
const props = withDefaults(defineProps<{ cta?: string; active?: string; defaultOpen?: boolean; links?: ProductLink[]; products?: ProductLink[] }>(), {
  cta: 'Try for free', active: 'Templates', defaultOpen: true,
  links: () => [{ label: 'Templates', target: '/templates' }, { label: 'Pricing', target: '/pricing' }],
  products: () => [{ label: 'Meet your new motion tool', target: '/#product', description: 'From first idea to final export.' }, { label: 'Powerful. Playful. All yours.', target: '/#features', description: 'Explore the features.' }, { label: 'Made for creative teams', target: '/#collaboration', description: 'Bring everyone into the flow.' }],
})
const emit = defineEmits<{ navigate: [target: string]; start: [] }>()
```

| prop | 默认 | 说明 |
| --- | --- | --- |
| `cta:string` | `'Try for free'` | 顶栏行动文案 |
| `active:string` | `'Templates'` | 按普通 links 的 label 精确比较 aria-current |
| `defaultOpen:boolean` | true | 桌面 Product 菜单初态，watch 后续变化 |
| `links:ProductLink[]` | Templates、Pricing | 普通页面导航 |
| `products:ProductLink[]` | Product、Features、Collaboration 对应三项 | 展开产品入口 |

`ProductLink` 有 label、target 必填，description 可选。`navigate(target:string)` 只发路径，不自动 location/router 跳转；`start()` 无参数，给宿主启动注册/编辑器业务。logo 按钮也走 navigate('/')。没有 open-change 或 active 更新事件。

## 两个开关及关闭优先级

<!-- source: src/library/jitter/ProductNavigation.vue#L12-L19 -->
```ts
const id = useId()
const open = ref(props.defaultOpen)
const mobile = ref(false)
const trigger = ref<HTMLButtonElement>()
const mobileTrigger = ref<HTMLButtonElement>()
watch(() => props.defaultOpen, value => { open.value = value })
function navigate(target: string) { open.value = false; mobile.value = false; emit('navigate', target) }
function close() { if (open.value || mobile.value) { const target = mobile.value ? mobileTrigger.value : trigger.value; open.value = false; mobile.value = false; target?.focus() } }
```

`open` 控制桌面下拉，`mobile` 控制窄屏 nav。defaultOpen 只同步 open，初始 mobile 始终 false；调整视口宽度由 CSS 决定哪套菜单可见，不会修改这两个 ref。

`navigate` 将两个开关设 false 后发事件，因此点击产品、普通链接或 logo 都收起菜单。active 不在内部修改：宿主应在导航完成后更新 active，否则内容已变而 aria-current 仍是原标签。

Escape 到 close 时，如果 mobile 为 true，优先归还 mobileTrigger，否则归还桌面 trigger；然后把两个开关都关掉。两个开关均 false 时 close 不动焦点。这里 ref 对应的 trigger 从不由 v-if 移除，所以同步 focus 不需要 nextTick。

<!-- source: src/library/jitter/ProductNavigation.vue#L23-L27 -->
```vue
  <header class="product-navigation" @keydown.esc.stop="close">
    <div class="nav-bar"><button class="logo" type="button" aria-label="Jitter home" @click="navigate('/')"><img src="/assets/jitter/jitter.svg" alt="Jitter" width="64" height="25"></button><nav class="desktop-links" aria-label="Product navigation"><button ref="trigger" type="button" :aria-expanded="open" :aria-controls="`${id}-products`" @click="open = !open">Product<ChevronDown :size="12" /></button><button v-for="item in links" :key="item.target" type="button" :aria-current="active === item.label ? 'page' : undefined" @click="navigate(item.target)">{{ item.label }}</button></nav><button class="start-button" type="button" @click="emit('start')">{{ cta }}</button><button ref="mobileTrigger" class="menu-button" type="button" :aria-expanded="mobile" :aria-controls="`${id}-mobile`" :aria-label="mobile ? 'Close menu' : 'Open menu'" @click="mobile = !mobile"><X v-if="mobile" :size="20" /><Menu v-else :size="20" /></button></div>
    <div v-show="open" :id="`${id}-products`" class="product-menu"><button v-for="(item, index) in products" :key="item.target" type="button" @click="navigate(item.target)"><span class="product-icon" :class="`tone-${index % 3}`"><component :is="[Layers, Sparkles, Users][index % 3]" :size="18" /></span><span><strong>{{ item.label }}</strong><small>{{ item.description }}</small></span><ArrowUpRight :size="15" /></button></div>
    <nav v-if="mobile" :id="`${id}-mobile`" class="mobile-links" aria-label="Mobile navigation"><button v-for="item in [...products, ...links]" :key="item.target" type="button" @click="navigate(item.target)">{{ item.label }}<ArrowUpRight :size="15" /></button></nav>
  </header>
```

desktop Product 菜单使用 v-show：关闭只改变 display，节点保留。mobile-links 使用 v-if：关闭时直接卸载。顶栏 @keydown.esc.stop 接收两套菜单子项冒泡的 Escape。

products 根据 index%3 循环选取 Layers/Sparkles/Users 图标及三种 tone；这只是视觉映射，图标不参与目标选择。mobile 合并 `[...products,...links]`，不复用桌面分组标题。

## 键盘与宽度

所有入口都是原生 button，所以 Enter/空格产生 click，Tab 按 DOM 顺序访问。桌面控制使用 aria-expanded/aria-controls，mobile 同样有展开状态与可读名称。普通导航通过 active===label 标记 aria-current=page。

没有自定义方向键列表导航、焦点陷阱或 document click 关闭。560px 以下隐藏 desktop-links 和 product-menu，显示 menu-button/mobile-links；start-button 仍在顶栏。CSS 的 `display:none!important` 确保桌面 v-show 的 inline display 不会在窄屏误显示。

导航最大宽650px，下拉宽360px且max-width100%。样式集中在源码第32行：交互 button 固定 cursor:pointer；产品项 hover 改淡背景，focus-visible 用紫色轮廓。无拖拽、指针手势、scroll listener 或动画定时器。

## 接入示例

文件放在 `src/examples/`。target 属于业务路由信息，不是浏览器会自动打开的 href。

<!-- example -->
```vue
<script setup lang="ts">
import { ref } from 'vue'
import ProductNavigation, { type ProductLink } from '../library/jitter/ProductNavigation.vue'

const active = ref('Templates')
const page = ref('/templates')
const links: ProductLink[] = [
  { label: 'Templates', target: '/templates' },
  { label: 'Pricing', target: '/pricing' },
]
function navigate(target: string) {
  page.value = target
  active.value = links.find(item => item.target === target)?.label ?? ''
}
</script>
<template>
  <ProductNavigation :links="links" :active="active" :default-open="false"
    @navigate="navigate" @start="page = '/editor'" />
  <p role="status">当前目标：{{ page }}</p>
</template>
```

## 测试及边界

[core.test.ts](../src/library/jitter/core.test.ts#L9) 验证产品入口发 '/#product'、桌面 expanded=false、start 发出；[移动焦点测试](../src/library/jitter/core.test.ts#L19) 验证 Escape 删除 mobile-links 并归还菜单按钮。

测试未覆盖实际560px CSS切换、所有键盘组合或空数组。空 products 会保留空下拉容器；重复 target 在同一列表会产生重复key。组件没有异步或清理工作；无需把导航选择误称为“已成功切换路由”。
