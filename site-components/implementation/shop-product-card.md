# Shop 商品卡：独立收藏、商品选择和图片错误降级

组件 ID：`shop-product-card`。代码 [ShopProductCard.vue](../src/library/shop/ShopProductCard.vue#L1)。保留该组件的原因是商品打开与收藏是两条独立的有效交互，而不是仅把图片加 hover 后作为展示组件收录。

图片区域和商品名称可以渲染为原生链接或按钮。收藏按钮始终独立存在，通过本地状态反馈并发出 boolean；持久化收藏列表、商品路由和鉴权均属于宿主。

## Props 和事件契约

| 参数 | 类型 | 默认值 | 行为 |
| --- | --- | --- | --- |
| `name` | `string` | `Baby Changing Mat` | 名称、图片 alt、打开按钮标签和 select 载荷 |
| `store` | `string` | `Gathre` | 商家名和图片失败 fallback |
| `image` | `string` | changing-mat.jpg 本地 URL | 主图片；prop 变化时清错误状态 |
| `price` | `number` | `160` | 当前价格 |
| `currency` | `string` | `HKD` | Intl 货币代码 |
| `previousPrice` | `number` | `0` | 大于当前价且大于 0 才计算折扣 |
| `rating` | `number` | `4.9` | 显示时夹在 0 到 5 |
| `reviewCount` | `number` | `160` | 评价数量，使用 en 分组格式化 |
| `initialSaved` | `boolean` | `false` | 初始化收藏；外部变化时同步 |
| `showRating` | `boolean` | `true` | 是否创建评分行 |
| `href` | `string` | 空串 | 有值用 a，无值用 button |

事件 `update:saved(saved:boolean)` 只由收藏点击发送。事件 `select(name:string)` 由图片打开入口或商品名称点击发送。select 不提供 MouseEvent、商品 ID 或选中 boolean。

没有 saved prop，只有 initialSaved。父组件要维护受控收藏时使用 `:initial-saved="saved" @update:saved="saved=$event"`，不能假定 `v-model:saved` 会被内部读取。

## 三份互相独立的状态

<!-- source: src/library/shop/ShopProductCard.vue#L31-L43 -->
```ts
const emit = defineEmits<{ 'update:saved': [saved: boolean]; select: [name: string] }>()
const saved = ref(props.initialSaved)
const imageFailed = ref(false)
const selected = ref(false)
const discount = computed(() => props.previousPrice > props.price && props.previousPrice > 0 ? Math.round((1 - props.price / props.previousPrice) * 100) : 0)
const safeRating = computed(() => Math.min(5, Math.max(0, props.rating)))
const money = (value: number) => {
  try { return new Intl.NumberFormat('en-HK', { style: 'currency', currency: props.currency }).format(value) }
  catch { return `${props.currency} ${value.toFixed(2)}` }
}
watch(() => props.initialSaved, (value) => { saved.value = value })
watch(() => props.image, () => { imageFailed.value = false })
watch(() => props.name, () => { selected.value = false })
```

saved 控制收藏图标与 Saved 文案；selected 控制商品图片外圈；imageFailed 决定 img 是否由文字替代。收藏不修改 selected，打开商品不修改 saved，图片失败也不清除另外两份状态。

name prop 变化会清 selected，但不会清 saved。列表复用组件时应以稳定商品 ID 作为父级 v-for key，并给每个商品传对应 initialSaved，避免把上一商品的内部收藏状态带到下一商品。

image prop 变化会将 imageFailed=false，重新创建 img 进行加载；同一个失败 URL 不变化时组件不会自动重试。它没有定时重试或备用图片链。

## 收藏与打开为什么不会互相触发

<!-- source: src/library/shop/ShopProductCard.vue#L45-L53 -->
```ts
function toggleSave() {
  saved.value = !saved.value
  emit('update:saved', saved.value)
}

function select() {
  selected.value = !selected.value
  emit('select', props.name)
}
```

收藏按钮不是放在可点击的 a / button 里面，而是与 `.product-open` 同级，共同位于 `.product-image`。父级图片容器自身没有 click 监听，所以不需要通过 `stopPropagation` 解决嵌套点击。

第一次收藏点击把 saved 设为 true，先更新本地反馈再 emit true；再次点击发 false。没有等候宿主写回状态，所以是乐观的同步 UI，失败回滚需要宿主更新 initialSaved。

图片或名称点击将 selected 取反，并始终 emit name。即使第二次点击把紫色选中边框关闭，事件仍只是同一个商品名称，不是“取消选择”的载荷。

href 有值时模板生成 a，click 回调不 preventDefault，因此仍执行原生链接导航；href 为空时生成 type=button，不会意外提交外层 form。

## 图片失败、折扣与数字格式

<!-- source: src/library/shop/ShopProductCard.vue#L57-L64 -->
```vue
  <article class="shop-product-card" :class="{ 'is-selected': selected }">
    <div class="product-image">
      <component :is="href ? 'a' : 'button'" class="product-open" :href="href || undefined" :type="href ? undefined : 'button'" :aria-label="`View ${name}`" @click="select">
        <img v-if="!imageFailed" :src="image" :alt="name" @error="imageFailed = true" />
        <span v-else class="image-fallback">{{ store }}</span>
      </component>
      <span v-if="discount > 0" class="discount">{{ discount }}% off</span>
      <button class="save-button" :class="{ saved }" type="button" :aria-label="saved ? `Remove ${name} from saved items` : `Save ${name}`" :aria-pressed="saved" :title="saved ? 'Remove from saved items' : 'Save item'" @click="toggleSave"><Heart :size="19" :fill="saved ? 'currentColor' : 'none'" :stroke-width="1.75" aria-hidden="true" /></button>
```

img 的原生 error 事件只设置 imageFailed；下一轮渲染移除 img 并展示店铺文字。fallback 保留在同一打开入口里，因此图片坏了仍然可以打开商品。

折扣公式为 `round((1 - price / previousPrice) × 100)`。75 / 100 得到 25%；previousPrice 不大于 price 时得到 0，并同时隐藏折扣标签与删除线原价。折扣没有限制最大 100%，因此负 price 等不合法业务输入应由宿主排除。

金额使用 Intl.NumberFormat('en-HK', {style:'currency',currency})，无效货币代码导致构造失败时回退到 `currency + value.toFixed(2)`。该 catch 保证不支持代码仍可显示文本，但不会判断报价是否合理。

rating 只 clamp 到 0..5，没有 Number.isFinite 检查。评分行显示 safeRating.toFixed(1)，评价数调用 reviewCount.toLocaleString('en')；不要把非有限值或非 number 从接口直接传入。

## CSS 状态变化与键盘

<!-- source: src/library/shop/ShopProductCard.vue#L81-L89 -->
```css
.product-image { position: relative; width: 100%; aspect-ratio: 1; overflow: hidden; border: 1px solid #e1e1e1; border-radius: 20px; background: #f1f1f1; box-shadow: 0 2px 5px rgb(0 0 0 / 7%); transition: box-shadow 150ms ease; }
.is-selected .product-image { box-shadow: 0 0 0 3px #5433eb; }
.product-open { display: block; width: 100%; height: 100%; padding: 0; border: 0; background: transparent; }
.product-open img { display: block; width: 100%; height: 100%; object-fit: cover; transition: transform 250ms ease; }
.product-open:hover img { transform: scale(1.035); }
.image-fallback { display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; padding: 18px; color: #6c6c6c; font-size: 25px; overflow-wrap: anywhere; }
.save-button { position: absolute; right: 11px; bottom: 11px; display: grid; width: 35px; height: 35px; padding: 0; place-items: center; border: 0; border-radius: 50%; background: rgb(70 70 70 / 58%); color: #fff !important; transition: transform 150ms ease, background 150ms ease; }
.save-button:hover { transform: scale(1.08); background: #080808; }
.save-button.saved { background: #5433eb; }
```

saved 同时让 Heart fill 从 none 变为 currentColor，并更新 aria-pressed、aria-label、title。Saved 文案使用 role=status，便于辅助技术获知收藏反馈。

selected 通过 article 上的 is-selected 类切换 box-shadow，不改变图片容器几何尺寸。hover 的 scale 只改 transform，aspect-ratio=1 保持卡片高度稳定。

所有按钮 / 链接鼠标样式固定为 pointer，没有拖动时改为 grabbing；没有注册 drag 或 pointer 事件。键盘操作来自原生按钮与 a，focus-visible 显示紫色轮廓。

减少动态效果媒体查询移除图片、收藏按钮与阴影 transition，同时取消 hover scale；收藏和选择状态本身仍保留。

## 完整接入示例

示例放在 `src/examples/ProductCardExample.vue`，用本地状态保存收藏及选中商品。它没有给 href，因此打开行为由宿主 select 回调处理。

<!-- example -->
```vue
<script setup lang="ts">
import { ref } from 'vue'
import ShopProductCard from '../library/shop/ShopProductCard.vue'

const saved = ref(false)
const selectedProduct = ref('')
function save(value: boolean) {
  saved.value = value
}
function select(name: string) {
  selectedProduct.value = name
}
</script>

<template>
  <ShopProductCard
    name="Baby Changing Mat"
    store="Gathre"
    image="/assets/shop/changing-mat.jpg"
    :price="75"
    :previous-price="100"
    currency="USD"
    :initial-saved="saved"
    :rating="4.9"
    :review-count="160"
    @update:saved="save"
    @select="select"
  />
  <output>{{ selectedProduct }} {{ saved ? 'Saved' : '' }}</output>
</template>
```

## 已有测试与边界

[shop.test.ts](../src/library/shop/shop.test.ts#L7) 的收藏用例断言第一次点击 aria-pressed=true、事件载荷 [true]，同时 select 未触发；第二次点击得到 [false]。这验证的是 DOM 结构隔离，而不是碰巧停止了事件冒泡。

[折扣与图片用例](../src/library/shop/shop.test.ts#L17) 验证 75 / 100 显示 25% off，触发 img error 后展示 Gathre fallback。

当前测试没有验证真实 href 跳转、外部 initialSaved 回滚、名称切换后的状态组合、无效货币代码或减少动态效果的 CSS。没有收藏 API 的错误提示、loading 或离线缓存。

导出包含 SFC、两个 Shop 字体和实际使用的商品图；无全局监听、Object URL、计时器需要卸载处理。
