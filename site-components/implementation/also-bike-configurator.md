# Modular Bike Configurator：三步模块选配与配置快照

组件 ID：`also-bike-configurator`。

组件把 Top Frame、Ride Package、Cockpit 和最终汇总组织成四个显示阶段。每步修改真实配置 ID，联动模块图片、可用尺寸和总价；不是单张车辆图上的装饰性热点。

## 源码和数据责任

- [ModularBikeConfigurator.vue](../src/library/also/ModularBikeConfigurator.vue#L1)：步骤、联动与保存。
- [frame-data.ts](../src/library/also/frame-data.ts#L1)：车架、尺寸和车架加价。
- [ride-data.ts](../src/library/also/ride-data.ts#L1)：骑行套件规格和加价。
- [cockpit-data.ts](../src/library/also/cockpit-data.ts#L1)：驾驶舱选项。
- [core.spec.ts](../src/library/also/core.spec.ts#L11)：完整流程、金额、失败重试和缺失模块验证。

商品模块图是来自原站的独立图片。当前实现不会把选中的模块合成为整车渲染图，也没有 3D 引擎、canvas 或图片拖动视角。

## Props 完整契约

| 参数 | 类型 | 默认值 | 约束 |
| --- | --- | --- | --- |
| `title` | `string` | `Build your TM-B` | 标题 |
| `basePrice` | `number` | `3500` | USD 基础金额 |
| `frames` | `BikeFrame[]` | `bikeFrames` | 每项包含 `sizes` 和可选 `available` |
| `packages` | `RidePackage[]` | `ridePackages` | 套件图片、规格、加价 |
| `cockpits` | `BikeCockpit[]` | `bikeCockpits` | 驾驶舱图片、说明、加价 |
| `initialFrame` | `string` | `solo` | 初始车架；prop 变化时重同步 |
| `initialStep` | `number` | `0` | 取整限制为 0 到 3 |
| `disabled` | `boolean` | `false` | 禁用本地选择、步骤和保存 |
| `saveBuild` | `(build: BikeBuild) => Promise<void>` | 未设置 | 可等待的保存服务 |

通用选项都有唯一 `id`、`label`、`image`、`price`。仅 `available === false` 视为不可用；没有该字段时默认为可选。

车架额外包含 `description`、`loadLbs`、可选 `cargoLbs`、`sizes`。`FrameSize` 为 `{ id, label, minInches, maxInches }`。

套件有 `terrain`、`tires`、`pedals`、`modes` 字符串；驾驶舱有 `description`。保存快照包含这些完整对象，不只包含 ID。

## 状态与总价

<!-- source: src/library/also/ModularBikeConfigurator.vue#L23-L33 -->
```ts
const frame = computed(() => props.frames.find(item => item.id === frameId.value))
const ridePackage = computed(() => props.packages.find(item => item.id === packageId.value))
const cockpit = computed(() => props.cockpits.find(item => item.id === cockpitId.value))
const size = computed(() => frame.value?.sizes.find(item => item.id === sizeId.value))
const total = computed(() => props.basePrice + (frame.value?.price ?? 0) + (ridePackage.value?.price ?? 0) + (cockpit.value?.price ?? 0))
const build = computed<BikeBuild | null>(() => frame.value && size.value && ridePackage.value && cockpit.value ? { frame: frame.value, size: size.value, ridePackage: ridePackage.value, cockpit: cockpit.value, total: total.value } : null)
const canContinue = computed(() => step.value === 0 ? frame.value?.available !== false && !!size.value : step.value === 1 ? !!ridePackage.value && ridePackage.value.available !== false : !!cockpit.value && cockpit.value.available !== false)
const available = computed(() => build.value && frame.value?.available !== false && ridePackage.value?.available !== false && cockpit.value?.available !== false)
const options = computed(() => step.value === 0 ? props.frames : step.value === 1 ? props.packages : props.cockpits)
const current = computed(() => step.value === 0 ? frameId.value : step.value === 1 ? packageId.value : cockpitId.value)
const displayed = computed(() => options.value.find(item => item.id === current.value))
```

内部 ref 分别保存 `step`、`frameId`、`packageId`、`cockpitId`、`sizeId`，以及异步 `pending/status/failed`。

默认套件 ID 是 `road`，驾驶舱是 `standard`，尺寸是 `small`。这些选项没有独立 initial prop；自定义数组缺少默认 ID 时由 reconcile 选择首个可用项。

总价公式为 `basePrice + frame.price + ridePackage.price + cockpit.price`，尺寸不单独加价。例如 Bench 加 50、All Terrain 加 200、Sport 加 0，结果为 `3500 + 50 + 200 = 3750`。

缺少某个模块时总价仍可显示部分金额，但 `build=null`，最终保存禁用。`canContinue` 检查当前步骤，`available` 检查整份配置。

## 数据变化后的协调

<!-- source: src/library/also/ModularBikeConfigurator.vue#L35-L44 -->
```ts
function reconcile() {
  if (!props.frames.some(item => item.id === frameId.value)) frameId.value = props.frames.find(item => item.available !== false)?.id ?? ''
  if (!props.packages.some(item => item.id === packageId.value)) packageId.value = props.packages.find(item => item.available !== false)?.id ?? ''
  if (!props.cockpits.some(item => item.id === cockpitId.value)) cockpitId.value = props.cockpits.find(item => item.available !== false)?.id ?? ''
}
watch(() => [props.frames, props.packages, props.cockpits], reconcile, { immediate: true, deep: true })
watch(frame, value => { if (!value?.sizes.some(item => item.id === sizeId.value)) sizeId.value = value?.sizes[0]?.id ?? '' }, { immediate: true })
watch(() => props.initialFrame, value => { frameId.value = value; reconcile() })
watch(() => props.initialStep, value => { step.value = Math.min(3, Math.max(0, Math.trunc(value) || 0)) }, { immediate: true })
watch(build, value => { status.value = ''; emit('change', value) }, { deep: true })
```

reconcile 处理“ID 不存在”，并不会强制替换仍存在但后来变为 unavailable 的选项。这样宿主能看见不可用的旧选择，继续/保存按钮会阻止提交。

车架变化时检查旧尺寸是否在新车架尺寸列表中。Solo 切换 Bench 后，`small` 不存在，自动变为第一个 `universal`；切换到同样有 `small` 的 Utility 则保留尺寸。

`watch(frame)` 非 deep；原地修改当前车架的 `sizes` 数组不保证触发尺寸协调。接入时优先替换车架对象，避免无效尺寸残留；即便残留，`build` 缺少 size 时仍会禁用保存。

`change` 深度监听配置并清除旧反馈，不是 `v-model`。它不保证在首次挂载时通知初始完整配置。

## 事件到模板链

<!-- source: src/library/also/ModularBikeConfigurator.vue#L45-L50 -->
```ts
function select(value: string) {
  if (props.disabled || pending.value || options.value.find(item => item.id === value)?.available === false) return
  if (step.value === 0) frameId.value = value
  else if (step.value === 1) packageId.value = value
  else cockpitId.value = value
}
```

原生 radio 的 `change` 调用 `select(option.id)`。当前步骤决定写入哪个 ID，`displayed` 决定左侧 `<img :src>`，`current` 决定 radio checked、绿色背景和勾选图标。

选项 radio 使用 `useId()` 加步骤数字组成独立 `name`，浏览器负责同组键盘方向键和单选行为。尺寸是原生 select，直接用 `v-model="sizeId"`。

Continue 按钮在校验通过时执行 `step++`；顶部三步按钮可以直接跳转，不强制线性完成。最后仍通过完整 available 检查，不能因此提交缺失模块。

步骤变化没有自动聚焦标题。图像没有拖拽事件，所有选择都通过 radio、select 和 button；鼠标样式来自 CSS pointer/disabled default。

## 保存快照与异步状态机

<!-- source: src/library/also/ModularBikeConfigurator.vue#L51-L58 -->
```ts
async function save() {
  if (!available.value || !build.value || pending.value || props.disabled) return
  const value = structuredClone({ frame: { ...build.value.frame, sizes: build.value.frame.sizes.map(item => ({ ...item })) }, size: { ...build.value.size }, ridePackage: { ...build.value.ridePackage }, cockpit: { ...build.value.cockpit }, total: build.value.total })
  pending.value = true; failed.value = false; status.value = ''; emit('save', value)
  try { await props.saveBuild?.(value); status.value = props.saveBuild ? 'Your build is saved.' : 'Your build is ready.'; emit('success', value) }
  catch(cause) { failed.value = true; status.value = cause instanceof Error ? cause.message : 'Unable to save your build. Please try again.' }
  finally { pending.value = false }
}
```

先将响应式对象展开成普通对象，包括 frame 的 sizes，再 `structuredClone`，使请求快照与后续 UI 选择解耦。

| 输出 | payload | 含义 |
| --- | --- | --- |
| `change` | `BikeBuild \| null` | 当前派生配置变化 |
| `save` | `BikeBuild` | 合法配置开始保存前通知 |
| `success` | `BikeBuild` | 可选服务 resolve 后通知 |
| `saveBuild` | `BikeBuild` | 实际被等待的 Promise 回调 |

`BikeBuild` 由 `frame`、`size`、`ridePackage`、`cockpit`、`total` 组成。`@save` 返回的 Promise 不参与等待，实际网络请求应通过 `:save-build` 接入。

没有回调时提示 `Your build is ready.`；有回调成功后提示已保存。失败保留配置，`failed=true` 让反馈成为 alert；finally 解除 pending 后允许重试。

## 完整接入示例

示例放在 `src/examples/BuildExample.vue`。服务端应根据 ID 重新校验兼容性、库存和金额。

<!-- example -->
```vue
<script setup lang="ts">
import { ref } from 'vue'
import ModularBikeConfigurator, { type BikeBuild } from '../library/also/ModularBikeConfigurator.vue'

const saved = ref<BikeBuild | null>(null)
async function saveBuild(build: BikeBuild): Promise<void> {
  const response = await fetch('/api/bike-builds', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      frameId: build.frame.id,
      sizeId: build.size.id,
      packageId: build.ridePackage.id,
      cockpitId: build.cockpit.id,
    }),
  })
  if (!response.ok) throw new Error('配置保存失败，请重试。')
}
</script>

<template>
  <ModularBikeConfigurator
    :base-price="3500"
    initial-frame="solo"
    :save-build="saveBuild"
    @success="saved = $event"
  />
  <output v-if="saved">{{ saved.frame.label }} / {{ saved.size.label }}</output>
</template>
```

## 验证与当前限制

测试完整经过 Bench、All Terrain、Sport、汇总和保存，断言 Universal 尺寸、3750 金额和快照字段。另覆盖失败重试、成功通知和清空 frames 后阻止保存。

当前只检查模块是否存在且 available，不实现跨模块兼容性规则、颜色组合、配送或税费。外部更改 props 仍可发生于 pending 期间，但当前请求使用已复制快照。

组件没有请求取消和超时；卸载不会中断宿主 Promise。金额没有整数分币策略，自定义小数加价需由业务统一处理。保存依赖浏览器的 `structuredClone` 能力。
