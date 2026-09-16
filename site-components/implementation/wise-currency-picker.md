# Wise 币种选择器：搜索、活动项与选择值

组件 ID：`wise-currency-picker`。入口 [WiseCurrencyPicker.vue](../src/library/wise/WiseCurrencyPicker.vue#L1) 与数据 [wiseCurrencies.ts](../src/library/wise/wiseCurrencies.ts#L1) 必须一并保留。

这是弹层内的可独立复用内容区。它有搜索、热门优先排序、键盘定位和选择事件；组件本身没有 dialog、打开 / 关闭状态或选择后自动隐藏动作。宿主决定它出现在哪里以及何时关闭。

## 参数和事件

| 参数 | 类型 | 默认值 | 约束与用途 |
| --- | --- | --- | --- |
| `modelValue` | `string` | `GBP` | 当前币种 code，支持 `v-model` |
| `title` | `string` | `Choose a currency` | h3 内容和 section 的 aria-label |
| `options` | `CurrencyOption[]` | 六项本地数据 | code 应唯一，flag 应可访问 |
| `showPopular` | `boolean` | `true` | 热门项移到前方，并显示分组标题 |

<!-- source: src/library/wise/wiseCurrencies.ts#L1-L9 -->
```ts
export interface CurrencyOption { code: string; name: string; flag: string; popular?: boolean }
export const currencyOptions: CurrencyOption[] = [
  { code: 'EUR', name: 'Euro', flag: '/assets/wise/eur.svg', popular: true },
  { code: 'USD', name: 'US dollar', flag: '/assets/wise/usd.svg', popular: true },
  { code: 'GBP', name: 'British pound', flag: '/assets/wise/gbp.svg', popular: true },
  { code: 'CAD', name: 'Canadian dollar', flag: '/assets/wise/cad.svg' },
  { code: 'HKD', name: 'Hong Kong dollar', flag: '/assets/wise/hkd.svg' },
  { code: 'INR', name: 'Indian rupee', flag: '/assets/wise/inr.svg' },
]
```

选择项时依次发出 `update:modelValue(code: string)` 和 `select(currency: CurrencyOption)`。第二个事件直接携带传入数组中的项，没有深拷贝；宿主不应为了临时 UI 状态修改该对象。

`modelValue` 找不到匹配 code 时列表不会自动选中第一项，也不会自动 emit 校正值。这与当前键盘“活动项默认第一项”是两个不同概念。

## 状态关系

| 状态 | 初始值 | 修改来源 |
| --- | --- | --- |
| `query` | 空字符串 | 搜索框、清除按钮、Escape |
| `selected` | `modelValue` | choose、外部 modelValue 更新 |
| `activeIndex` | `0` | 方向键、Home / End、鼠标进入项目、搜索变化 |
| `searchInput` | input ref | 清除按钮后恢复搜索框焦点 |
| `listId` | `useId()` | 连接 combobox、listbox、活动选项 |

`selected` 是已确认的币种，`activeIndex` 只是当前 Enter 会选择的候选项。方向键不会 emit，也不修改已确认的勾选标志。鼠标悬停同样只改变活动项背景。

<!-- source: src/library/wise/WiseCurrencyPicker.vue#L12-L17 -->
```ts
const filtered = computed(() => props.options.filter(item => `${item.code} ${item.name}`.toLowerCase().includes(query.value.trim().toLowerCase())))
const ordered = computed(() => props.showPopular ? [...filtered.value.filter(item => item.popular), ...filtered.value.filter(item => !item.popular)] : filtered.value)
watch(() => props.modelValue, value => { selected.value = value })
watch(query, () => { activeIndex.value = 0 })
watch(ordered, values => { activeIndex.value = Math.min(activeIndex.value, Math.max(0, values.length - 1)) })
function choose(item: CurrencyOption) { selected.value = item.code; emit('update:modelValue', item.code); emit('select', item) }
```

过滤对 `code + 空格 + name` 做不区分大小写的 includes，并先 trim 查询。它不是模糊搜索、拼音搜索或远端请求。输入“dollar”会得到 USD、CAD、HKD；默认数据没有额外 country 字段，搜索占位文案中的 country 不表示对国家名建立了索引。

`ordered` 通过两个 filter 稳定拼接热门与其他项目，未原地排序 `props.options`。当 query 改变时活动项归零；当 options 或排序改变导致列表变短时，watch 将索引夹在仍有效的范围。

## 键盘事件的具体顺序

<!-- source: src/library/wise/WiseCurrencyPicker.vue#L18-L27 -->
```ts
function keydown(event: KeyboardEvent) {
  if (event.key === 'Escape') { query.value = ''; return }
  const length = ordered.value.length
  if (!length) return
  if (event.key === 'Enter') { event.preventDefault(); const item = ordered.value[activeIndex.value]; if (item) choose(item); return }
  const index = event.key === 'ArrowDown' ? (activeIndex.value + 1) % length : event.key === 'ArrowUp' ? (activeIndex.value - 1 + length) % length : event.key === 'Home' ? 0 : event.key === 'End' ? length - 1 : -1
  if (index < 0) return
  event.preventDefault(); activeIndex.value = index
  document.getElementById(`${listId}-${index}`)?.scrollIntoView?.({ block: 'nearest' })
}
```

1. Escape 先清空 query，并直接 return；它不关闭选择器、不调用 preventDefault，也不停止冒泡。宿主弹层仍可能继续收到 Escape。
2. 空列表直接退出，Enter 不会访问不存在的候选项。
3. Enter 阻止表单默认提交，调用 `choose`，让勾选状态和两个事件一起更新。
4. ArrowDown / ArrowUp 通过模运算循环；从最后一项向下会回到第一项。
5. Home / End 定位首尾，并阻止浏览器默认光标移动。
6. 修改活动索引后，通过项 ID 执行 `scrollIntoView({ block:'nearest' })`，只滚动必要距离。

DOM 焦点仍保留在搜索框，输入框的 `aria-activedescendant` 指向当前候选按钮；代码没有对每次方向键移动调用 `.focus()`。清除按钮则显式执行 `searchInput?.focus()`。

## 选中反馈与滚动边界

每项使用原生 button 加 `role="option"`，`aria-selected` 来自 selected。鼠标进入时设置 `activeIndex=index`；点击时执行 choose。`.active` / `:hover` 使用浅灰底，`.selected` 使用浅绿底，选中项追加 Check 图标。

按钮当前没有设置 `tabindex=-1`，因此除了搜索框的 combobox 操作外，Tab 也能依次进入各个选项；方向键处理器只绑在搜索框上，不会从选项按钮转成统一 roving tabindex。这是当前代码的实际键盘范围。

列表最大高度 260px，`overflow:auto` 产生局部滚动；`overscroll-behavior:contain` 限制滚动链。长币种名使用 `overflow-wrap:anywhere`，国旗固定 32px，避免动态文字挤坏图标。

空列表显示 `role="status"` 的 `No currencies found`。搜索框仍可输入或按 Escape 恢复，不会被禁用。清除按钮仅在 query 非空时创建。

鼠标样式是按钮的静态 `cursor:pointer`，并未监听原生 `dragstart` / `dragend`，也没有 pointer capture。列表滚动和触摸惯性由浏览器原生滚动处理。

## 完整接入示例

放在 `src/examples/CurrencyPickerExample.vue`。下面的父组件在选择后隐藏内容，并保存完整币种项；这项隐藏逻辑由示例实现，不是选择器内置行为。

<!-- example -->
```vue
<script setup lang="ts">
import { ref } from 'vue'
import WiseCurrencyPicker from '../library/wise/WiseCurrencyPicker.vue'
import { currencyOptions, type CurrencyOption } from '../library/wise/wiseCurrencies'

const currency = ref('GBP')
const open = ref(true)
const chosen = ref<CurrencyOption | null>(null)
function select(option: CurrencyOption) {
  chosen.value = option
  open.value = false
}
</script>

<template>
  <button type="button" :aria-expanded="open" @click="open = !open">
    {{ currency }}
  </button>
  <WiseCurrencyPicker
    v-if="open"
    v-model="currency"
    :options="currencyOptions"
    :show-popular="true"
    title="Choose a currency"
    @select="select"
  />
  <output v-if="chosen">{{ chosen.name }}</output>
</template>
```

## 验证和限制

[wise-core.test.ts](../src/library/wise/wise-core.test.ts#L19) 的现有用例输入 dollar，断言三项结果，ArrowDown + Enter 选择 CAD，验证选中语义与 `update:modelValue`，再验证无结果状态及 Escape 恢复六项。

这段断言把候选活动索引与已选 code 关联起来；若只改变背景却没有调用 choose，事件和 aria-selected 检查都会失败：

<!-- source: src/library/wise/wise-core.test.ts#L22-L31 -->
```ts
    await input.setValue('dollar')
    expect(wrapper.findAll('[role="option"]')).toHaveLength(3)
    await input.trigger('keydown', { key: 'ArrowDown' })
    await input.trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['CAD'])
    expect(wrapper.get('[aria-selected="true"]').text()).toContain('Canadian dollar')
    await input.setValue('not-a-currency')
    expect(wrapper.find('[role="status"]').text()).toBe('No currencies found')
    await input.trigger('keydown', { key: 'Escape' })
    expect(wrapper.findAll('[role="option"]')).toHaveLength(6)
```

当前用例没有覆盖 Home / End、ArrowUp 首项循环、options 动态减少时的滚动定位，以及真实屏幕阅读器对 button + option 的解释。源码支持的行为与自动化已断言的行为应分开理解。

没有异步请求、缓存、搜索去抖或虚拟列表。options 很大时每次输入会进行过滤和两次分组过滤，DOM 也渲染全部匹配项；上千项数据应由宿主限制集合或另行加入虚拟化。

组件不分配 Object URL，也不注册全局监听，卸载时无需手工释放资源。图标来自 `lucide-vue-next`；导出后还需保留本地字体和实际 options 使用的国旗资产。
