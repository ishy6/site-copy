# Shop 商品筛选：原生表单、价格归一化与应用载荷

组件 ID：`shop-product-filters`。入口 [ShopProductFilters.vue](../src/library/shop/ShopProductFilters.vue#L1)。它负责收集排序、价格范围、多选颜色和两个布尔条件；商品查询、排序结果和结果总数由宿主计算。

价格滑动使用原生 `input type="range"`，不是 HTML Drag and Drop 的 drag 事件，也没有 pointer capture。滑块从浏览器 input 事件读取 Vue v-model 更新后的 maximum，再进入统一的 normalize / emit 流程。

## 筛选对象与 Props

<!-- source: src/library/shop/ShopProductFilters.vue#L4-L6 -->
```ts
export interface ShopFilters { sort: string; minimum: number; maximum: number; colors: string[]; inStock: boolean; onSale: boolean }
const props = withDefaults(defineProps<{ priceLimit?: number; initialSection?: string; resultCount?: number; modelValue?: Partial<ShopFilters>; colors?: { name: string; color: string }[] }>(), { priceLimit: 2000, initialSection: 'price', resultCount: 128, modelValue: () => ({}), colors: () => [{ name: 'Black', color: '#191919' }, { name: 'White', color: '#fff' }, { name: 'Blue', color: '#7e9caf' }, { name: 'Green', color: '#829376' }, { name: 'Red', color: '#ba544b' }] })
const emit = defineEmits<{ 'update:modelValue': [filters: ShopFilters]; apply: [filters: ShopFilters] }>()
```

| 参数 | 类型 | 默认值 | 具体作用 |
| --- | --- | --- | --- |
| `priceLimit` | `number` | `2000` | range 和输入框的价格上限 |
| `initialSection` | `string` | `price` | 展开的 price / colors 组；空串全部关闭 |
| `resultCount` | `number` | `128` | 应用按钮的 Show N results 文案 |
| `modelValue` | `Partial<ShopFilters>` | `{}` | 初始或外部筛选条件，缺省字段补默认值 |
| `colors` | `{ name:string; color:string }[]` | 黑、白、蓝、绿、红 | 复选框值使用 name，色板背景使用 color |

完整默认筛选对象为 `sort='Relevance'`、minimum=0、maximum=当前 limit、colors=[]、inStock=false、onSale=false。排序选项写在模板中，固定四种英文值；当前没有自定义排序选项 prop。

`update:modelValue` 和 `apply` 都传完整 ShopFilters，不是只传发生变化的字段。两个事件均复制对象和 colors 数组，宿主收到的是本次快照。

没有 reset 事件。两个 Reset 按钮都通过重置后发送 `update:modelValue` 通知宿主；它们不会触发 apply。要把重置立即同步到商品列表，需要宿主监听更新或在业务外层提供明确的应用策略。

## 内部状态与同步

<!-- source: src/library/shop/ShopProductFilters.vue#L7-L17 -->
```ts
const id = useId()
const limit = computed(() => Math.max(1, Number(props.priceLimit) || 1))
const defaults = (): ShopFilters => ({ sort: 'Relevance', minimum: 0, maximum: limit.value, colors: [], inStock: false, onSale: false })
const filters = ref<ShopFilters>({ ...defaults(), ...props.modelValue })
const section = ref(props.initialSection)
const applied = ref(false)
function normalize() { filters.value.minimum = Math.max(0, Math.min(limit.value, Number(filters.value.minimum) || 0)); filters.value.maximum = Math.max(filters.value.minimum, Math.min(limit.value, Number(filters.value.maximum) || 0)) }
normalize()
watch(() => props.modelValue, value => { filters.value = { ...defaults(), ...value, colors: [...(value.colors ?? [])] }; normalize() }, { deep: true })
watch(() => props.priceLimit, normalize)
watch(() => props.initialSection, value => { section.value = value })
```

`filters` 是可编辑草稿，`section` 是当前展开的单个分组，`applied` 控制按钮是否显示 Applied / Check。`id` 连接分组按钮的 aria-controls 与内容 ID。

modelValue 使用 deep watch：父组件改变嵌套 colors 或某个条件时会重新合并默认值，再复制数组并规范化价格。这个同步过程不 emit；因此程序侧赋值不会自动产生一次用户 apply。

priceLimit 变化仅调用 normalize，不 emit，也不清 applied。initialSection 变化只改变展开组。需要应用结果与所有程序侧变化同步时，不能仅依赖组件的 applied 提示。

## 价格约束的精确算法

给定上限 L、输入最小值 a、最大值 b：

1. `L = max(1, Number(priceLimit) || 1)`。
2. `minimum = max(0, min(L, Number(a) || 0))`。
3. `maximum = max(minimum, min(L, Number(b) || 0))`。

最大价永远在最小价之后校正。例：L=100，minimum=-5、maximum=500，得到 0 / 100；之后把 minimum 改为 75、maximum 改为 30，结果是 75 / 75，而不是把 minimum 降成 30。

normalize 不四舍五入，number 输入也未声明 step，因此程序传入小数可以保留。range 的 step=1 只约束原生滑块交互，不代表所有路径都是整数。

priceLimit 未做 Number.isFinite 检查，Infinity 仍能进入 limit；生产配置应传有限正数。colors 是否属于可见色板、sort 是否属于四个选项，也没有自动清洗。

## 不同控件进入同一更新出口

<!-- source: src/library/shop/ShopProductFilters.vue#L18-L21 -->
```ts
function update() { normalize(); applied.value = false; emit('update:modelValue', { ...filters.value, colors: [...filters.value.colors] }) }
function reset() { filters.value = defaults(); update() }
function apply() { update(); applied.value = true; emit('apply', { ...filters.value, colors: [...filters.value.colors] }) }
function toggleSection(name: string) { section.value = section.value === name ? '' : name }
```

| 控件 | 原生事件 | 状态写入 | 后续动作 |
| --- | --- | --- | --- |
| 排序 select | `change` | `filters.sort` | update |
| 最大价 range | `input` | `filters.maximum`，v-model.number | update |
| 最小 / 最大数字框 | `change` | 对应数值，v-model.number | update |
| 颜色 checkbox | `change` | colors 数组成员 | update |
| In stock / On sale | `change` | 对应 boolean | update |
| 分组标题 button | `click` | section 字符串 | 不 emit 筛选 |
| Reset | `click` | defaults 整体替换 | update |
| form 提交 | `submit.prevent` | applied=true | 先 update，再 apply 事件 |

滑块移动会每次 input 都 emit，不带 debounce。数字框的模型随输入变化，但统一更新出口绑在 change，通常在输入确认或失焦时执行；不要把两种控件都描述为同频率的远端请求。

apply 首先调用 update，所以宿主先收到一份 model 更新，再收到一份 apply；两次的筛选数据内容相同。`applied=true` 仅表示用户执行过应用动作，不表示宿主商品查询成功。

## CSS、鼠标与键盘

原生 range 使用 `accent-color:#5433eb` 和 `cursor:pointer`。没有拖拽过程中的 grabbing / grab 切换；滑动算法、触摸命中与左右键步进均由浏览器实现。

颜色选项保留原生 checkbox，但 `position:absolute;opacity:0`。`:checked + .swatch` 显示紫色 outline，Check 图标的显示来自 `filters.colors.includes(name)`；`:focus-visible + .swatch` 同时确保键盘聚焦可见。

快速条件仍是原生 checkbox，加 `role="switch"`。CSS `appearance:none` 绘制背景和伪元素滑块：未选中小圆 left=3px，选中 left=14px，底色从灰色切到紫色。这里没有 JS 动画和定时器。

分组按钮用 aria-expanded 的值直接控制箭头 transform。内容通过 v-if 创建 / 销毁，关闭时其表单控件不会继续出现在 Tab 顺序中。

操作按钮不抢焦点。表单的 `@submit.prevent` 避免页面刷新，但没有 novalidate；浏览器仍可能对数字控件执行原生约束验证。业务不应依赖程序触发测试绕过的浏览器行为。

## 完整接入示例

示例放在 `src/examples/FiltersExample.vue`，使用本地商品集合实现真实条件过滤，并在 apply 时保存已应用条件。draft 变化只更新预估数量，避免把用户编辑与正式应用混为一谈。

<!-- example -->
```vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import ShopProductFilters, { type ShopFilters } from '../library/shop/ShopProductFilters.vue'

const products = [
  { id: 'lamp', name: 'Lamp', price: 80, color: 'Black', inStock: true, onSale: false, rating: 4.8 },
  { id: 'chair', name: 'Chair', price: 150, color: 'Blue', inStock: false, onSale: true, rating: 4.2 },
]
const draft = ref<ShopFilters>({ sort: 'Relevance', minimum: 0, maximum: 200, colors: [], inStock: false, onSale: false })
const applied = ref<ShopFilters>({ ...draft.value, colors: [] })
function filter(value: ShopFilters) {
  const result = products.filter(item =>
    item.price >= value.minimum && item.price <= value.maximum &&
    (!value.colors.length || value.colors.includes(item.color)) &&
    (!value.inStock || item.inStock) && (!value.onSale || item.onSale),
  )
  if (value.sort === 'Price: low to high') result.sort((a, b) => a.price - b.price)
  if (value.sort === 'Price: high to low') result.sort((a, b) => b.price - a.price)
  if (value.sort === 'Top rated') result.sort((a, b) => b.rating - a.rating)
  return result
}
const resultCount = computed(() => filter(draft.value).length)
const results = computed(() => filter(applied.value))
function apply(value: ShopFilters) {
  applied.value = value
}
</script>

<template>
  <ShopProductFilters
    v-model="draft"
    :price-limit="200"
    :result-count="resultCount"
    @apply="apply"
  />
  <ul><li v-for="item in results" :key="item.id">{{ item.name }} ${{ item.price }}</li></ul>
</template>
```

## 验证与限制

[shop-core.test.ts](../src/library/shop/shop-core.test.ts#L53) 覆盖初值 -5 / 500 被限为 0 / 100，输入 75 / 30 后 apply 返回完整的 75 / 75 对象，以及 Reset 恢复最高价 100。

当前未逐项自动化验证颜色多选、原生 range 键盘步进、四种排序选项或宿主异步结果。`resultCount` 没有内置查询，不会自动随着 filters 变更而改变。

组件没有网络请求、loading、请求取消或重试。若筛选需要请求接口，宿主应决定 input 更新时预取还是 apply 时请求，并管理请求竞争与服务端返回的数量。

导出只需本 SFC、Shop 字体和 lucide 图标。没有需要清理的全局监听或计时器。
