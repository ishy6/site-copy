# Osmo 计费切换：BillingSwitch

组件 ID：`osmo-billing-switch`。源码：[BillingSwitch.vue](../src/library/osmo/BillingSwitch.vue#L1)。它是双按钮计费周期选择器，负责值与按钮状态同步；价格计算属于使用它的定价组件。

## 公开接口

| 参数/接口 | 类型 | 默认值 | 含义 |
| --- | --- | --- | --- |
| `modelValue` / `v-model` | `'quarterly' \| 'annual'` | `'annual'` | 当前季度或年度计费 |
| `savings` | `string` | `'Save 20%'` | 手写优惠旁注；空字符串隐藏 |
| `update:modelValue` | `(value: 'quarterly' \| 'annual')` | 不适用 | 选中值变化时由 defineModel 发出 |

没有普通 `change` 事件，没有可配置 options 数组。Quarterly 与 Annually 两个标签目前固定在源码中。依赖 `ButtonLabel.vue`，其旋转标签通过 [rotate 函数](../src/library/osmo/ButtonLabel.vue#L15) 调用 Element.animate 实现，两层文字完成后取消动画并恢复基础样式。

## 单一模型与去重

<!-- source: src/library/osmo/BillingSwitch.vue#L4-L7 -->
```ts
withDefaults(defineProps<{ savings?: string }>(), { savings: 'Save 20%' })
const billing = defineModel<'quarterly' | 'annual'>({ default: 'annual' })
const options = [{ value: 'quarterly', label: 'Quarterly' }, { value: 'annual', label: 'Annually' }] as const
function select(value: typeof billing.value) { if (billing.value !== value) billing.value = value }
```

`billing` 是 `defineModel` 返回的模型 ref。父组件传入 v-model 时，写入 ref 发出 update:modelValue 并依赖父组件回写；未传模型时使用本地默认值。`select` 的不等判断令重复点击当前项不重复发出更新。

与显式维护两份 `isAnnual`/`isQuarterly` 相比，这里每个按钮都从同一个字符串推导 active 和 aria-pressed，状态不可能出现两项同时激活。

## 点击与键盘链路

<!-- source: src/library/osmo/BillingSwitch.vue#L8-L15 -->
```ts
function onKeydown(event: KeyboardEvent, index: number) {
  const next = event.key === 'Home' ? 0 : event.key === 'End' ? 1
    : ['ArrowRight', 'ArrowLeft'].includes(event.key) ? 1 - index : null
  if (next === null) return
  event.preventDefault()
  select(options[next]!.value)
  ;(event.currentTarget as HTMLElement).parentElement?.querySelectorAll('button')[next]?.focus()
}
```

Home 固定选择索引 0，即 quarterly；End 固定选择索引 1，即 annual。ArrowLeft 和 ArrowRight 都执行 `1-index`，两个选项之间循环。其他按键提前返回，不拦截 Tab、Enter 或空格；后两者交给原生 button 生成 click。

有效键先 `preventDefault` 避免左右键滚动页面，再修改模型，最后在同一父节点下查询按钮并 focus 对应项。这些按钮一直存在，因此无需等待 nextTick 才能移动焦点。

<!-- source: src/library/osmo/BillingSwitch.vue#L18-L28 -->
```vue
<template>
  <div class="osmo-billing">
    <div class="osmo-billing__options" role="group" aria-label="Billing period">
      <button v-for="(option, index) in options" :key="option.value" type="button"
        :class="[{ active: billing === option.value }, option.value]" :aria-pressed="billing === option.value"
        @click="select(option.value)" @keydown="onKeydown($event, index)">
        <ButtonLabel :label="option.label" />
      </button>
    </div>
    <span v-if="savings" class="osmo-billing__note">{{ savings }}</span>
  </div>
```

按钮组使用 `role=group`、`aria-label=Billing period`，每个按钮用 `aria-pressed` 表示选中。这里不是 role=tab，也没有 roving tabindex，所以 Tab 可顺序访问两个按钮。方向键只是额外快捷选择方式。

## 样式如何反映选择

<!-- source: src/library/osmo/BillingSwitch.vue#L32-L40 -->
```css
.osmo-billing { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 18px; max-width: 100%; font: 15px/1.3 'Haffer', Arial, sans-serif; }
.osmo-billing__options { display: flex; }
.osmo-billing button { position: relative; isolation: isolate; overflow: hidden; min-width: 110px; min-height: 46px; padding: 12px 16px; border: 0; background: #353230; color: #f4f4f4; font: inherit; cursor: pointer; transition: color .2s, background .2s; }
.osmo-billing .quarterly { border-radius: 3px; }
.osmo-billing .annual { border-radius: 99px; }
.osmo-billing .active { color: #201d1d; background: #f4f4f4; }
.osmo-billing button:focus-visible { outline: 2px solid #b1ff69; outline-offset: 4px; z-index: 1; }
.osmo-billing__note { max-width: 130px; overflow-wrap: anywhere; color: #b1ff69; font: 25px/1 'Brisa Pro', cursive; transform: rotate(-7deg); }
@media (prefers-reduced-motion: reduce) { .osmo-billing button { transition: none; } }
```

`quarterly` 和 `annual` 类控制方形与胶囊轮廓；`active` 改写前景与背景色。颜色过渡只持续 0.2 秒；系统减少动态效果时 transition:none。优惠旁注使用 Brisa Pro 手写字体、-7° 旋转，最多宽 130px。

光标为固定 pointer。没有原生 drag、PointerEvent 手势、拖动指示器或拖动中的鼠标样式。触屏操作就是原生按钮触发 click。按钮最小宽 110px、最小高 46px；容器 flex-wrap 允许旁注在窄容器换行。

## 接入及值的归属

示例文件放在 `src/examples/`；所有展示文案都从同一份 billing 值派生。

<!-- example -->
```vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import BillingSwitch from '../library/osmo/BillingSwitch.vue'

const billing = ref<'quarterly' | 'annual'>('annual')
const monthlyPrice = computed(() => billing.value === 'annual' ? 20 : 25)
</script>
<template>
  <section style="padding: 24px; background: #201d1d; color: white">
    <BillingSwitch v-model="billing" savings="年付更优惠" />
    <p>每月 {{ monthlyPrice }} EUR，当前周期：{{ billing }}</p>
  </section>
</template>
```

没有副作用 watcher、计时器或 DOM 全局监听需要此组件本身清理；ButtonLabel 的监听与 Animation 由子组件在卸载时处理。父组件从接口刷新周期时直接改 billing 即可。传入 TypeScript 联合以外的值没有运行时校验，可能导致两个按钮均未选中。

## 测试事实

[osmo.test.ts](../src/library/osmo/osmo.test.ts#L25) 验证点击当前 annual 不重新 emit；在第二按钮按 Home 后发出 quarterly，并把真实焦点移至第一按钮。未逐项测试 End、两个方向键和受控父组件更新；代码片段展示了这些路径，但不能把它们等同于已自动验证。
