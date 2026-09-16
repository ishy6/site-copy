# Product Family Lineup：动态商品家族筛选与选择

组件 ID：`shupatto-product-lineup`。

产品家族组件从传入商品数据生成分类，点击分类会真正过滤列表，点击某个商品会交付完整商品对象。椭圆商品图是品牌样式，核心行为是分类和选择。

## 源码与数据

- [ProductLineup.vue](../src/library/shupatto/ProductLineup.vue#L1)：分类、过滤和列表。
- [products.ts](../src/library/shupatto/products.ts#L1)：产品名称、容量、类别与配色照片。
- [core.test.ts](../src/library/shupatto/core.test.ts#L59)：Recycled 筛选、选择与分类消失后的恢复。

默认数据有 Standard 和 Recycled 两类。分类名称来自真实 products.category；模板没有硬编码“只允许两个分类”。

运行依赖 Vue、`lucide-vue-next` 与 Shupatto 字体；没有远程目录请求、分页器或路由依赖。

## Props 模型

| 参数 | 类型 | 默认值 | 行为 |
| --- | --- | --- | --- |
| `products` | `typeof defaults` | 本地 products | 提供完整商品集合 |
| `initialCategory` | `string` | `All` | 初始分类，外部更新时重新验证 |
| `title` | `string` | `Lineup` | 区域标题 |

商品结构为 id、name、category、capacity 和 colors。每项 colors 包含 id、label、image、color；本组件卡片仅展示第一种颜色图片，完整 colors 会保留在 select payload 中。

`All` 是保留值，用来表示不做分类过滤。自定义商品的 category 不应再次使用 All，否则可能生成重复分类按钮和相同 Vue key。

商品 ID 应唯一，category 是精确字符串，大小写不同会形成不同分类；组件不做翻译或规范化。

## 分类派生与失效恢复

<!-- source: src/library/shupatto/ProductLineup.vue#L5-L11 -->
```ts
const props = withDefaults(defineProps<{ products?: typeof defaults; initialCategory?: string; title?: string }>(), { products: () => defaults, initialCategory: 'All', title: 'Lineup' })
const emit = defineEmits<{ select: [product: typeof defaults[number]]; filter: [category: string] }>()
const category = ref(props.initialCategory)
const categories = computed(() => ['All', ...new Set(props.products.map(item => item.category))])
const filtered = computed(() => props.products.filter(item => category.value === 'All' || item.category === category.value))
watch(() => props.initialCategory, value => { category.value = categories.value.includes(value) ? value : 'All' })
watch(categories, value => { if (!value.includes(category.value)) category.value = 'All' }, { immediate: true })
```

categories 将商品 category 投影为数组，Set 按首次出现顺序去重，最后在最前面加 All。分类顺序跟商品数据顺序有关，不按字母排序。

filtered 每次读取当前 category，对 All 保留所有商品，否则使用严格相等比较 category。其结果顺序仍等于原商品数组顺序。

分类有两条同步路径：initialCategory 变化时验证是否存在；categories 变化时检查当前本地分类是否已失效。后者 immediate，首次传入非法分类也会恢复 All。

例如用户选择 Recycled 后，宿主替换 products 为仅有 Standard 的列表，Recycled 按钮消失，category 自动回到 All，保留可访问的结果。

这个恢复不发 filter 事件，因为 filter 只存在于用户点击处理里；宿主如需知道所有状态变化，不能仅依赖当前 filter 通知。

## 点击事件与 DOM 链

<!-- source: src/library/shupatto/ProductLineup.vue#L14-L14 -->
```vue
  <section class="shupatto-lineup"><header><h2>{{ title }}</h2><div role="group" aria-label="Product family"><button v-for="item in categories" :key="item" type="button" :aria-pressed="category === item" @click="category = item; emit('filter', item)">{{ item }}</button></div></header><div class="shupatto-lineup__items"><button v-for="product in filtered" :key="product.id" type="button" @click="emit('select', product)"><span class="shupatto-lineup__image"><img v-if="product.colors[0]" :src="product.colors[0].image" :alt="product.name" /></span><span class="shupatto-lineup__name">{{ product.name }}<ArrowUpRight :size="16" /></span><span class="shupatto-lineup__capacity">{{ product.capacity }}</span></button></div><p v-if="!filtered.length">No products in this family.</p></section>
```

1. 原生分类 button 的 click 直接赋值 category。
2. 同一事件处理中 emit filter，payload 是分类字符串。
3. filtered 重算，Vue 依据商品 ID 更新当前列表。
4. aria-pressed 随 category 更新，CSS 给当前分类加底边。
5. 商品按钮 click 发出 select(product)，宿主据此进入配色或详情流程。

分类按钮不是纯锚点，也不会更改 URL。商品卡使用 button 而非 a，因此箭头图标本身不意味着外部跳转；没有宿主监听时只会产生选择事件。

重复点击当前分类也会发 filter；重复点击同一商品也会发 select。事件是用户动作通知，没有自动幂等合并。

## Events 完整契约

| 事件 | payload | 触发来源 |
| --- | --- | --- |
| `filter` | `string` | 用户点击某分类按钮，包括 All |
| `select` | `typeof defaults[number]` | 用户点击当前过滤结果中的商品 |

没有 update:modelValue、changeCategory、请求回调或返回值协议。select 对象是 props 中对象引用，需要持久快照时由宿主复制。

初始分类、外部 initialCategory 同步、产品数组变化引起的恢复都不会发 filter。此区别有助于避免把数据刷新误当成用户选择。

## 椭圆图片、布局与鼠标机制

<!-- source: src/library/shupatto/ProductLineup.vue#L22-L28 -->
```css
.shupatto-lineup header button { padding: 6px 0; border: 0; border-bottom: 1px solid transparent; background: none; color: inherit; font: inherit; cursor: pointer; }
.shupatto-lineup header button[aria-pressed=true] { border-color: #272726; }
.shupatto-lineup__items { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; }
.shupatto-lineup__items > button { padding: 0; min-width: 0; border: 0; background: none; color: inherit; font: inherit; text-align: left; cursor: pointer; }
.shupatto-lineup__image { display: block; height: 190px; border-radius: 50%; background: #e1e3e1; overflow: hidden; }
.shupatto-lineup img { display: block; width: 100%; height: 100%; object-fit: contain; transition: transform .4s; }
.shupatto-lineup__items button:hover img { transform: scale(1.08); }
```

三列 minmax(0,1fr) 允许轨道收缩，图片区域高度固定为190px且通过 border-radius:50%形成椭圆。object-fit:contain 保留实物图完整轮廓。

商品 hover 只把 img 放大1.08倍，父级 overflow:hidden 裁掉超出的视觉部分。分类过滤由 computed 实现，不是 hover 伪装的交互。

没有 dragstart/drag/drop、pointer 事件、鼠标位置追踪或图片排序。cursor:pointer 来自 CSS 的按钮规则，组件从不在事件中改写光标。

450px 以下网格变为单列，商品可向下滚动查看。减少动态效果偏好会关闭图片 transform transition，但选择与过滤不受影响。

## 键盘和空状态

所有分类和商品都使用原生 button，能通过 Tab 聚焦并用 Enter/Space 点击。分类组有 aria-label，当前分类通过 aria-pressed 表示。

没有自定义左右方向键切分类、焦点跳转或 roving tabindex。视觉箭头是图标，不是独立的第二个可点击控件。

products 为空时仍有 All 按钮，filtered=[] 显示 No products in this family.。某商品没有颜色时省略图片，但其名称、容量和选择行为仍保留。

没有图片 error 占位和异步 loading。用户传入的商品数组应在宿主数据层完成校验后再交给组件。

## 完整接入示例

示例位于 `src/examples/LineupExample.vue`，将产品家族选择与配色组件连接。

<!-- example -->
```vue
<script setup lang="ts">
import { ref } from 'vue'
import ProductLineup from '../library/shupatto/ProductLineup.vue'
import ProductPalette from '../library/shupatto/ProductPalette.vue'
import { products } from '../library/shupatto/products'

const productId = ref('')
const category = ref('All')
</script>

<template>
  <ProductLineup
    :products="products"
    :initial-category="category"
    @filter="category = $event"
    @select="productId = $event.id"
  />
  <ProductPalette
    v-if="productId"
    :products="products"
    :product-id="productId"
    :initial-color="0"
  />
</template>
```

选中商品只更新宿主 productId，配色组件拿到同一数据集后自行处理该商品的颜色状态；不依赖共享全局 store。

## 已验证和限制

测试验证 Recycled 只保留 Jewels of the sea、filter 字符串、select 商品对象、移除当前分类后恢复 All 以及空数组文案。

组件没有分页、搜索、收藏和库存语义；它只负责家族筛选和商品选择。数据量增长时图片并未使用 loading=lazy，应由宿主根据场景补充资源策略。

没有计时器、全局事件监听、观察器或网络请求，因此无额外卸载清理。
