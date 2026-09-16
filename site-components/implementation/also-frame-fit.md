# Frame Fit Guide：单位换算与尺寸区间推荐

组件 ID：`also-frame-fit`。

组件根据所选车架和真实身高查找适合的尺寸，支持厘米/英寸显示、滑杆输入、区间高亮、重叠区间优先小号和越界提示。

## 源码与原始单位

- [FrameFitGuide.vue](../src/library/also/FrameFitGuide.vue#L1)：输入、单位和显示。
- [frame-data.ts](../src/library/also/frame-data.ts#L1)：原始英寸范围及 `matchingSizes()`。
- [core.spec.ts](../src/library/also/core.spec.ts#L49)：边界匹配、重叠范围、单位切换与越界测试。

区间来自原站车架尺寸表，以英寸保存。Solo / Utility 的 Small 是 59–68 英寸，Large 是 65–80 英寸；Bench 为 59–80 英寸的 Universal。

显示厘米时根据英寸值换算，不通过四舍五入后的界面字符串再反推原始范围。

## Props 和输出

| 参数 | 类型 | 默认值 | 用途 |
| --- | --- | --- | --- |
| `title` | `string` | `Find your fit.` | 标题 |
| `frames` | `BikeFrame[]` | `bikeFrames` | 车架、尺寸、图片、承重 |
| `initialFrame` | `string` | `solo` | 选择 ID，无匹配时展示第一项 |
| `initialHeight` | `number` | `170` | 初始真实身高，单位始终为厘米 |
| `showLoad` | `boolean` | `true` | 展示 `loadLbs` 与可选 `cargoLbs` |

`initialHeight` 和 `initialFrame` 后续变化会写入内部 ref。它们不是单纯挂载参数，也不是双向绑定；组件没有 `update:*` 输出。

| 事件 | payload | 时机 |
| --- | --- | --- |
| `change` | `{ frameId: string; heightCm: number; sizeIds: string[] }` | 当前车架或身高使派生结果变化 |
| `select` | `{ frameId: string; sizeId: string; heightCm: number }` | 用户点击推荐尺寸按钮 |

初始化不会主动发出 change。`sizeIds` 可以为空或包含多个尺寸，`select` 则只交付第一个匹配尺寸。

## 单一内部身高与显示转换

<!-- source: src/library/also/FrameFitGuide.vue#L8-L18 -->
```ts
const selectedId = ref(props.initialFrame)
const heightCm = ref(props.initialHeight)
const units = ref<'cm' | 'in'>('cm')
const frame = computed(() => props.frames.find(item => item.id === selectedId.value) ?? props.frames[0])
const matches = computed(() => matchingSizes(frame.value, heightCm.value / 2.54))
const displayedHeight = computed(() => Math.round((units.value === 'cm' ? heightCm.value : heightCm.value / 2.54) * 10) / 10)
const min = computed(() => units.value === 'cm' ? 120 : 47)
const max = computed(() => units.value === 'cm' ? 220 : 87)
watch(() => props.initialHeight, value => { heightCm.value = value })
watch(() => props.initialFrame, value => { selectedId.value = value })
watch(() => [frame.value?.id, heightCm.value, matches.value.map(size => size.id)] as const, () => { emit('change', { frameId: frame.value?.id ?? '', heightCm: heightCm.value, sizeIds: matches.value.map(size => size.id) }) })
```

身高始终以 `heightCm` 保存。点击 cm/in 只改变 `units`，`displayedHeight` 据此换算并保留一位小数，真实数值不会因多次切换单位累计舍入误差。

匹配前使用 `heightCm / 2.54` 转换为英寸。170cm 约为 66.929in，会同时命中 Small 和 Large；默认排序让 Small 成为推荐项。

厘米输入边界为 120–220，英寸边界为 47–87，两组边界不是完全等价的精确换算。界面会按当前单位的边界夹取用户输入。

`initialHeight` 直接赋值，未经过输入夹取；宿主传入超界或非有限数时可能显示越界或无匹配结果，不能依赖原生 input 的 min/max 校验 props。

## 数字输入和滑杆的事件差异

<!-- source: src/library/also/FrameFitGuide.vue#L19-L22 -->
```ts
function changeHeight(event: Event) { const input = event.target as HTMLInputElement; const value = Number(input.value); if (!Number.isFinite(value) || !input.value) { input.value = String(displayedHeight.value); return }; heightCm.value = Math.min(max.value, Math.max(min.value, value)) * (units.value === 'cm' ? 1 : 2.54); input.value = String(displayedHeight.value) }
const inches = (value: number) => `${Math.floor(value / 12)}'${value % 12}"`
const range = (minimum: number, maximum: number) => units.value === 'cm' ? `${Math.round(minimum * 254) / 100}-${Math.round(maximum * 254) / 100} cm` : `${inches(minimum)}-${inches(maximum)}`
function select() { if (frame.value && matches.value[0]) emit('select', { frameId: frame.value.id, sizeId: matches.value[0].id, heightCm: heightCm.value }) }
```

数字框绑定 `@change`，在确认修改/离开输入等原生变更时处理；范围滑杆绑定 `@input`，拖动过程中连续更新。两者复用同一个归一化函数。

处理链为：读取 input.value → Number 转换 → 空值/非有限值恢复旧显示 → 按当前单位 min/max 夹取 → 转换到厘米 → 回写 input 的显示数值。

滑杆由浏览器实现拖动和键盘步进。组件没有原生 HTML `drag`、Pointer Events 或手动计算鼠标坐标，也没有切换 `grab/grabbing` 光标。

<!-- source: src/library/also/FrameFitGuide.vue#L29-L30 -->
```vue
    <div class="also-fit__height"><label :for="`${id}-height`">Your height</label><div class="also-fit__units" role="group" aria-label="Height unit"><button type="button" :aria-pressed="units === 'cm'" @click="units = 'cm'">cm</button><button type="button" :aria-pressed="units === 'in'" @click="units = 'in'">in</button></div><input :id="`${id}-height`" :value="displayedHeight" type="number" :min="min" :max="max" step="0.1" @change="changeHeight" /></div>
    <input class="also-fit__range" type="range" :value="displayedHeight" :min="min" :max="max" step="0.1" aria-label="Rider height" @input="changeHeight" />
```

## 匹配算法与推荐顺序

<!-- source: src/library/also/frame-data.ts#L13-L16 -->
```ts
export function matchingSizes(frame: BikeFrame | undefined, heightInches: number): FrameSize[] {
  if (!Number.isFinite(heightInches)) return []
  return frame?.sizes.filter(size => heightInches >= size.minInches && heightInches <= size.maxInches) ?? []
}
```

两个比较都是包含端点的 `>=`、`<=`。59in 命中 Small，65–68in 同时命中 Small/Large，80in 命中 Large，81in 不匹配默认车架。

算法保留 `sizes` 原始顺序，没有根据 label 或最小高度重新排序。若宿主自定义数据把 Large 放在 Small 前面，“第一个推荐项”也会改变；应在数据中保持希望的推荐优先级。

匹配的表格行增加 `matching` class，CSS 赋予浅绿色背景；同一 matches 数组决定勾选图标、推荐文本以及是否显示 Select 按钮。

没有匹配时隐藏选择按钮并显示 `Outside the listed size ranges`。多个匹配时补充缩小尺寸建议；它是范围规则，不是个体骑行姿态测量模型。

## 语义与样式

车架 select 和身高输入都有通过 `useId()` 关联的 label。单位使用原生按钮和 `aria-pressed`；滑杆有 `aria-label`；结果区使用 `role="status"`。

尺寸表采用 table、列/行 th 和 scope，适配辅助技术按行列读取。图片使用固定 90×80 容器和 object-fit contain，改变车架不会跳动布局。

滑杆用 `accent-color`，按钮用 CSS pointer，焦点统一 `:focus-visible`；没有 JS 改写 cursor。承重始终以 lbs 展示，不随 cm/in 身高单位切换。

组件没有计时器、监听 window 事件或网络请求，不需要额外卸载清理。

## 完整接入示例

放在 `src/examples/FitExample.vue`，事件仅记录选型，是否加入后续整车配置由宿主决定。

<!-- example -->
```vue
<script setup lang="ts">
import { ref } from 'vue'
import FrameFitGuide from '../library/also/FrameFitGuide.vue'
import { bikeFrames } from '../library/also/frame-data'

type FitSelection = { frameId: string; sizeId: string; heightCm: number }
const selected = ref<FitSelection | null>(null)
</script>

<template>
  <FrameFitGuide
    :frames="bikeFrames"
    initial-frame="solo"
    :initial-height="170"
    :show-load="true"
    @select="selected = $event"
  />
  <output v-if="selected">
    {{ selected.frameId }} / {{ selected.sizeId }} / {{ selected.heightCm }}cm
  </output>
</template>
```

## 已验证与限制

测试覆盖包含端点的原始英寸范围、重叠区间、越界、Bench Universal、单位切换保持真实身高和越界后隐藏选择按钮。

没有使用浏览器实时测量人体尺寸；`available` 不参与尺寸推荐算法。即使车架被标记缺货，尺寸工具仍可给出匹配结果，库存判断应交由购买/配置流程。

空 frames 时不渲染车架图片、没有尺寸行和推荐按钮。组件没有远程请求、异步加载或错误重试，因为数据完全由 props 提供。

输入只包含身高，不收集内腿长、臂展或骑姿偏好；不要把区间高亮解释为完整人体工学测量。承重展示也没有与骑手体重做校验。

表格列出的尺寸来自当前车架，切换车架会整体更新行集合；用户选择的是推荐结果中的第一个尺寸，当前没有点选任意表格行的事件。
