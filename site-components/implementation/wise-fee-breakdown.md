# Wise 费用明细：原生单选切换与有限数值合计

组件 ID：`wise-fee-breakdown`。所有实现均在 [WiseFeeBreakdown.vue](../src/library/wise/WiseFeeBreakdown.vue#L1)，没有另一个计算 helper 或服务请求层。

它接收两组业务数据：本次费用明细 `fees` 与独立比较数据 `comparisons`。用户通过原生 radio 分段控件切换它们。比较区不会根据费用明细自动推导服务商报价，也不会排序服务商。

## 接口定义

<!-- source: src/library/wise/WiseFeeBreakdown.vue#L4-L11 -->
```ts
export interface FeeLine { label: string; amount: number }
export interface FeeComparison { name: string; amount: number; featured?: boolean }
const props = withDefaults(defineProps<{ title?: string; currency?: string; initialView?: string; fees?: FeeLine[]; comparisons?: FeeComparison[] }>(), {
  title: 'Total fees', currency: 'GBP', initialView: 'details',
  fees: () => [{ label: 'Our fee', amount: 4.65 }, { label: 'Bank transfer', amount: 1.85 }, { label: 'Exchange rate markup', amount: 0 }],
  comparisons: () => [{ name: 'Wise', amount: 6.5, featured: true }, { name: 'Bank transfer', amount: 18 }, { name: 'Card transfer', amount: 24 }],
})
const emit = defineEmits<{ 'update:view': [view: string] }>()
```

| 参数 | 类型 | 默认值 | 实际用途 |
| --- | --- | --- | --- |
| `title` | `string` | `Total fees` | 标题和区域无障碍名称 |
| `currency` | `string` | `GBP` | 格式化数字后的文本后缀 |
| `initialView` | `string` | `details` | 初始化并同步内部 view |
| `fees` | `FeeLine[]` | 4.65、1.85、0 三项 | 明细逐行显示，总额 reduce 合计 |
| `comparisons` | `FeeComparison[]` | Wise 6.5、银行 18、银行卡 24 | 比较视图的原始业务数据 |

`initialView` 的 TypeScript 类型是 string，而不是字面量联合类型。实际模板只检查 `view === 'details'`；传入其他任意值会进入比较分支，但两颗 radio 都不会选中。宿主应限定 `details` 或 `compare`。

唯一事件是 `update:view(view: string)`，来自 radio 的 `change`。没有 `change` 总额事件、费用行点击事件或选择服务商事件。外部更新 `initialView` 时不会再次 emit。

`featured` 只表示高亮样式，并不是算法算出的最便宜服务商。即使某一 featured 项金额更高，它仍会使用荧光绿背景和箭头。

## 状态与计算的边界

组件只有一个业务 ref：`view`。`group = useId()` 是该组件实例的原生 radio name，避免两个费用组件的单选状态互相取消。

<!-- source: src/library/wise/WiseFeeBreakdown.vue#L12-L16 -->
```ts
const view = ref(props.initialView)
const group = useId()
watch(() => props.initialView, value => { view.value = value })
const total = computed(() => props.fees.reduce((sum, fee) => sum + (Number.isFinite(fee.amount) ? fee.amount : 0), 0))
const money = (amount: number) => `${new Intl.NumberFormat('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)} ${props.currency}`
```

`total` 的公式是所有有限 `fee.amount` 的直接和。每一项在相加前用 `Number.isFinite` 检查；`NaN`、Infinity 和运行时传入的数值字符串均不计入总额。

这里没有将负数夹到零。业务传入负值时，它会作为抵扣项目参与合计。`fees=[]` 的 reduce 起点为 0，因此总额为 `0.00 GBP`。

显示阶段统一用 `Intl.NumberFormat('en-GB')` 保留两位小数，再拼接 currency。currency 没有作为 Intl 的 currency 选项传入，因此 `HKD`、`GBP` 等只影响后缀，不能完成汇率转换或货币精度适配。

需要注意：总额过滤无效数字，但行内 `money(line.amount)` 直接格式化原值。传入 NaN 时，总额可能仍正常，而明细显示 NaN。数据清洗应在父组件完成，不能把“合计忽略异常值”理解成整张表已经校验。

金额以 JS number 合计，不逐行 round。需要结算级精度时应在业务层使用整数分或精确十进制库计算完毕，再把展示数据传入。

| 输入组合 | 当前结果 |
| --- | --- |
| `fees=[]` | 明细分支仍显示 Total 0.00 |
| `comparisons=[]` 且 compare | 显示比较数据为空的提示 |
| `fees=[2, -1]` 对应金额 | 合计为 1.00，负值被作为抵扣 |
| `currency='USD'`，金额不变 | 只更改后缀，不换算数值 |

## 原生单选的事件链

模板在 [第 21 行](../src/library/wise/WiseFeeBreakdown.vue#L21) 遍历 `['details','compare']`。每个 label 包含一个隐藏但仍可聚焦的原生 radio，以及展示文案的 span。

执行顺序为：

1. 鼠标点击 label，或键盘操作同名 radio 组。
2. 浏览器更改 radio checked 状态并触发 change。
3. Vue 的 `v-model="view"` 把当前 radio value 写入 view。
4. `@change` 发布 `update:view`，载荷是最新 view。
5. `v-if="view === 'details'"` 决定明细 DOM 是否存在；否则创建 comparisons 区。

没有自定义 ArrowLeft / ArrowRight 处理函数。同组单选的方向键选择来自浏览器原生 radio 行为。组件也没有 `role="tablist"`，文档不把它描述为自实现的 ARIA tabs。

`view` 的 prop watch 与用户 change 是不同路径：外部值更新直接同步 DOM，不经过用户事件，不触发 update:view，避免反馈循环。

## DOM 与 CSS 反馈

在 [样式段](../src/library/wise/WiseFeeBreakdown.vue#L26)，`.fee-tabs input` 使用 `position:absolute;opacity:0`，并没有 `display:none`。浏览器仍能聚焦和选择该 input。

`input:checked + span` 将胶囊底色改为白色并增加轻阴影；`input:focus-visible + span` 显示 2px 的绿色焦点框。被更新的是 checked 对应的 CSS 匹配，代码没有手动设置 span.style。

label 的鼠标样式是固定 `cursor:pointer`。无拖拽事件、PointerEvent、抓取鼠标样式或动画计时器。

明细用 `<dl>` / `<dt>` / `<dd>` 表达名称和金额，行内 flex 将金额对齐右侧。金额设置 `flex-shrink:0`，标签使用 `overflow-wrap:anywhere`；业务仍应避免超长的无分隔金额文本。

比较项保持传入顺序，通过 `:class="{ featured: provider.featured }"` 选择高亮底色。箭头只是装饰图标，`aria-hidden=true`；整行没有按钮语义，也不可点选。

比较列表为空时显示 `No comparison data available`。明细为空没有独立空状态，而是保留 Total 0.00。这是两个分支刻意不同的实际表现。

## 完整接入示例

放在 `src/examples/FeeBreakdownExample.vue`。两个来源数据是彼此独立的常量；修改明细不会自动覆盖服务商比较。

<!-- example -->
```vue
<script setup lang="ts">
import { ref } from 'vue'
import WiseFeeBreakdown, {
  type FeeLine,
  type FeeComparison,
} from '../library/wise/WiseFeeBreakdown.vue'

const view = ref('details')
const fees = ref<FeeLine[]>([
  { label: 'Transfer fee', amount: 2 },
  { label: 'Processing fee', amount: 3.25 },
])
const comparisons: FeeComparison[] = [
  { name: 'Account transfer', amount: 5.25, featured: true },
  { name: 'Card transfer', amount: 7 },
]
function changeView(value: string) {
  view.value = value
}
</script>

<template>
  <WiseFeeBreakdown
    title="Transfer fees"
    currency="GBP"
    :initial-view="view"
    :fees="fees"
    :comparisons="comparisons"
    @update:view="changeView"
  />
  <output>{{ view }}</output>
</template>
```

不要写 `v-model:view="view"` 后期待 prop 自动接收，因为组件定义的是 `initialView`，没有 `view` prop。以上显式 `initial-view` + `update:view` 才符合当前接口。

## 精确验证依据

[wise-core.test.ts](../src/library/wise/wise-core.test.ts#L34) 的现有用例用两条 2 和 3.25 的明细以及一个 7 的比较项，验证合计、切换后的 DOM 和事件。

<!-- source: src/library/wise/wise-core.test.ts#L34-L40 -->
```ts
  it('sums fees and switches to provided comparison data', async () => {
    const wrapper = mount(WiseFeeBreakdown, { props: { fees: [{ label: 'Fixed', amount: 2 }, { label: 'Variable', amount: 3.25 }], comparisons: [{ name: 'Example', amount: 7 }] } })
    expect(wrapper.get('.fee-total strong').text()).toBe('5.25 GBP')
    await wrapper.get('input[value="compare"]').setValue()
    expect(wrapper.get('.comparisons').text()).toContain('Example7.00 GBP')
    expect(wrapper.emitted('update:view')?.[0]).toEqual(['compare'])
  })
```

这个用例没有覆盖无效 view、负数抵扣、非有限金额、两个组件同时挂载时的 radio 独立性或真实浏览器的键盘选择。上述边界根据当前源码说明，未冒充已有测试结论。

组件没有异步状态、资源分配或网络错误边界。唯一非代码静态依赖是 Wise 字体；图标来自 `lucide-vue-next`。所有业务金额、时效、税率和费用来源由宿主负责。
