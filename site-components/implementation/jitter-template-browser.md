# Jitter 模板筛选器：TemplateBrowser

组件 ID：`jitter-template-browser`。源码：[TemplateBrowser.vue](../src/library/jitter/TemplateBrowser.vue#L1)。它提供本地模板集合的分类、文本搜索、清空与选择，不是单图卡片。默认图片来自原视频的实际帧。

## 接口

<!-- source: src/library/jitter/TemplateBrowser.vue#L4-L9 -->
```ts
export interface MotionTemplate { id: string; name: string; category: string; image: string }
const props = withDefaults(defineProps<{ title?: string; showSearch?: boolean; items?: MotionTemplate[] }>(), {
  title: 'Made to make your own.', showSearch: true,
  items: () => [{ id: '5', name: 'Stretched Type Repeater', category: 'Typography', image: '/assets/jitter/template-5-poster.jpg' }, { id: '1', name: 'The Track: Poster', category: 'Social media', image: '/assets/jitter/template-1-poster.jpg' }, { id: '6', name: 'Ripple Effect', category: 'UI & product', image: '/assets/jitter/template-6-poster.jpg' }],
})
const emit = defineEmits<{ select: [item: MotionTemplate] }>()
```

| prop | 类型 | 默认 |
| --- | --- | --- |
| `title` | string | `'Made to make your own.'` |
| `showSearch` | boolean | true，只控制搜索UI是否存在 |
| `items` | MotionTemplate[] | 三张本地模板帧 |

`MotionTemplate` 的id/name/category/image均为string。`select(item:MotionTemplate)`发完整选中对象。没有query/category受控prop，也没有filter-change事件；搜索和分类状态在实例内部。

## 两种过滤如何组合

<!-- source: src/library/jitter/TemplateBrowser.vue#L10-L14 -->
```ts
const query = ref('')
const category = ref('All')
const categories = computed(() => ['All', ...new Set(props.items.map(item => item.category))])
const results = computed(() => props.items.filter(item => (category.value === 'All' || item.category === category.value) && `${item.name} ${item.category}`.toLowerCase().includes(query.value.trim().toLowerCase())))
function clear() { query.value = ''; category.value = 'All' }
```

`categories` 从当前items的category用Set去重，按首次出现顺序生成，再把保留词All放首位。`results`执行一次filter：分类符合且搜索符合，两个条件是AND。

搜索匹配字符串为名称+空格+类别，双方lowercase，输入trim后用includes。它不是正则或模糊搜索，不依赖服务端、不排序、不做拼音匹配，也没有debounce；每次input通过v-model更新query，computed同步重算。

选择Typography后输入Social不会跨类别显示Social条目。清空搜索输入旁的小X仅query=''，会保留分类；空状态Clear filters调用clear，同时query=''、category='All'。两个清除动作有意不同。

## DOM连接和结果操作

<!-- source: src/library/jitter/TemplateBrowser.vue#L16-L16 -->
```vue
<template><section class="template-browser" :aria-label="title"><header><h3>{{ title }}</h3><label v-if="showSearch" class="template-search"><Search :size="14" /><input v-model="query" type="search" aria-label="Search templates" placeholder="Search templates"><button v-if="query" type="button" aria-label="Clear search" @click="query = ''"><X :size="13" /></button></label></header><div class="template-filters" role="group" aria-label="Template categories"><button v-for="option in categories" :key="option" type="button" :aria-pressed="category === option" @click="category = option">{{ option }}</button></div><div v-if="results.length" class="template-results"><button v-for="item in results" :key="item.id" type="button" :aria-label="`Select ${item.name}`" @click="emit('select', item)"><img :src="item.image" :alt="item.name" loading="lazy"><span><strong>{{ item.name }}</strong><ArrowUpRight :size="15" /></span><small>{{ item.category }}</small></button></div><div v-else class="template-empty"><Search :size="25" /><p>No templates found.</p><button type="button" @click="clear">Clear filters</button></div></section></template>
```

分类按钮用aria-pressed呈现category；搜索input原生type=search并有aria-label；选中作品的aria-label包含模板name。button的click直接发item，不打开image、不自动跳转模板编辑器。

results为空时结果grid被v-if卸载，显示搜索图标、No templates found与重置入口。items为空走相同状态，点击Clear filters也不会凭空新增数据。

## 图片、键盘和布局

图片使用loading=lazy，请求时机由浏览器决定。基础CSS曾设置object-fit:cover，但文件末尾第二段scoped CSS覆盖成contain，保留实际作品完整构图。

<!-- source: src/library/jitter/TemplateBrowser.vue#L22-L24 -->
```vue
<style scoped>
.template-results img{object-fit:contain;background:#eeecf1}
</style>
```

结果容器桌面三列，500px以下单列；图片aspect-ratio从1.12改1.4，标题与搜索在窄屏上下排列。搜索容器focus-within画紫色外框；按钮focus-visible提供键盘轮廓。没有自定义方向键选分类，每个按钮正常参与Tab顺序。

图片不是draggable控制对象，源码没有drag/drop、pointer手势或重新排序逻辑。所有按钮cursor:pointer；点击筛选不会把cursor切成grab或busy。没有异步loading、分页、虚拟滚动或错误图片替代。

## 接入示例

文件放在 `src/examples/`。

<!-- example -->
```vue
<script setup lang="ts">
import { ref } from 'vue'
import TemplateBrowser, { type MotionTemplate } from '../library/jitter/TemplateBrowser.vue'

const items: MotionTemplate[] = [
  { id: 'type', name: '动态文字', category: 'Typography',
    image: '/assets/jitter/template-5-poster.jpg' },
  { id: 'poster', name: '海报', category: 'Social media',
    image: '/assets/jitter/template-1-poster.jpg' },
]
const selected = ref<MotionTemplate | null>(null)
</script>
<template>
  <TemplateBrowser :items="items" title="选择一个模板"
    @select="selected = $event" />
  <p v-if="selected" role="status">已选择 {{ selected.name }}（{{ selected.id }}）</p>
</template>
```

## 数据更新边界

items变化会重算categories/results，但没有watch去修正已经选中的category。如果当前分类从新数据里消失，category仍保留旧值，可能没有任何分类按钮aria-pressed=true，结果为空；用户可点All或Clear filters恢复。

showSearch变false只隐藏input，不清query，所以之前的搜索条件仍会过滤数据。调用方若要外部完全控制查询或数据刷新后重置，应扩展接口；当前没有可调用的expose.reset。category字符串All被用作保留值，业务数据最好不要把真实类别命名为All。

## 测试事实

[core.test.ts](../src/library/jitter/core.test.ts#L44) 验证分类后仅一结果、输入不匹配词显示空状态、Clear filters恢复三项、选择事件返回id和category。未测试数据刷新导致失效分类、隐藏搜索后条件保留、图片网络失败或大量条目的性能。
