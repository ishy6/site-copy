# Jitter 套餐选择：PricingPlans

组件 ID：`jitter-pricing-plans`。源码：[PricingPlans.vue](../src/library/jitter/PricingPlans.vue#L1)。年/月选择影响显示金额及选择事件中的布尔账期。与 Osmo 定价类似但契约不同：此组件发完整 MotionPlan 和独立 yearly 参数。

## 数据与默认参数

<!-- source: src/library/jitter/PricingPlans.vue#L4-L12 -->
```ts
export interface MotionPlan { id: string; name: string; tagline: string; monthly: number; annual: number; features: string[]; featured?: boolean }
const props = withDefaults(defineProps<{ title?: string; yearly?: boolean; currency?: string; plans?: MotionPlan[] }>(), {
  title: 'Find your flow.', yearly: true, currency: '$',
  plans: () => [
    { id: 'free', name: 'Free', tagline: 'A little curiosity.', monthly: 0, annual: 0, features: ['Unlimited local files', 'Motion templates', 'Personal workspace'] },
    { id: 'pro', name: 'Pro', tagline: 'Your next creative leap.', monthly: 18, annual: 12, features: ['Everything in Free', 'High-resolution exports', 'Custom fonts'], featured: true },
    { id: 'team', name: 'Team', tagline: 'Great motion, together.', monthly: 30, annual: 24, features: ['Everything in Pro', 'Shared team libraries', 'Centralized billing'] },
  ],
})
```

| prop | 类型 | 默认与语义 |
| --- | --- | --- |
| `title` | string | `'Find your flow.'` |
| `yearly` | boolean | true，后续变更同步本地 annual |
| `currency` | string | `'$'`，只作字符串前缀 |
| `plans` | MotionPlan[] | Free/Pro/Team 三套餐 |

MotionPlan 中 monthly 与 annual 均为每月价格；features 为字符串列表，featured 可选布尔。默认 Pro 为18/月或年付折合12/月，Team为30/月或年付折合24/月。组件没有按12乘总额、货币换算或 Intl 格式化；currency='EUR ' 会原样拼接。

## 计费状态与事件区别

<!-- source: src/library/jitter/PricingPlans.vue#L13-L16 -->
```ts
const emit = defineEmits<{ select: [plan: MotionPlan, yearly: boolean]; 'billing-change': [yearly: boolean] }>()
const annual = ref(props.yearly)
watch(() => props.yearly, value => { annual.value = value })
function setBilling(value: boolean) { annual.value = value; emit('billing-change', value) }
```

`annual` 是唯一内部选择状态。用户点击计费按钮调用 setBilling，它总是发 billing-change，即使重复点击当前值也会 emit。外部 yearly prop 的 watcher 只写 annual，不发 billing-change；这一点与监听 billing ref 发事件的 Osmo 版本不同。

`select(plan:MotionPlan,yearly:boolean)` 是两个事件参数，不是包含 plan/yearly 的单一对象。传出的 plan 是数组中的原对象，父组件若需要持久化快照应自行复制；组件不会冻结对象。

<!-- source: src/library/jitter/PricingPlans.vue#L18-L20 -->
```vue
<template>
  <section class="pricing-plans" :aria-label="title"><header><h3>{{ title }}</h3><div class="billing-switch" role="group" aria-label="Billing interval"><button type="button" :aria-pressed="!annual" @click="setBilling(false)">Monthly</button><button type="button" :aria-pressed="annual" @click="setBilling(true)">Yearly</button></div></header><div class="plans-grid"><article v-for="plan in plans" :key="plan.id" :class="{ featured: plan.featured }"><span class="plan-eyebrow">{{ plan.featured ? 'A CREATIVE FAVORITE' : 'MADE FOR MOTION' }}</span><h4>{{ plan.name }}</h4><p class="tagline">{{ plan.tagline }}</p><div class="price">{{ currency }}{{ annual ? plan.annual : plan.monthly }}<span>/ month</span></div><small>{{ (annual ? plan.annual : plan.monthly) === 0 ? 'Free, always' : annual ? 'Per editor, billed yearly' : 'Per editor, billed monthly' }}</small><button class="choose-plan" type="button" :aria-label="`Choose ${plan.name}`" @click="emit('select', plan, annual)">Choose {{ plan.name }}<ArrowUpRight :size="14" /></button><ul><li v-for="feature in plan.features" :key="feature"><Check :size="13" />{{ feature }}</li></ul></article></div></section>
</template>
```

按钮点击 monthly → setBilling(false) → annual=false → 所有金额改取 plan.monthly → 账期说明改 monthly。选择 Pro 时 emit('select',plan,annual)，使用当下 annual，不读可能尚未被宿主回写的 props.yearly。

价格0显示 Free, always；非0根据 annual 显示 billed yearly/monthly。featured 同时改变顶部英文小标、article背景与选择按钮颜色，它来自数据布尔，不由数组顺序猜测。

## 键盘、视觉和状态边界

计费切换是role=group，两个按钮使用aria-pressed，没有role=tab或方向键处理。所有选择按钮有包含套餐名的aria-label。原生Tab、Enter、空格有效。没有drag、range或手势；button cursor固定pointer，没有动态改cursor。

`.plans-grid` 三列repeat(3,minmax(0,1fr))，540px以下变单列，标题和计费开关改竖排。价格34px，特色套餐背景淡紫、按钮紫色；focus-visible为2px紫色轮廓。CSS没有transition计时器。

组件没有loading/error/payment状态。plans为空时只剩标题与计费开关，没有空列表说明。没有价格合法性校验，负值/NaN会直接插值；实际计费由宿主提供验证后的数据。

## 完整接入

放在 `src/examples/`，采用明确的双参数处理函数。

<!-- example -->
```vue
<script setup lang="ts">
import { ref } from 'vue'
import PricingPlans, { type MotionPlan } from '../library/jitter/PricingPlans.vue'

const yearly = ref(true)
const summary = ref('')
function select(plan: MotionPlan, annual: boolean) {
  const monthly = annual ? plan.annual : plan.monthly
  summary.value = `${plan.name}: ${monthly}/月，${annual ? '年付' : '月付'}`
}
</script>
<template>
  <PricingPlans :yearly="yearly" currency="$"
    @billing-change="yearly = $event" @select="select" />
  <p role="status">{{ summary }}</p>
</template>
```

如果要接支付API，应由select处理器发送plan.id和账期，由服务端返回最终金额；不能把浏览器里的可修改props作为支付可信价格。组件没有请求副作用，也无需要清理的全局监听。

## 测试事实

[core.test.ts](../src/library/jitter/core.test.ts#L30) 验证默认Pro $12、改月付后$18、选择事件计划id及第二参数false、yearly prop来回更新后显示$12。没有断言重复点击billing-change、空plans、featured渲染或真实支付流程。
