# Catalog Search：本地多关键词商品检索

组件 ID：`makr-catalog-search`。

搜索框、结果计数与图片网格共享同一个本地筛选结果。组件的价值在于即时过滤、清空恢复和结果选择，而不是静态商品图片展示。

## 源码和依赖

- [CatalogSearch.vue](../src/library/makr/CatalogSearch.vue#L1)：完整检索与渲染逻辑。
- [catalog.ts](../src/library/makr/catalog.ts#L9)：`MakrProduct` 和默认三款商品。
- [makr.spec.ts](../src/library/makr/makr.spec.ts#L34)：多词匹配与空结果恢复测试。

运行依赖 Vue、`lucide-vue-next`；默认图片和 MAKR 字体为本地资产。组件没有依赖路由器或远程搜索 API。

## Props 契约

| 参数 | 类型 | 默认值 | 用途 |
| --- | --- | --- | --- |
| `title` | `string` | `Objects for everyday use.` | 搜索区域顶部文案 |
| `placeholder` | `string` | `Search objects` | 原生搜索框占位 |
| `initialQuery` | `string` | 空字符串 | 初始搜索词，变化时同步内部输入 |
| `products` | `MakrProduct[]` | `makrCatalog` | 参与本地筛选的完整集合 |
| `currency` | `string` | `USD` | 价格格式化币种 |
| `showPrices` | `boolean` | `true` | 是否渲染价格文本 |

每个 `MakrProduct` 包含 `id`、`title`、`finish`、`image`、`price`、`href`。ID 用作 Vue key，必须唯一；`href` 是真实导航目标。

搜索仅匹配 `title` 和 `finish`，不会检索 ID、价格、链接或其他自行添加的字段。

## 状态与匹配算法

<!-- source: src/library/makr/CatalogSearch.vue#L21-L31 -->
```ts
const emit = defineEmits<{ search: [query: string]; select: [product: MakrProduct] }>()
const query = ref(props.initialQuery)
const input = ref<HTMLInputElement>()
watch(() => props.initialQuery, (value) => { query.value = value })
watch(query, (value) => emit('search', value))
const results = computed(() => {
  const terms = query.value.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean)
  return props.products.filter((product) => terms.every((term) => `${product.title} ${product.finish}`.toLocaleLowerCase().includes(term)))
})
const money = (price: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: props.currency, maximumFractionDigits: 0 }).format(price)
function clear() { query.value = ''; input.value?.focus() }
```

输入首先转小写、裁剪首尾空格，再按连续空白拆词。`every` 是 AND 关系：输入 `pouch black` 要求两个词都在“标题 + 材质”中出现。

顺序不影响结果，例如 `black pouch` 仍能匹配黑色 Field Pouch。连续多个空格不会产生空关键词，空输入的 `terms=[]` 会使 `every()` 对所有商品成立。

匹配是子串包含，不是词边界、模糊拼写或相关度搜索。结果保留 `products` 原有顺序，不会自动按价格或相似度排序。

一次重算扫描全部商品，复杂度随商品数和关键词数线性增加。当前实现适合有限的本地目录，没有虚拟列表、索引缓存、节流或分页。

## 输入事件到结果列表

<!-- source: src/library/makr/CatalogSearch.vue#L37-L42 -->
```vue
    <form class="makr-search__field" role="search" @submit.prevent="emit('search', query)">
      <Search :size="17" :stroke-width="1.4" aria-hidden="true" />
      <input ref="input" v-model="query" type="search" :placeholder="placeholder" aria-label="Search products" @keydown.esc="clear" />
      <button v-if="query" type="button" title="Clear search" aria-label="Clear search" @click="clear"><X :size="17" :stroke-width="1.4" /></button>
    </form>
    <div class="makr-search__count" role="status">{{ results.length }} {{ results.length === 1 ? 'object' : 'objects' }}<span>{{ query.trim() ? 'Search results' : 'The collection' }}</span></div>
```

1. 原生 `input` 事件通过 Vue `v-model` 更新 `query`。
2. `results` computed 重新运行本地过滤。
3. Vue 更新数量、`v-for` 商品列表以及空结果分支。
4. watcher 向宿主发出原始输入字符串的 `search` 通知。
5. 点击清空或按 Escape 调用 `clear()`，重置文本并把焦点留在输入框。

`@submit.prevent` 阻止表单默认跳转，但再次发出 `search`。因此输入后的 Enter 可能带来同一文本的第二次通知；消费者不应把每次 `search` 都当成唯一的一次网络操作。

初次挂载不会发出 `search`，后续 `initialQuery` 变化如果实际改变 `query`，则会经 watcher 发出通知。

## 结果选择与外部导航

<!-- source: src/library/makr/CatalogSearch.vue#L43-L50 -->
```vue
    <div v-if="results.length" class="makr-search__grid">
      <a v-for="product in results" :key="product.id" class="makr-search__product" :href="product.href" target="_blank" rel="noopener noreferrer" @click="emit('select', product)">
        <div class="makr-search__image"><img :src="product.image" :alt="`${product.title}, ${product.finish}`" loading="lazy" /><ArrowUpRight :size="16" aria-hidden="true" /></div>
        <h4>{{ product.title }}</h4>
        <div class="makr-search__meta"><span>{{ product.finish }}</span><span v-if="showPrices">{{ money(product.price) }}</span></div>
      </a>
    </div>
    <p v-else class="makr-search__empty">No objects found for "{{ query.trim() }}".</p>
```

点击结果会同时发出 `select(product)` 并执行原生 `<a>` 导航。事件 payload 没有 `MouseEvent`，不提供组件级取消导航接口。

`target="_blank"` 配合 `noopener noreferrer`；组件没有调用 `window.open()`。宿主若需要在当前 SPA 内切换页面，应调整组件导航契约或选择更适合按钮式选择的组件。

搜索结果中的图片设置 `loading="lazy"`，由浏览器决定图片请求时机；本地数据筛选本身没有异步 loading 状态。

## 样式、鼠标和键盘

<!-- source: src/library/makr/CatalogSearch.vue#L69-L75 -->
```css
.makr-search__grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 13px; }
.makr-search__product { min-width: 0; color: inherit; text-decoration: none; }
.makr-search__image { width: 100%; aspect-ratio: 1; position: relative; overflow: hidden; background: #f0efeb; }
.makr-search__image img { display: block; width: 100%; height: 100%; object-fit: cover; transition: transform .25s; }
.makr-search__image > svg { position: absolute; bottom: 8px; right: 8px; opacity: 0; transition: opacity .2s; }
.makr-search__product:hover img { transform: scale(1.045); }
.makr-search__product:hover .makr-search__image > svg, .makr-search__product:focus-visible .makr-search__image > svg { opacity: 1; }
```

三列使用 `minmax(0, 1fr)` 防止长文本撑破轨道。图片宽高比固定为 1，结果变化时单个图片格子的尺寸不依赖原图大小。

图片放大和箭头显隐由 `:hover`、`:focus-visible` 控制。没有拖拽事件、手势跟随、拖动排序或 JavaScript 改写鼠标样式。

输入框获得焦点时父级底边加粗；链接和清空按钮有明确焦点轮廓。数量使用 `role="status"`，辅助技术能获知筛选后数量。

`prefers-reduced-motion` 关闭图片与箭头过渡。组件没有定时器、全局事件或待取消的请求。

## 完整接入示例

保存为 `src/examples/CatalogExample.vue`。示例记录搜索文本和选择商品；链接仍按组件约定打开新页面。

<!-- example -->
```vue
<script setup lang="ts">
import { ref } from 'vue'
import CatalogSearch from '../library/makr/CatalogSearch.vue'
import { makrCatalog, type MakrProduct } from '../library/makr/catalog'

const query = ref('')
const selected = ref<MakrProduct | null>(null)
</script>

<template>
  <CatalogSearch
    :products="makrCatalog"
    initial-query="pouch"
    currency="USD"
    :show-prices="true"
    @search="query = $event"
    @select="selected = $event"
  />
  <output>{{ query }}</output>
  <output v-if="selected">{{ selected.title }} / {{ selected.finish }}</output>
</template>
```

## 已验证与限制

现有测试验证大小写与额外空白、多词必须同时匹配、无结果文案、清空后恢复全部商品和最后发出的空查询事件。

没有测试远程检索，因为组件没有远程检索实现。大规模目录需要宿主分页或专门搜索服务，而不是假设当前 computed 自带异步请求管理。

价格格式使用零位小数显示；实际 `product.price` 原始值仍存在于选择结果中。需要展示分币时应统一修改展示规则并补充对应验证。
