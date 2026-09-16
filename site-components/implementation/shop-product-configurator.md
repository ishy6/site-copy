# Shop 商品配置：变体联动主图、数量与加入事件

组件 ID：`shop-product-configurator`。核心实现 [ShopProductConfigurator.vue](../src/library/shop/ShopProductConfigurator.vue#L1)。它把商品图片选择、颜色单选、数量步进和加入动作封装为一个组件。

“加入购物车”当前是同步 emit 和本地反馈，组件不会维护共享购物车、提交接口或等待服务端确认。图册与变体都可注入，价格是整个商品统一的 price prop，并未按变体分别计价。

## 完整参数

| 参数 | 类型 | 默认值 | 约束 / 用途 |
| --- | --- | --- | --- |
| `name` | `string` | `Baby Changing Mat` | 标题、图片 alt、add.name |
| `store` | `string` | `Gathre` | 商家标签 |
| `price` | `number` | `160` | 单价，显示与 add.price |
| `currency` | `string` | `HKD` | Intl 金额单位 |
| `rating` | `number` | `4.9` | 显示时夹在 0 到 5 |
| `reviewCount` | `number` | `160` | 大于 0 才显示评分行 |
| `inStock` | `boolean` | `true` | 商品级在售开关 |
| `maxQuantity` | `number` | `10` | 向下取整后至少为 1 |
| `initialVariant` | `string` | `Camel` | 初始名称，prop 更新时同步 |
| `variants` | `ShopVariant[]` | Camel / Ivory | 颜色、专属主图和可用性 |
| `gallery` | `string[]` | changing-mat.jpg | 当前变体图之外的公用图册 |

<!-- source: src/library/shop/ShopProductConfigurator.vue#L4-L4 -->
```ts
export interface ShopVariant { name: string; color: string; image: string; available?: boolean }
```

name 应唯一，同时用作 radio value、key 和 selectedName 查找字段。`available` 省略时视为可售；明确 false 时禁用该 radio。image 为浏览器可加载的 URL，color 为 CSS 背景色。

| 事件 | 精确载荷 | 时机 |
| --- | --- | --- |
| `update:variant` | `name: string` | 用户选择 radio |
| `add` | `{ name:string; variant:string; quantity:number; price:number }` | 可售时点击加入按钮 |

add 载荷没有 currency、商品 ID、变体 ID 或总价。宿主应从自己的商品上下文补上身份和单位，不应仅凭 name 在真实订单中识别 SKU。

## 状态推导与后备逻辑

<!-- source: src/library/shop/ShopProductConfigurator.vue#L11-L23 -->
```ts
const id = useId()
const selectedName = ref(props.initialVariant)
const selectedImage = ref('')
const quantity = ref(1)
const added = ref(false)
const selected = computed(() => props.variants.find(item => item.name === selectedName.value) ?? props.variants[0])
const images = computed(() => [...new Set([selected.value?.image, ...props.gallery].filter((value): value is string => Boolean(value)))])
const activeImage = computed(() => images.value.includes(selectedImage.value) ? selectedImage.value : images.value[0])
const quantityLimit = computed(() => Math.max(1, Math.floor(props.maxQuantity) || 1))
const available = computed(() => props.inStock && selected.value?.available !== false)
const money = computed(() => { try { return new Intl.NumberFormat('en-HK', { style: 'currency', currency: props.currency }).format(props.price) } catch { return `${props.price.toFixed(2)} ${props.currency}` } })
watch(() => props.initialVariant, value => { selectedName.value = value; selectedImage.value = ''; added.value = false })
watch(quantityLimit, limit => { quantity.value = Math.min(quantity.value, limit) })
```

`selected` 按名称查找，未命中时返回第一项；没有自动跳过 available=false 的第一项。初始选到缺货颜色时，用户可以选择另一个可用颜色，组件不会替用户猜测偏好。

images 先放当前变体的 image，再拼公用 gallery，过滤空值并通过 Set 去重。因此“变体图片 + 图册同一个 URL”只显示一次；切换变体后，缩略图第一项也随之改变。

selectedImage 只保存用户点击的 URL。activeImage 会再次检查它是否仍属于当前 images；不在时回退第一张。父组件替换图册不会让主图继续指向已删除的项。

quantity 初始为 1；quantityLimit 下调时 watch 立即夹住当前数量，上调时不主动增加数量。maxQuantity 小数向下取整；0、负数、NaN 会得到至少 1，Infinity 当前没有有限性保护。

available 的实际公式是 `inStock && selected?.available !== false`。variants 为空时 selected 是 undefined，但 `undefined !== false` 成立，因此无变体商品仍可加入，并发出 variant 空串。需要强制存在 SKU 的业务应在宿主校验或扩展接口。

## 用户事件的完整路径

<!-- source: src/library/shop/ShopProductConfigurator.vue#L24-L26 -->
```ts
function selectVariant(value: string) { selectedName.value = value; selectedImage.value = ''; added.value = false; emit('update:variant', value) }
function changeQuantity(delta: number) { quantity.value = Math.max(1, Math.min(quantityLimit.value, quantity.value + delta)); added.value = false }
function add() { if (!available.value) return; added.value = true; emit('add', { name: props.name, variant: selected.value?.name ?? '', quantity: quantity.value, price: props.price }) }
```

颜色切换：原生 radio change → selectVariant → 修改 selectedName → 清 selectedImage → 清 added → emit 名称。selected / images / activeImage 重算，主图回到新变体图，legend 和色板勾选同步更新。

图片切换：缩略图 click 直接写 selectedImage → activeImage 重算 → img.src 与缩略图 aria-pressed 更新。它不改变颜色、数量或 added，也不 emit 图片事件。

数量切换：减号或加号 click → changeQuantity(-1 / 1) → 将新数量夹在 1 与 quantityLimit → 清 added。上下限按钮通过 disabled 阻止多余点击，函数内仍再次夹值防御。

加入动作：点击可用按钮 → add 检查 available → added=true → 同步 emit 当前商品、实际回退后的变体名称、数量和单价。没有 await、Promise 或失败回滚。

用户可以多次点击已显示 added 的按钮，每次仍会 emit。该状态只是上次点击的反馈，不能作为幂等锁。真实异步购物车需要宿主防重复或改为明确的请求状态接口。

## DOM、原生选择与鼠标样式

颜色通过 fieldset / legend 分组，所有 radio 使用同一个 useId 生成的 name。键盘切换沿用浏览器 radio 行为，未编写自定义方向键监听。不可用颜色保留在列表中但 disabled。

radio 本体透明，`:checked + span` 绘制黑色外环；`:focus-visible + span` 绘制紫色焦点外环；disabled 色板降低 opacity 并 `cursor:not-allowed`。勾选图标依据实际 selected 名称渲染。

缩略图固定 42px 正方形。选中时边框从 1px 改为 2px，同时 padding 从 2px 改为 1px，保持内部图像尺寸稳定。主图使用 aspect-ratio 与 object-fit，未实现放大对话框、拖拽换图或滑动手势。

数量按钮和加入按钮正常时 `cursor:pointer`；disabled 时 `cursor:not-allowed`。这些变化由 CSS 匹配 disabled，不是事件函数直接修改鼠标。

added=true 时按钮出现 Check 与 `{quantity} added to cart`，原 ArrowRight 隐藏。inStock=false 时 Out of stock 文案优先，即使 added 仍为 true，也不会显示加入成功文案。

容器宽度低于 410px 时图册和信息改为单列，主图比例从 1 调整到 1.35。空 images 显示商品名称 fallback；图片 URL 加载失败没有 onerror fallback，和完全没有图片数据是不同情况。

## 完整接入示例

示例放在 `src/examples/ProductConfiguratorExample.vue`，宿主维护一个真实的本地购物车数组。示例补上组件载荷之外的稳定商品 ID 和货币，不调用不存在的结算服务。

<!-- example -->
```vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import ShopProductConfigurator, { type ShopVariant } from '../library/shop/ShopProductConfigurator.vue'

type AddItem = { name: string; variant: string; quantity: number; price: number }
type CartItem = AddItem & { productId: string; currency: string }
const variant = ref('Camel')
const cart = ref<CartItem[]>([])
const variants: ShopVariant[] = [
  { name: 'Camel', color: '#b9865b', image: '/assets/shop/mat-camel.jpg', available: true },
  { name: 'Ivory', color: '#e8e4d6', image: '/assets/shop/mat-ivory.jpg', available: true },
]
const totalQuantity = computed(() => cart.value.reduce((sum, item) => sum + item.quantity, 0))
function add(item: AddItem) {
  const existing = cart.value.find(row => row.productId === 'changing-mat' && row.variant === item.variant)
  if (existing) existing.quantity += item.quantity
  else cart.value.push({ ...item, productId: 'changing-mat', currency: 'HKD' })
}
</script>

<template>
  <ShopProductConfigurator
    name="Baby Changing Mat"
    :price="160"
    currency="HKD"
    :variants="variants"
    :initial-variant="variant"
    :max-quantity="5"
    @update:variant="variant = $event"
    @add="add"
  />
  <output>{{ totalQuantity }} items</output>
</template>
```

## 验证与边界

[shop-core.test.ts](../src/library/shop/shop-core.test.ts#L65) 选择 Ivory 后断言主图 URL，增加数量至上限 2 后验证按钮 disabled，点击加入后精确验证 `{name,variant,quantity,price}`，最后改 inStock=false 检查缺货按钮。

这组断言串起了颜色选择、数量限制与购物车载荷，验证三个区域读取的是同一份当前配置：

<!-- source: src/library/shop/shop-core.test.ts#L67-L75 -->
```ts
    await wrapper.get('input[value="Ivory"]').setValue()
    expect(wrapper.get('.hero-image img').attributes('src')).toBe('/assets/shop/mat-ivory.jpg')
    await wrapper.get('[aria-label="Increase quantity"]').trigger('click')
    expect(wrapper.get('[aria-label="Increase quantity"]').attributes('disabled')).toBeDefined()
    await wrapper.get('.add-button').trigger('click')
    expect(wrapper.emitted('add')?.[0]).toEqual([{ name: 'Baby Changing Mat', variant: 'Ivory', quantity: 2, price: 160 }])
    await wrapper.setProps({ inStock: false })
    expect(wrapper.get('.add-button').attributes('disabled')).toBeDefined()
    expect(wrapper.get('.add-button').text()).toBe('Out of stock')
```

该测试没有覆盖空 variants 的空串载荷、重复 URL 去重、无效初始变体、maxQuantity 动态下调、图片失败或连续加入。以上按当前代码说明，不能当作已测全部业务组合。

组件不持久化购物车，没有库存扣减、价格重校验、货币换算或订单 API。商品库存和价格可能在点击前变化，真实购买仍须由服务端校验。

没有计时器、Object URL 或全局监听；导出需要本 SFC、使用到的图片、两个 Shop 字体及 lucide 图标。
