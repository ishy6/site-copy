# 21TSI 章节进度导航：ProgressNavigation

组件 ID：`tsi-progress-navigation`。源码：[ProgressNavigation.vue](../src/library/tsi/ProgressNavigation.vue#L1)。当前章节驱动导航高亮、线段进度、节点状态、说明和计数；窄屏提供可开关菜单。这里的进度由章节索引计算，不是浏览器滚动位置。

## 数据契约

| prop | 类型 | 默认 |
| --- | --- | --- |
| `items` | `NavigationItem[]` | The Sphere Lab/Join The Team/Invest三项 |
| `activeIndex` | number | 0，后续修改同步内部selected |
| `contactLabel` | string | Contact |
| `showContact` | boolean | true，CSS仍会在窄屏隐藏 |

`NavigationItem`为`{label:string;description?:string}`。`navigate(index:number)`返回序号，不带路由、对象或滚动目标；`contact()`无参数。业务页面滚动、路由切换与联系表单均由宿主实现。

## 状态和进度公式

<!-- source: src/library/tsi/ProgressNavigation.vue#L24-L36 -->
```ts
const emit = defineEmits<{ navigate: [index: number]; contact: [] }>()
const id = useId()
const selected = ref(Math.max(0, Math.min(props.activeIndex, props.items.length - 1)))
const expanded = ref(false)
const current = computed(() => props.items[selected.value] ?? props.items[0])
const progress = computed(() => props.items.length <= 1 ? 100 : Math.max(0, selected.value) / (props.items.length - 1) * 100)
function select(index: number) {
  selected.value = index
  expanded.value = false
  emit('navigate', index)
}
watch(() => props.activeIndex, value => { selected.value = Math.max(0, Math.min(value, props.items.length - 1)) })
watch(() => props.items.length, value => { selected.value = Math.max(0, Math.min(selected.value, value - 1)) })
```

selected保存索引；expanded是窄屏菜单开关；current取选中对象，缺失时退回items[0]；progress在多项时为selected/(length−1)×100，0、1、2对应0%、50%、100%。

一个或零项目时progress固定100，避免除0；空数组footer显示00/00、current标题退回21TSI，但底线填充仍100%。这个行为来自公式，不代表业务流程真的已完成。

select同时写selected、关expanded并emit navigate。activeIndex与items.length watcher只钳制索引，不发navigate；外部同步当前章节不会让宿主再次收到导航请求。没有Math.trunc/Number.isFinite，小数或NaN不是受支持输入。

## 一次选择如何更新整块内容

<!-- source: src/library/tsi/ProgressNavigation.vue#L39-L46 -->
```vue
<template>
  <section class="progress-navigation">
    <div class="nav-heading"><img src="/assets/tsi/logo-small.svg" alt="21TSI" width="72" height="22"><button class="mobile-toggle" type="button" :aria-label="expanded ? 'Close navigation' : 'Open navigation'" :aria-expanded="expanded" :aria-controls="`${id}-navigation`" @click="expanded = !expanded"><X v-if="expanded" :size="20" /><Menu v-else :size="20" /></button><button v-if="showContact" class="contact-button" type="button" @click="emit('contact')"><span></span>{{ contactLabel }}<ArrowUpRight :size="15" /></button></div>
    <nav :id="`${id}-navigation`" :class="{ expanded }" aria-label="Sections"><button v-for="(item, index) in items" :key="index" type="button" :class="{ selected: selected === index }" :aria-current="selected === index ? 'page' : undefined" @click="select(index)"><span class="active-dot"></span><span>{{ item.label }}</span><span class="nav-number">0{{ index + 1 }}</span></button></nav>
    <div class="progress-line" aria-hidden="true"><span class="progress-fill" :style="{ width: `${progress}%` }"></span><i v-for="(_, index) in items" :key="index" :class="{ filled: index <= selected }" :style="{ left: `${items.length <= 1 ? 100 : index / (items.length - 1) * 100}%` }"></i></div>
    <div class="nav-current"><div><span class="section-label">EXPERIMENTATION & MOMENTUM</span><h3>{{ current?.label ?? '21TSI' }}</h3><p>{{ current?.description }}</p></div><ArrowDownRight :size="56" :stroke-width=".9" aria-hidden="true" /></div>
    <div class="nav-footer"><span>SPORT. TECHNOLOGY. INNOVATION.</span><span>{{ String(items.length ? selected + 1 : 0).padStart(2, '0') }} / {{ String(items.length).padStart(2, '0') }}</span></div>
  </section>
```

点击第三章节 → select(2) → selected=2、expanded=false → nav按钮selected类和aria-current转到第三项 → progress-fill宽100% → 所有index≤2的节点加filled → current标题/description更新 → footer显示03/03。

进度节点用相同分母计算left，并translateX(-50%)居中。整条progress-line aria-hidden=true，作为装饰不向读屏提供独立进度条语义；读屏可通过aria-current与章节按钮获知当前选择。没有role=progressbar或aria-valuenow。

移动菜单按钮取反expanded，切Menu/X图标、aria-expanded和aria-controls。选章节会自动关闭菜单；代码没有Escape处理、外部点击关闭或选中后focus归还。因此文档不能把它等同于另一个带Escape/focus恢复的Jitter导航。

## 宽屏、容器宽度与光标

根设置container-type:inline-size；CSS同时提供max-width400px的container/media规则。窄环境隐藏contact-button，显示mobile-toggle，nav默认display:none，仅nav.expanded显示一列。showContact=true并不保证窄屏可见联系入口。

宽屏nav是固定3列；自定义更多items将按3列换行。选中点由opacity0→1控制，progress-fill以width .4s过渡；减少动态效果移除这一transition。没有基于scroll监听更新activeIndex，也没有IntersectionObserver。

导航、联系、移动开关均原生button，支持Tab/Enter/空格，focus-visible浅绿轮廓。没有方向键导航、拖拽、range或pointer事件。光标固定pointer；联系hover只反转背景/文字及圆点颜色，不改变cursor。

## 接入示例：由宿主驱动章节

示例放在 `src/examples/`。宿主接收index后决定实际内容，组件只负责导航选择。

<!-- example -->
```vue
<script setup lang="ts">
import { ref } from 'vue'
import ProgressNavigation, { type NavigationItem } from '../library/tsi/ProgressNavigation.vue'

const active = ref(0)
const contact = ref(false)
const items: NavigationItem[] = [
  { label: '研究', description: '了解当前研究方向。' },
  { label: '团队', description: '认识项目团队。' },
  { label: '合作', description: '查看合作机会。' },
]
function navigate(index: number) { active.value = index }
</script>
<template>
  <ProgressNavigation :items="items" :active-index="active"
    contact-label="联系" @navigate="navigate" @contact="contact = true" />
  <section :aria-label="items[active]?.label">
    <p>当前章节：{{ items[active]?.label }}</p>
  </section>
  <p v-if="contact" role="status">已选择联系入口</p>
</template>
```

如果宿主通过scroll observer判断当前章节，应更新active而非重新派发navigate。业务数组重排后应重新计算active，否则内部只按索引保留位置。没有异步任务或手工全局监听需要清理。

## 测试事实

[tsi.test.ts](../src/library/tsi/tsi.test.ts#L24) 打开移动菜单、选择第3项，断言navigate=2、aria-current和h3都是Invest、菜单expanded=false；再改activeIndex=1验证Join The Team；联系按钮触发contact。

单测没有真实容器宽度、progress-fill像素宽度、空/单项数据、Escape或焦点恢复断言。后两种行为目前没有源码支持，不能以自动测试缺失掩盖成“已经提供但未测试”。
