# Wise 汇款计算器：金额、汇率与费用的执行链

组件 ID：`wise-currency-converter`。入口是 [WiseCurrencyConverter.vue](../src/library/wise/WiseCurrencyConverter.vue#L1)。它把输入金额、币种选择、换向和费用展开组合成一个本地计算器。

原始视觉来自 Wise 首页汇款区域。默认报价保存在 SFC 的 `currencies` 工厂中；组件没有请求 Wise API，没有支付、汇款或报价锁定操作。业务需要提供同一时间点、同一基准货币的有效报价。

## 参数与事件契约

| 参数 | 类型 | 默认值 | 实际行为 |
| --- | --- | --- | --- |
| `amount` | `number` | `1000` | 初始化金额；后续 prop 更新同步到 `amountValue` |
| `sourceCurrency` | `string` | `GBP` | 汇出币种代码；找不到时退回有效币种第一项 |
| `targetCurrency` | `string` | `EUR` | 收款币种代码；找不到时优先第二项，再退第一项 |
| `feePercent` | `number` | `0.65` | 有限值被限制在 0 到 100 后除以 100；不是小数费率 |
| `currencies` | `WiseCurrency[]` | GBP / EUR / USD / HKD / CAD | 过滤掉非有限或不大于零的 `unitsPerDollar` |

`WiseCurrency` 包含 `code`、`name`、`flag`、`unitsPerDollar`。最后一个字段表示“一美元对应多少该币种”，不能直接填“该币种兑目标币种的汇率”。`flag` 是可被浏览器请求的图片 URL。

| 事件 | 载荷 | 触发条件 |
| --- | --- | --- |
| `update:amount` | `number` | 金额输入框的 `input` 事件 |
| `update:sourceCurrency` | `string` | 汇出 select 的 `change` 或换向按钮 |
| `update:targetCurrency` | `string` | 收款 select 的 `change` 或换向按钮 |
| `change` | `{ amount, received, fee, source, target }` | 上述用户操作完成后发布完整计算结果 |

`change` 内三个金额字段均为 `number`，两个币种字段均为 `string`。挂载、prop 更新和费用展开本身不会发布 `change`。因此需要立即保存初始报价时，应由宿主计算或明确触发自己的业务逻辑，不能等待一个不存在的挂载事件。

## 状态与计算顺序

`amountValue`、`sourceCode`、`targetCode` 保存组件内部可编辑值。它们让组件在没有 `v-model` 的预览中也能操作；三个 `watch` 再将父组件的新值写回内部状态。`feesOpen` 仅控制明细是否存在于 DOM。

计算链是 `currencies → available → source/target → rate`，以及 `amountValue → safeAmount → fee → received`。所有节点使用 `computed`，并未把汇率或结果复制进另一份可失同步的 `ref`。

<!-- source: src/library/wise/WiseCurrencyConverter.vue#L43-L50 -->
```ts
const available = computed(() => props.currencies.filter((currency) => Number.isFinite(currency.unitsPerDollar) && currency.unitsPerDollar > 0))
const source = computed(() => available.value.find((currency) => currency.code === sourceCode.value) ?? available.value[0])
const target = computed(() => available.value.find((currency) => currency.code === targetCode.value) ?? available.value[1] ?? available.value[0])
const safeAmount = computed(() => Number.isFinite(amountValue.value) ? Math.max(0, amountValue.value) : 0)
const feeRate = computed(() => Number.isFinite(props.feePercent) ? Math.min(100, Math.max(0, props.feePercent)) / 100 : 0)
const rate = computed(() => source.value && target.value ? target.value.unitsPerDollar / source.value.unitsPerDollar : 0)
const fee = computed(() => Math.round(safeAmount.value * feeRate.value * 100) / 100)
const received = computed(() => Math.round((safeAmount.value - fee.value) * rate.value * 100) / 100)
```

实际公式为：

1. 有效金额 `A = max(0, amount)`；非有限输入按零处理。
2. 费率 `F = clamp(feePercent, 0, 100) / 100`。
3. 交叉汇率 `R = target.unitsPerDollar / source.unitsPerDollar`。
4. 手续费 `fee = round(A × F × 100) / 100`。
5. 收款金额 `received = round((A - fee) × R × 100) / 100`。

例：1000 USD、HKD 基准值 7.8、手续费 0.65%，先得到手续费 6.50，再得到 `(1000 - 6.5) × 7.8 = 7749.30`。费用先四舍五入后换汇，不能改成最后统一四舍五入并声称行为相同。

## 金额输入与币种换向

原生 `<input type="number">` 在每次 `input` 时调用 `updateAmount`。`valueAsNumber` 将空输入变为 `NaN`，函数再归零。代码先改内部金额，再 emit 双向绑定，最后 publish；父组件收到的 `change` 已使用本次金额。

<!-- source: src/library/wise/WiseCurrencyConverter.vue#L64-L69 -->
```ts
function updateAmount(event: Event) {
  const value = (event.target as HTMLInputElement).valueAsNumber
  amountValue.value = Number.isFinite(value) ? Math.max(0, value) : 0
  emit('update:amount', amountValue.value)
  publish()
}
```

选择币种采用原生 `select` 的 `change`，没有自绘弹层、拖拽事件或文档级鼠标监听。`selectCurrency` 根据 `which` 修改一个 code，发布对应更新，再调用 `publish`。

换向读的是计算后的实际 `source` / `target`，不是可能无效的原始 code。保留的金额是原汇出数值，而不是把收款金额反填回输入框：100 USD 换向后成为 100 HKD。

<!-- source: src/library/wise/WiseCurrencyConverter.vue#L83-L90 -->
```ts
function swap() {
  const previousSource = source.value?.code ?? ''
  sourceCode.value = target.value?.code ?? ''
  targetCode.value = previousSource
  emit('update:sourceCurrency', sourceCode.value)
  emit('update:targetCurrency', targetCode.value)
  publish()
}
```

## DOM、焦点和样式变化

币种胶囊的图标和文字用于展示；覆盖整个胶囊的透明原生 select 接收点击、Tab 和浏览器提供的选择键盘操作。`opacity: 0` 没有把元素从键盘顺序中移除，`:focus-within` 在胶囊外显示焦点线。

<!-- source: src/library/wise/WiseCurrencyConverter.vue#L143-L146 -->
```css
.currency-pill { position: relative; display: flex; height: 40px; align-items: center; justify-content: center; gap: 6px; padding: 0 8px; border-radius: 999px; background: #eef0ec; font-size: 14px; font-weight: 650; }
.currency-pill img { width: 24px; height: 24px; }
.currency-pill select { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; }
.currency-pill:focus-within { outline: 2px solid #163300; outline-offset: 3px; }
```

费用按钮把 `feesOpen` 取反；`v-if` 创建或移除 `.fee-detail`，`aria-expanded` 同步布尔值。箭头的 `.open` 类触发 `rotate(180deg)`，180ms 的 transition 仅作用于 transform。系统要求减少动态效果时移除 transition。

金额输出使用 `aria-live="polite"`，避免主动抢焦点。按钮都有原生按钮键盘行为；鼠标始终使用 CSS `cursor: pointer`，没有根据按下或拖动动态改写鼠标样式。

容器宽度小于 330px / 270px 时调整金额字号和网格列宽；这是容器查询，不依赖浏览器整页宽度。宽度归属组件本身，适合放进预览 iframe 或业务侧栏。

## 完整接入示例

以下示例放到 `src/examples/ConverterExample.vue`，沿用现有 `src/library` 和 `public/assets` 路径。它保存用户操作生成的报价，但不发送汇款。

<!-- example -->
```vue
<script setup lang="ts">
import { ref } from 'vue'
import WiseCurrencyConverter, { type WiseCurrency } from '../library/wise/WiseCurrencyConverter.vue'

type Quote = { amount: number; received: number; fee: number; source: string; target: string }
const amount = ref(1000)
const source = ref('USD')
const target = ref('HKD')
const quote = ref<Quote | null>(null)
const currencies: WiseCurrency[] = [
  { code: 'USD', name: 'US dollar', flag: '/assets/wise/usd.svg', unitsPerDollar: 1 },
  { code: 'HKD', name: 'Hong Kong dollar', flag: '/assets/wise/hkd.svg', unitsPerDollar: 7.8 },
]
function recordQuote(value: Quote) {
  quote.value = value
}
</script>

<template>
  <WiseCurrencyConverter
    v-model:amount="amount"
    v-model:source-currency="source"
    v-model:target-currency="target"
    :currencies="currencies"
    :fee-percent="0.65"
    @change="recordQuote"
  />
  <output v-if="quote">{{ quote.source }} {{ quote.amount }} → {{ quote.target }} {{ quote.received }}</output>
</template>
```

## 验证与限制

[wise.test.ts](../src/library/wise/wise.test.ts#L5) 有三项直接覆盖：扣费后的 7749.30 与 15498.60、换向后的 12.82 及两个币种更新事件、负金额归零及空币种列表。空列表使整个计算内容分支消失，只显示 `No currencies available`。

以下断言同时检查显示金额和未格式化的事件数值，能发现“只更新文字却发布旧报价”的问题：

<!-- source: src/library/wise/wise.test.ts#L6-L12 -->
```ts
  it('deducts a rounded fee before conversion and emits the complete quote', async () => {
    const wrapper = mount(WiseCurrencyConverter, { props: { amount: 1000, sourceCurrency: 'USD', targetCurrency: 'HKD', feePercent: 0.65 } })
    expect(wrapper.get('output').text()).toBe('7,749.30')
    await wrapper.get('input').setValue('2000')
    expect(wrapper.get('output').text()).toBe('15,498.60')
    expect(wrapper.emitted('change')?.[0]).toEqual([{ amount: 2000, received: 15498.6, fee: 13, source: 'USD', target: 'HKD' }])
  })
```

当前未逐项测试无效基准值过滤、相同币种换向、prop 更新不 emit、所有浏览器的原生 select 键盘交互。现有断言没有模拟真实金融报价接口。

货币精度固定为两位，并使用 JavaScript 浮点数；JPY、加密资产和需要精确分厘结算的场景应由业务提供独立金额计算服务。界面结果是演示计算，不能直接作为服务端结算依据。

依赖只有 Vue、`lucide-vue-next` 和本地字体 / 国旗。组件不建立计时器或全局事件，因此无需额外卸载清理。使用自定义资产时要同步修改 URL 并确保部署基础路径可解析 `/assets/...`。
