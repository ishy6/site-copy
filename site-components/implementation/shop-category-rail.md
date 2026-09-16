# Shop 分类浏览器：标签焦点、循环分组与带上下文选择

组件 ID：`shop-category-rail`。入口 [ShopCategoryRail.vue](../src/library/shop/ShopCategoryRail.vue#L1)，数据类型与默认分类 [shopCategories.ts](../src/library/shop/shopCategories.ts#L1)。

组件用标签切换分类组，并从当前组选择一个具体分类。图片是分类按钮的视觉内容；有效行为是组切换、键盘焦点与 `select(item, group)` 事件，不只是图片展示。

## 数据结构和接口

<!-- source: src/library/shop/shopCategories.ts#L1-L9 -->
```ts
export interface ShopCategoryItem {
  name: string
  image: string
}

export interface ShopCategoryGroup {
  name: string
  items: ShopCategoryItem[]
}
```

| 参数 | 类型 | 默认值 | 使用方式 |
| --- | --- | --- | --- |
| `activeCategory` | `string` | `Women` | 当前组名称；变化时同步并清选择 |
| `title` | `string` | `Explore categories` | 主标题和区域 aria-label |
| `showNavigation` | `boolean` | `true` | 多于一组时显示上一组 / 下一组按钮 |
| `groups` | `ShopCategoryGroup[]` | Women / Home 两组 | 每组有 name 与任意数量 items |

组名称应唯一，同组 item.name 也应唯一。名称同时是查找条件、v-for key、选中标识和事件上下文，没有额外的 ID 字段。

事件 `update:activeCategory(category:string)` 用于双向绑定组名称；事件 `select(item:ShopCategoryItem, group:string)` 包含两个位置参数，而不是一个嵌套对象。

select 直接传当前数据对象，不复制 item。宿主通常记录名称或稳定业务映射，不应修改 item.image 来表达“已选择”。组件内部有独立 selected 字符串负责反馈。

## 当前组与选择状态

<!-- source: src/library/shop/ShopCategoryRail.vue#L18-L26 -->
```ts
const emit = defineEmits<{ 'update:activeCategory': [category: string]; select: [item: ShopCategoryItem, group: string] }>()
const baseId = useId()
const currentName = ref(props.activeCategory)
const selected = ref('')
const currentIndex = computed(() => Math.max(0, props.groups.findIndex((group) => group.name === currentName.value)))
const current = computed(() => props.groups[currentIndex.value])
const tabButtons = ref<HTMLButtonElement[]>([])

watch(() => props.activeCategory, (value) => { currentName.value = value; selected.value = '' })
```

currentName 是组名，selected 是当前组的分类名，不能共用一个变量。组名无效时 findIndex=-1，Math.max 使索引退回 0；computed current 因而读取第一组。

后备选择不会主动 emit 或改写 currentName。groups 为空时索引仍为 0，但 current 为 undefined，模板显示空状态而非访问不存在的 items。

仅 activeCategory prop 有 watcher。groups 动态变化本身不会清 selected；如果数据替换导致旧选择不再存在，底部 selected 文案仍可能保留。动态目录应在宿主更新 activeCategory 或重置组件身份来明确选择归属。

## 统一切换函数

<!-- source: src/library/shop/ShopCategoryRail.vue#L28-L40 -->
```ts
function activate(index: number, focus = false) {
  const group = props.groups[index]
  if (!group) return
  currentName.value = group.name
  selected.value = ''
  emit('update:activeCategory', group.name)
  if (focus) tabButtons.value[index]?.focus()
}

function move(direction: number) {
  if (!props.groups.length) return
  activate((currentIndex.value + direction + props.groups.length) % props.groups.length)
}
```

activate 先验证索引，再设置当前组、清空 item 选择、emit 新组名称，最后按参数决定是否转移焦点。鼠标点击标签调用 activate(index)，键盘切换调用 activate(index,true)。

点击已经激活的标签也会清空当前分类选择并 emit 同一组名，没有“同组则 return”的短路。这个行为在业务保存选择时需要理解。

move 使用模运算实现首尾循环，左右按钮只传 -1 和 1。它不要求 focus=true，因此点击右上角按钮后焦点仍停在按钮，不会跳到标签。

导航按钮只有 `showNavigation && groups.length > 1` 才显示。一组数据仍保留标签和分类项，只不显示多余的上一组 / 下一组控件。

## roving tabindex 的键盘实现

<!-- source: src/library/shop/ShopCategoryRail.vue#L42-L49 -->
```ts
function onTabKeydown(event: KeyboardEvent) {
  const count = props.groups.length
  if (!count) return
  const next = event.key === 'ArrowRight' ? (currentIndex.value + 1) % count
    : event.key === 'ArrowLeft' ? (currentIndex.value - 1 + count) % count
      : event.key === 'Home' ? 0 : event.key === 'End' ? count - 1 : -1
  if (next >= 0) { event.preventDefault(); activate(next, true) }
}
```

键盘处理器绑定在 tablist，接收子按钮冒泡的 keydown。ArrowRight / ArrowLeft 循环切换，Home / End 跳到两端。只有识别出的键才 preventDefault，防止横向按键滚动页面。

每个 tab 的 tabindex 由 `index === currentIndex ? 0 : -1` 决定，所以 Tab 顺序中只有当前标签；activate(...,true) 则显式调用目标按钮 focus。这里使用真实焦点移动，而不是 combobox 的 aria-activedescendant。

tab 的 ID 由 useId 与 index 组成，aria-controls 指向公共 panel；panel 的 aria-labelledby 指回当前 tab。切换时只有一块 panel 渲染当前组数据，不保留多个隐藏的分类网格。

组件没有上下键网格导航。分类项都是普通 button，Tab、Enter、Space 使用原生行为。方向键只在 tablist 的事件作用域内处理。

## 分类点击与 DOM 反馈

<!-- source: src/library/shop/ShopCategoryRail.vue#L51-L54 -->
```ts
function selectItem(item: ShopCategoryItem) {
  selected.value = item.name
  emit('select', item, current.value?.name ?? '')
}
```

点击分类只把 selected 设为 item.name，不 toggle；重复点击同一个分类仍选中并重复 emit。组件不导航到商品列表，也不获取该分类商品；宿主接收上下文后决定行为。

网格项通过 selected 类添加内描边，aria-pressed 同步选中状态，并显示 Check。底部 `role="status"` 输出当前组、ChevronRight 和选中分类；组切换清空 selected 后，这个内容移除。

图片的 alt 为空，因为同一按钮内已经有可见分类名，避免辅助技术重复朗读。image URL 失败时没有 fallback，仍保留背景与分类名。

## 稳定尺寸、鼠标与动态效果

<!-- source: src/library/shop/ShopCategoryRail.vue#L85-L92 -->
```css
.category-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); grid-auto-rows: 100px; gap: 2px; overflow: hidden; border-radius: 23px; box-shadow: 0 5px 14px rgb(0 0 0 / 9%); }
.category-tile { position: relative; min-width: 0; padding: 0; overflow: hidden; border: 0; background: #ededed; color: #fff; }
.category-tile::after { position: absolute; inset: 0; content: ''; background: linear-gradient(transparent 40%, rgb(0 0 0 / 36%)); pointer-events: none; }
.category-tile img { display: block; width: 100%; height: 100%; object-fit: cover; transition: transform 350ms ease; }
.category-tile:hover img { transform: scale(1.045); }
.category-tile span { position: absolute; z-index: 1; right: 12px; bottom: 10px; left: 12px; color: #fff; font-size: 14px; font-weight: 600; line-height: 1.15; text-align: left; text-shadow: 0 1px 4px rgb(0 0 0 / 55%); overflow-wrap: anywhere; }
.selected-check { position: absolute; z-index: 1; top: 10px; right: 10px; padding: 3px; box-sizing: content-box; border-radius: 50%; background: #fff; color: #5433eb; }
.category-tile.selected { outline: 3px solid #5433eb; outline-offset: -3px; }
```

网格是固定两列、每行 100px；超过四项会继续生成行，不做分页。minmax(0,1fr) 与 min-width=0 允许列收缩。选择描边使用负 outline-offset，不改变排版尺寸。

hover 只缩放 img，不改变按钮大小。装饰遮罩 pointer-events:none，确保点击落到真实 button。所有按钮静态 cursor:pointer，没有拖动换组或原生 drag 事件实现。

底部状态区 min-height=26px，选中前后保留高度；标签条 overflow-x:auto，可容纳较多分组。prefers-reduced-motion 下取消图片 transition 和 hover scale。

## 完整接入示例

放在 `src/examples/CategoryExample.vue`。父组件同时记录当前组与选中项；v-model:active-category 对应组件实际存在的 prop 和 update 事件。

<!-- example -->
```vue
<script setup lang="ts">
import { ref } from 'vue'
import ShopCategoryRail from '../library/shop/ShopCategoryRail.vue'
import { shopCategories, type ShopCategoryItem } from '../library/shop/shopCategories'

const group = ref('Women')
const selection = ref<{ name: string; group: string } | null>(null)
function select(item: ShopCategoryItem, groupName: string) {
  selection.value = { name: item.name, group: groupName }
}
function changeGroup() {
  selection.value = null
}
</script>

<template>
  <ShopCategoryRail
    v-model:active-category="group"
    :groups="shopCategories"
    :show-navigation="true"
    title="Explore categories"
    @update:active-category="changeGroup"
    @select="select"
  />
  <output v-if="selection">{{ selection.group }} / {{ selection.name }}</output>
</template>
```

## 验证与接入限制

[shop.test.ts](../src/library/shop/shop.test.ts#L24) 用 ArrowRight 切到 Home，断言 aria-selected 和 update:activeCategory；点击 Blankets 精确验证两个位置参数及 status 文案，再点 Next category 循环回 Women 并清空选择。

该测试没有验证真实 document.activeElement、Home / End、两组以上循环、重复名称或动态替换 groups。键盘 focus 调用存在于源码，但测试只检查当前选择语义，不能据此宣称所有辅助技术组合已验证。

空 groups 显示 `No categories available`；存在组但 items=[] 会显示空网格，不显示同一空状态文案。没有加载占位、图像错误重试、路由、商品数据请求或列表虚拟化。

导出依赖本 SFC、shopCategories.ts、实际分类图片、两个 Shop 字体与 lucide 图标；没有计时器、全局监听或 Object URL 需要清理。
