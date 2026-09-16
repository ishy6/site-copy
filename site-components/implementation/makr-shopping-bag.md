# Shopping Bag：明细同步、分币汇总与异步结算准备

组件 ID：`makr-shopping-bag`。

购物袋维护一个可编辑的内部明细副本，通过 `update:items` 将数量和删除结果交给宿主。结算只负责通知和等待宿主准备结算，不承担支付流程。

## 源码和依赖

- [ShoppingBag.vue](../src/library/makr/ShoppingBag.vue#L1)：本地明细、数量更新、结算。
- [bag-data.ts](../src/library/makr/bag-data.ts#L1)：`ShoppingBagItem` 与默认两条商品。
- [core.spec.ts](../src/library/makr/core.spec.ts#L61)：库存上限、删除、输入不变、结算并发与失败恢复。

运行依赖为 Vue、`lucide-vue-next` 和 MAKR 本地字体。商品图片 URL 来自每条明细的 `image`。

## Props 与明细模型

| 参数 | 类型 | 默认值 | 用途 |
| --- | --- | --- | --- |
| `title` | `string` | `Shopping bag` | 标题与区域无障碍名称 |
| `items` | `ShoppingBagItem[]` | `sampleBag` | 宿主传入明细 |
| `shippingNote` | `string` | `Shipping calculated at checkout.` | 总额下方说明 |
| `empty` | `boolean` | `false` | 强制将内部列表置空，用于空态预览 |
| `prepareCheckout` | `(items) => Promise<void>` | 未设置 | 宿主结算准备回调 |

明细模型包含 `id: string`、`title: string`、`finish: string`、`image: string`、`price: number`、`quantity: number`、`maxQuantity?: number`。

`id` 是更新和删除的业务定位键，必须唯一。`price` 按单件 USD 金额理解；组件没有货币 prop。`maxQuantity` 默认 99，经取整与至少 1 的规则处理。

`empty=true` 不会直接修改宿主数组，也不会主动发出清空事件；它是输入状态而非“清空购物车”业务命令。

## 内部副本与金额计算

<!-- source: src/library/makr/ShoppingBag.vue#L7-L15 -->
```ts
const lines = ref<ShoppingBagItem[]>([])
const pending = ref(false)
const status = ref('')
const failed = ref(false)
const limit = (item: ShoppingBagItem) => Math.max(1, Math.floor(item.maxQuantity ?? 99) || 1)
watch(() => [props.items, props.empty] as const, () => { lines.value = props.empty ? [] : props.items.filter(item => item.quantity > 0).map(item => ({ ...item, quantity: Math.min(limit(item), Math.max(1, Math.floor(item.quantity) || 1)) })); status.value = '' }, { immediate: true, deep: true })
const count = computed(() => lines.value.reduce((sum, line) => sum + line.quantity, 0))
const total = computed(() => lines.value.reduce((sum, line) => sum + Math.round(line.price * 100) * line.quantity, 0) / 100)
const money = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(value)
```

深度 watcher 会在首次挂载及宿主数据变化时重新构造内部列表。先去掉 `quantity <= 0` 的条目，再浅复制对象，最后把数量限制在 `1..limit(item)`。

因此按钮调整 `lines` 不会直接改写传入 `items`。宿主用 `v-model:items` 接收新数组后，watcher 再从宿主新值生成内部副本。

标题旁计数是数量之和，不是商品行数。例如两条明细数量分别为 2 和 3，计数显示 5。

汇总采用 `sum(round(unitPrice * 100) * quantity) / 100`。先把每件单价转换为整数分，再乘件数，降低小数累积误差。

单行金额显示使用 `item.price * item.quantity` 后交给 Intl 格式化；具有两位以上小数的单价可能与“先舍入单价再求和”的总额规则不同。业务应传入最多两位小数的规范单价。

## 数量与删除的统一入口

<!-- source: src/library/makr/ShoppingBag.vue#L16-L25 -->
```ts
function update(id: string, quantity: number) {
  if (pending.value) return
  const item = lines.value.find(line => line.id === id)
  if (!item) return
  const next = Number.isFinite(quantity) ? Math.min(limit(item), Math.max(0, Math.floor(quantity))) : item.quantity
  if (!next) { lines.value = lines.value.filter(line => line.id !== id); emit('remove', id) }
  else item.quantity = next
  status.value = ''; emit('update:items', lines.value.map(line => ({ ...line })))
}
function inputChange(item: ShoppingBagItem, event: Event) { const input = event.target as HTMLInputElement; update(item.id, Number(input.value)); input.value = String(item.quantity) }
```

1. 加减按钮调用 `update(id, quantity ± 1)`。
2. 原生 number input 的 `change` 经 `inputChange()` 转成数值，也调用 `update()`。
3. 函数检查 pending 和 ID，然后向下取整、限制在 `0..limit`。
4. 数量为 0 时删除整行并发出 `remove(id)`；正数更新本地数量。
5. 清除旧结算提示，发出包含新对象副本的 `update:items`。
6. Vue 重新计算计数、总额、按钮禁用状态和空购物袋分支。

这里数量 0 有明确的删除含义；空输入的 `Number('')` 也是 0，因此清空后触发 change 会删除该行。非有限数值保留旧数量。

减号在数量为 1 时仍可点，点后删除。加号在达到该行上限时禁用，避免超量；删除图标直接调用 `update(id, 0)`。

## 结算事件与等待状态

<!-- source: src/library/makr/ShoppingBag.vue#L26-L33 -->
```ts
async function checkout() {
  if (pending.value || !lines.value.length) return
  const snapshot = lines.value.map(line => ({ ...line }))
  pending.value = true; failed.value = false; status.value = ''; emit('checkout', snapshot)
  try { await props.prepareCheckout?.(snapshot); status.value = props.prepareCheckout ? 'Checkout is ready.' : 'Your bag is ready for checkout.' }
  catch(cause) { failed.value = true; status.value = cause instanceof Error ? cause.message : 'Unable to continue. Please try again.' }
  finally { pending.value = false }
}
```

请求快照是新数组和新的明细对象。`pending=true` 发生在发出事件之前，重复结算被函数守卫阻止，所有本地数量与删除控件也禁用。

| 输出 | payload | 语义 |
| --- | --- | --- |
| `update:items` | `ShoppingBagItem[]` | 用户编辑后的完整列表 |
| `remove` | `string` | 被移除行的 ID，先于 update 发出 |
| `checkout` | `ShoppingBagItem[]` | 请求开始前的列表快照通知 |
| `prepareCheckout` | `ShoppingBagItem[]` | 被等待的异步准备过程 |

异步请求放在 `:prepare-checkout`，不要仅通过 `@checkout` 返回 Promise，因为 Vue 事件返回值不会被组件等待。组件没有 `success` 事件，成功后的具体页面跳转应在宿主回调内完成。

没有回调时仅显示购物袋已准备就绪。失败保留全部商品，显示异常信息并解除 pending，允许再次操作。不会自动清空购物袋、扣库存或调用支付。

## 焦点、滚动和样式

外层 `aria-busy` 绑定 pending；反馈区使用 `failed ? 'alert' : 'status'`。每条数量控件名称带商品标题，屏幕阅读器能区分多个加减和删除按钮。

明细列表限制 `max-height: 210px` 并使用原生 `overflow: auto`；组件没有手写拖动列表或 scroll 监听。

按钮 `cursor: pointer`，禁用变为 `cursor: default`。数字框隐藏浏览器自带步进外观，但仍使用原生 number 输入语义；自定义加减图标负责可见操作。

请求中旋转 LoaderCircle，减少动态效果偏好下停止动画。没有图片拖拽逻辑、光标改写或动画帧调度。

## 完整接入示例

示例放在 `src/examples/BagExample.vue`。通过 `v-model:items` 保持宿主数据与组件一致，实际服务返回结算地址后跳转。

<!-- example -->
```vue
<script setup lang="ts">
import { ref } from 'vue'
import ShoppingBag from '../library/makr/ShoppingBag.vue'
import { sampleBag, type ShoppingBagItem } from '../library/makr/bag-data'

const items = ref(sampleBag.map(item => ({ ...item })))

async function prepareCheckout(snapshot: ShoppingBagItem[]): Promise<void> {
  const response = await fetch('/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: snapshot.map(item => ({ id: item.id, quantity: item.quantity })),
    }),
  })
  if (!response.ok) throw new Error('暂时无法结算，请重试。')
  const result = await response.json() as { checkoutUrl: string }
  const url = new URL(result.checkoutUrl, window.location.origin)
  if (url.origin !== window.location.origin) throw new Error('结算地址无效。')
  window.location.assign(url.href)
}
</script>

<template>
  <ShoppingBag v-model:items="items" :prepare-checkout="prepareCheckout" />
  <output>商品行数：{{ items.length }}</output>
</template>
```

## 已验证与限制

单元测试覆盖数量上限、总额联动、不修改原始输入数组、数量 0 删除、空购物袋禁用结算、等待中阻止重复请求、失败后保留明细并恢复结算。

pending 只阻止组件内部编辑，宿主仍可改变 props；回调拿到的是点击时快照。接入层应处理请求期间外部购物车变化的一致性。

没有 AbortController、请求超时和自动取消。组件卸载不会终止宿主提供的 Promise，也没有本地持久化；购物袋恢复由宿主负责。
