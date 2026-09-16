# Wise 服务商比较：输入重算、比例横条与费用展开

组件 ID：`wise-provider-comparison`。入口 [WiseProviderComparison.vue](../src/library/wise/WiseProviderComparison.vue#L1)，示例数据 [wiseProviders.ts](../src/library/wise/wiseProviders.ts#L1)。

此组件根据同一个汇出金额和每家服务商的 fee / rate 计算收款结果，绘制比例背景，并允许展开某一家的费用说明。默认报价是明确写在本地文件里的静态样例，不是实时比较服务。

## 参数及服务商结构

<!-- source: src/library/wise/wiseProviders.ts#L1-L7 -->
```ts
export interface TransferProvider { name: string; fee: number; rate: number; featured?: boolean }
// Static examples, supplied independently of live Wise quotes.
export const transferProviders: TransferProvider[] = [
  { name: 'Wise', fee: 6.5, rate: 1.1622, featured: true },
  { name: 'Bank transfer', fee: 18, rate: 1.141 },
  { name: 'Card transfer', fee: 24, rate: 1.128 },
]
```

| 参数 | 类型 | 默认值 | 约束 |
| --- | --- | --- | --- |
| `amount` | `number` | `1000` | 通过 `v-model:amount` 接收用户更新 |
| `sourceCurrency` | `string` | `GBP` | 汇出与费用单位，只负责文本显示 |
| `targetCurrency` | `string` | `EUR` | 收款与 rate 的目标单位 |
| `providers` | `TransferProvider[]` | 三个本地样例 | fee 应是汇出单位，rate 应是汇出兑收款倍率 |
| `title` | `string` | `More arrives with Wise.` | 标题和 section 的 aria-label |

唯一事件 `update:amount(amount: number)` 在 input 时发送；没有 `quote`、服务商选择或费用展开事件。rows 是内部 computed，宿主如需收集计算结果应自行共用业务计算或扩展明确的接口。

每个 provider 的 `name` 既显示名称，又作为展开状态的标识。数据应保证 name 唯一，否则相同名称的多行会同时展开；模板 key 虽然加入 index，展开逻辑却不使用 index。

## 内部状态和计算

`value` 保存输入框的当前数字，`expanded` 保存展开服务商名称或空串。`watch(() => props.amount)` 允许外部金额变化覆盖内部输入，但不主动 emit。

<!-- source: src/library/wise/WiseProviderComparison.vue#L7-L13 -->
```ts
const value = ref(props.amount)
const expanded = ref('')
watch(() => props.amount, amount => { value.value = amount })
const rows = computed(() => props.providers.map(provider => ({ ...provider, received: Math.max(0, (Math.max(0, Number(value.value) || 0) - provider.fee) * provider.rate) })))
const best = computed(() => Math.max(1, ...rows.value.map(row => row.received)))
const money = (value: number) => new Intl.NumberFormat('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
function update(event: Event) { value.value = Math.max(0, (event.target as HTMLInputElement).valueAsNumber || 0); emit('update:amount', value.value) }
```

每行的计算顺序：

1. `Number(value) || 0` 将空或 NaN 类输入归零。
2. 用 `Math.max(0, ...)` 消除负汇出金额。
3. 减去服务商固定 fee。
4. 乘以该服务商的 rate。
5. 最外层 `Math.max(0, ...)` 将负收款结果归零。

例如 amount=100、fee=5、rate=2，收款为 190；amount=2 时先得到 -6，再归零。这里 fee 是固定数值，不是百分比，不能把 0.65 直接理解为 0.65%。

计算值本身没有提前舍入。`money` 只在显示时格式化为两位，因此比例宽度基于完整浮点结果，而不是界面已经四舍五入的字符串。

`rows` 使用对象展开添加 received，不修改 providers 原数组。父组件替换报价数组或其中响应式字段后，计算值会自然更新。

## 比例横条并非严格图表刻度

`best = max(1, 所有 received)` 避免全部为零时除以零。每行宽度取 `max(35, received / best × 100)%`。

因此金额为零时横条仍占 35%；较小金额也会受到 35% 的下限保护。这个背景是列表的视觉强调，不是能精确读数的线性柱状图。不要只用横条长度向用户表达真实差额，金额文本才是准确输出。

例如两行分别 190 与 90，best=190，对应约 100% 与 47.37%；如果第二行只有 10，其实际比例 5.26% 会被显示下限提升到 35%。

`.provider-bar` 绝对定位在行后方，`z-index:-1`；`.provider` 的 `isolation:isolate` 建立独立堆叠上下文，避免背景落到整个页面后面。容器 `overflow:hidden` 与 8px 圆角裁切横条。

`featured` 仅改变行底色和横条颜色，不改变排序、费率、best 或计算公式。组件按 providers 的输入顺序渲染。

## 输入与展开的执行顺序

输入使用 `<input type="number" min="0" step="100">`。每次 input 调用 update；`step=100` 指定原生步进操作的间隔，不会把手工输入自动四舍五入到一百的倍数。

update 先读取 `valueAsNumber`，归零无效值和负值，再更新内部 value，最后发送 `update:amount`。rows、best、金额和背景宽度都依赖 value，所以在同一轮 Vue 更新中重算。

费用图标按钮的 click 是表达式 `expanded = expanded === provider.name ? '' : provider.name`：点击当前行会关闭；点击另一行会把展开目标替换成该行，因此唯一名称数据下一次只有一行展开。

对应按钮同步 `aria-expanded`，并具有 `Fees for {name}` 的 aria-label 和 title。明细用 `v-if` 创建 `<p class="provider-details">`，显示 rate 和 fee，没有第二次请求。

## 键盘、鼠标和响应式

按钮通过原生 Tab / Enter / Space 操作，没有自定义方向键表格导航。展开后焦点仍留在按钮，代码未把焦点移动到说明段落。

输入框和按钮使用 `:focus-visible` 显示绿色 2px outline。费用按钮静态设置 `cursor:pointer`；组件没有 drag 事件、鼠标捕获或动态 cursor 状态。

容器小于 360px 时，服务商名称与费用标签占满一行，收款金额和展开按钮另起一行；输入区域字号和间距也变小。这里使用容器查询，可在 iframe 和窄列中正确触发布局。

providers 为空时显示 `No providers available`，金额输入仍保留。更改 providers 不会清空 expanded：旧名称不存在时没有展开段落；同名数据后来回来会继续匹配。

## 完整接入示例

放在 `src/examples/ProviderComparisonExample.vue`。示例明确以固定 GBP 费用与 GBP → EUR 的倍率传入。

<!-- example -->
```vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import WiseProviderComparison from '../library/wise/WiseProviderComparison.vue'
import type { TransferProvider } from '../library/wise/wiseProviders'

const amount = ref(100)
const providers: TransferProvider[] = [
  { name: 'Account transfer', fee: 5, rate: 2, featured: true },
  { name: 'Card transfer', fee: 10, rate: 1.8 },
]
const amountLabel = computed(() => `${amount.value.toFixed(2)} GBP`)
</script>

<template>
  <WiseProviderComparison
    v-model:amount="amount"
    :providers="providers"
    source-currency="GBP"
    target-currency="EUR"
    title="Compare transfer methods"
  />
  <output>{{ amountLabel }}</output>
</template>
```

## 现有测试与未处理输入

[wise-core.test.ts](../src/library/wise/wise-core.test.ts#L42) 覆盖实际乘减公式、低于手续费时归零，以及点击按钮后的费用说明。

<!-- source: src/library/wise/wise-core.test.ts#L42-L49 -->
```ts
  it('recalculates provider results from supplied rates and never returns a negative amount', async () => {
    const wrapper = mount(WiseProviderComparison, { props: { amount: 100, providers: [{ name: 'Provider A', fee: 5, rate: 2 }] } })
    expect(wrapper.get('.provider-row b').text()).toBe('190.00 EUR')
    await wrapper.get('input').setValue('2')
    expect(wrapper.get('.provider-row b').text()).toBe('0.00 EUR')
    await wrapper.get('button').trigger('click')
    expect(wrapper.get('.provider-details').text()).toContain('Transfer fee: 5.00 GBP')
  })
```

现有用例没有断言横条 35% 下限、相同名称、多服务商切换展开或无效 rate。providers 的 fee / rate 当前不做有限值校验，NaN 能传播到 received / best，Infinity 也不会被有限性检查拦截。生产报价应在宿主入口验证为有限、合理的数值。

修改 sourceCurrency / targetCurrency 只改文案，不会重新请求相应币对。必须将单位与 providers 数据作为一组更新，避免把原币对报价标成另一币对。

宿主导入数据前至少需要保证以下关系：

| 字段 | 业务校验原因 |
| --- | --- |
| `name` | 唯一名称保证一次只展开一行 |
| `fee` | 有限数且单位为 sourceCurrency；负费用需有明确抵扣语义 |
| `rate` | 有限正数且币对方向正确，组件没有反向换算开关 |
| `amount` | 有限且满足业务限额；此组件只有零下限，无交易最高限额 |

没有计时器、全局事件、网络请求或 Object URL；卸载无需额外清理。导出依赖 SFC、wiseProviders.ts、Wise 字体与 `lucide-vue-next`。
