# Osmo 会员定价：PricingPlans

组件 ID：`osmo-pricing-plans`。源码：[PricingPlans.vue](../src/library/osmo/PricingPlans.vue#L1)。它组合 BillingSwitch 和 MotionButton，用同一 billing 值驱动展示价格、优惠删除线及选择事件。

## Props 与业务数据

<!-- source: src/library/osmo/PricingPlans.vue#L5-L11 -->
```ts
export interface OsmoPlan { id: string; title: string; users: string; annual: number; quarterly: number; label: string }
const props = withDefaults(defineProps<{ initialBilling?: 'annual' | 'quarterly'; resources?: number; currency?: string; plans?: OsmoPlan[] }>(), {
  initialBilling: 'annual', resources: 212, currency: 'EUR', plans: () => [
    { id: 'solo', title: 'Solo', users: '1 user', annual: 20, quarterly: 25, label: 'Become a member' },
    { id: 'team', title: 'Team', users: 'Min. 2 users', annual: 16, quarterly: 20, label: 'Sign up your team' },
  ],
})
```

| prop | 默认值 | 说明 |
| --- | --- | --- |
| `initialBilling` | `'annual'` | 类型仅 annual/quarterly；后续更新会同步内部状态 |
| `resources` | `212` | 每个套餐底部资源计数；不会参与价格计算 |
| `currency` | `'EUR'` | 传给 Intl.NumberFormat 的 ISO 货币码，不是任意显示前缀 |
| `plans` | Solo/Team 两项 | 每项 id/title/users/annual/quarterly/label 均必填 |

`annual` 与 `quarterly` 字段都代表**折算每月的价格**。默认 Solo 年付20、季付25；Team 年付16、季付20。组件不自动乘以12或3计算订单总额，也不校验 Team 的最少两用户，users 是展示文本。

## ref、watch 和格式化

<!-- source: src/library/osmo/PricingPlans.vue#L12-L16 -->
```ts
const billing = ref(props.initialBilling)
const emit = defineEmits<{ select: [plan: { id: string; billing: 'annual' | 'quarterly'; monthlyPrice: number }]; 'billing-change': [billing: 'annual' | 'quarterly'] }>()
watch(() => props.initialBilling, value => { billing.value = value })
watch(billing, value => emit('billing-change', value))
const formatter = computed(() => new Intl.NumberFormat('en', { style: 'currency', currency: props.currency, maximumFractionDigits: 0 }))
```

`billing` 初始化自 prop；外部改 initialBilling 会回写本地 ref，用户操作 BillingSwitch 也直接更新它。watch(billing) 在值真正变更后发 billing-change，因此重复选择当前周期不会产生新事件。

`formatter` 是 computed，currency 变化时重新构造 Intl.NumberFormat，固定 locale=en、currency 格式、maximumFractionDigits=0。所以 20.5 等小数会被显示格式舍入，但 select 的 monthlyPrice 保留原始数值。无效货币码可能使 Intl 构造抛错，调用方应提供合法 ISO 代码。

事件契约：`billing-change(billing:'annual'|'quarterly')`；`select({id:string,billing:'annual'|'quarterly',monthlyPrice:number})`。select 不返回整个 OsmoPlan，也不返回货币、人数或总价，宿主需要从自己的计划数据补齐。

## 用户操作到价格与订单参数

<!-- source: src/library/osmo/PricingPlans.vue#L18-L20 -->
```vue
<template>
  <section class="osmo-pricing" aria-label="Membership plans"><BillingSwitch v-model="billing" savings="" /><div class="osmo-pricing__grid"><article v-for="(plan, i) in plans" :key="plan.id" :class="{ team: i % 2 === 1 }"><small>{{ plan.users }}</small><h2>{{ plan.title }}</h2><div class="osmo-pricing__price"><del v-if="billing === 'annual' && plan.quarterly > plan.annual">{{ formatter.format(plan.quarterly) }}</del><strong>{{ formatter.format(plan[billing]) }}</strong></div><p>Per month, billed {{ billing === 'annual' ? 'annually' : 'quarterly' }}</p><MotionButton :label="plan.label" @click="emit('select', { id: plan.id, billing, monthlyPrice: plan[billing] })" /><footer>{{ resources }} Vault resources, added weekly</footer></article></div><p v-if="!plans.length">No plans available.</p></section>
</template>
```

1. 用户点击 Quarterly，BillingSwitch 的模型由 annual 改为 quarterly。
2. 父组件 billing 同步变更，`plan[billing]` 取季度折算月价。
3. 删除线只在 annual 且 quarterly>annual 时出现；切到季度后删除线消失。
4. 账期说明从同一 billing 生成 annually/quarterly。
5. 点击套餐按钮时即时组装 select payload，因此不会发送先前周期的旧价格。

这里没有发起结算请求、loading 或错误状态。宿主应在收到 select 后用服务端价格重新核验，再执行注册/付费流程；组件本身只负责交互选择。

## 组合依赖与样式

必须同时带入 BillingSwitch.vue、MotionButton.vue、ButtonLabel.vue。计费开关的 savings 被显式设成空字符串，避免在每组套餐顶部重复显示手写优惠。

<!-- source: src/library/osmo/PricingPlans.vue#L22-L34 -->
```css
.osmo-pricing { width: min(100%, 625px); color: #f4f4f4; font: 13px/1.4 'Haffer', Arial, sans-serif; }
.osmo-pricing__grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-top: 20px; }
.osmo-pricing article { background: #f4f4f4; color: #201d1d; padding: 23px; border-radius: 4px; }
.osmo-pricing article.team { background: #b1ff69; }
.osmo-pricing small { font-size: 11px; }
.osmo-pricing h2 { margin: 12px 0; font-size: 29px; font-weight: 450; }
.osmo-pricing__price { display: flex; align-items: baseline; gap: 10px; }
.osmo-pricing__price strong { font-size: 42px; font-weight: 450; }
.osmo-pricing__price del { font-size: 22px; opacity: .45; }
.osmo-pricing p { font-size: 11px; margin: 6px 0 22px; }
.osmo-pricing :deep(.osmo-button) { width: 100%; min-height: 40px; padding: 9px 12px; gap: 12px; font-size: 13px; }
.osmo-pricing footer { border-top: 1px solid #201d1d25; margin-top: 20px; padding-top: 14px; font-size: 11px; }
@media(max-width: 450px) { .osmo-pricing__grid { grid-template-columns: 1fr; } }
```

`.team` 由数组索引的奇偶产生，不是通过 plan.id==='team'。因此自定义3个计划时第2项为绿色，第1/3项为白色。两列 minmax(0,1fr) 在450px以下转单列。价格 strong 使用固定42px，按钮宽100%，子按钮通过 :deep 调整尺寸。

计费开关继承原生按钮键盘行为与 Home/End/方向键选择。MotionButton 继承其链接/按钮语义及文字动画。此组件没有拖拽、滑动、cursor状态或自己的计时器。

## 接入示例

示例放在 `src/examples/`，宿主拥有计划数组并保存选择结果。

<!-- example -->
```vue
<script setup lang="ts">
import { ref } from 'vue'
import PricingPlans, { type OsmoPlan } from '../library/osmo/PricingPlans.vue'

const plans: OsmoPlan[] = [
  { id: 'solo', title: '个人', users: '1 位用户', annual: 20,
    quarterly: 25, label: '选择个人版' },
  { id: 'team', title: '团队', users: '至少 2 位用户', annual: 16,
    quarterly: 20, label: '选择团队版' },
]
const selection = ref<{ id: string; billing: 'annual' | 'quarterly'; monthlyPrice: number } | null>(null)
</script>
<template>
  <div style="padding: 24px; background: #201d1d">
    <PricingPlans :plans="plans" currency="EUR" :resources="300"
      @select="selection = $event" />
  </div>
  <p v-if="selection">{{ selection.id }} / {{ selection.billing }} / {{ selection.monthlyPrice }}</p>
</template>
```

## 测试与边界

[core.test.ts](../src/library/osmo/core.test.ts#L74) 点击季度按钮后验证首个显示价格为 €25，再验证 select 恰为 `{id:'solo',billing:'quarterly',monthlyPrice:25}`。这是防止 UI 与事件价格不同步的主要测试。

plans=[] 有 No plans available 文案；resources 没有运行时上下限，预览面板的 min/max 不代表组件校验。当前没有负价格、小数舍入、非法 currency 或服务端结算集成的测试。
