# Ride Package Comparison：动态差异筛选与套件选择

组件 ID：`also-ride-comparison`。

这个比较表把骑行套件作为列，把四类真实规格作为行。复选框可以移除相同规格行，选择按钮交付具体套件对象，并根据可用状态阻止无效选择。

## 源码和模型

- [RidePackageComparison.vue](../src/library/also/RidePackageComparison.vue#L1)：差异计算、选择和表格。
- [ride-data.ts](../src/library/also/ride-data.ts#L1)：`RidePackage` 模型与默认数据。
- [core.spec.ts](../src/library/also/core.spec.ts#L80)：共享规格过滤、选择 payload、不可用选项。

运行依赖 Vue、`lucide-vue-next` 和 ALSO Camera 字体。默认 Road / All Terrain 图片是原站模块图片，没有为每个状态生成不同合成整车图。

`RidePackage` 包含 `id`、`label`、`image`、`price`、`terrain`、`tires`、`pedals`、`modes` 和可选 `available`。

## Props 契约

| 参数 | 类型 | 默认值 | 行为 |
| --- | --- | --- | --- |
| `title` | `string` | `Choose your terrain.` | 比较区域标题 |
| `packages` | `RidePackage[]` | `ridePackages` | 可比较的全部列 |
| `initialPackage` | `string` | `road` | 内部选中 ID 的输入 |
| `differencesOnly` | `boolean` | `false` | 初始差异开关，变化时重同步 |
| `showPrices` | `boolean` | `true` | 控制列标题中的加价 |

所有参数可省略。自定义 packages 的每个 ID 应唯一，规格字段应为规范化后的字符串，否则差异判断可能把同义文本视为不同值。

`initialPackage` 若不在列表中，不会自动选择第一项；所有按钮保持未选中。它不是 `v-model`，选择后通过 `select` 通知宿主。

## 本地状态与差异算法

<!-- source: src/library/also/RidePackageComparison.vue#L6-L15 -->
```ts
const emit = defineEmits<{ select: [ridePackage: RidePackage] }>()
const id = useId()
const selectedId = ref(props.initialPackage)
const differences = ref(props.differencesOnly)
watch(() => props.initialPackage, value => { selectedId.value = value })
watch(() => props.differencesOnly, value => { differences.value = value })
const features = [{ key: 'terrain', label: 'Terrain' }, { key: 'tires', label: 'Tires' }, { key: 'pedals', label: 'Pedals' }, { key: 'modes', label: 'Ride modes' }] as const
const rows = computed(() => features.filter(feature => !differences.value || new Set(props.packages.map(item => item[feature.key])).size > 1))
function select(item: RidePackage) { if (item.available === false) return; selectedId.value = item.id; emit('select', item) }
const price = (value: number) => value ? `+$${value}` : 'Included'
```

`differences` 是本地可编辑状态，由 checkbox v-model 更新；外部 prop 变化会覆盖它。开关没有单独 change 事件，宿主如果需要保存这一偏好需扩展契约。

`features` 是四个固定字段的结构化描述，`rows` 对每个字段收集所有套件值并放进 Set。当不同值数量大于 1 时，才算“有差异”。

算法是严格字符串比较，不会 trim、忽略大小写或解析单位。例如 `Auto + Manual` 与末尾多一个空格的文本会被认为不同。

当 differences=false 时保留四行；只有一列时，开启差异会隐藏全部规格行，但列标题和选择按钮仍存在。

复杂度为四个字段分别遍历 N 个套件，属于 O(4N)。没有远程比较请求、排序或延迟执行。

## 从 checkbox 到表格行

<!-- source: src/library/also/RidePackageComparison.vue#L19-L24 -->
```vue
  <section class="also-packages" :aria-labelledby="`${id}-title`">
    <header><h3 :id="`${id}-title`">{{ title }}</h3><label><input v-model="differences" type="checkbox" />Differences only</label></header>
    <div v-if="packages.length" class="also-packages__scroll" tabindex="0" role="region" aria-label="Ride package comparison">
      <table><caption class="also-packages__sr-only">Ride packages and specifications</caption><thead><tr><th scope="col"><span class="also-packages__sr-only">Feature</span></th><th v-for="item in packages" :key="item.id" scope="col"><img :src="item.image" :alt="`${item.label} ride package`" /><span>{{ item.label }}</span><small v-if="showPrices">{{ price(item.price) }}</small></th></tr></thead><tbody><tr v-for="feature in rows" :key="feature.key"><th scope="row">{{ feature.label }}</th><td v-for="item in packages" :key="item.id">{{ item[feature.key] }}</td></tr><tr><th scope="row"><span class="also-packages__sr-only">Select a package</span></th><td v-for="item in packages" :key="item.id"><button type="button" :aria-pressed="selectedId === item.id" :aria-label="`Select ${item.label}`" :disabled="item.available === false" @click="select(item)"><Check v-if="selectedId === item.id" :size="13" aria-hidden="true" /><span>{{ item.available === false ? 'Unavailable' : selectedId === item.id ? 'Selected' : 'Select' }}</span></button></td></tr></tbody></table>
    </div>
    <p v-else>No ride packages available.</p>
```

原生 checkbox 的变更通过 v-model 写入 differences，computed rows 重新计算，Vue 根据 feature.key 增删规格行。

这里没有简单地用 CSS 隐藏文字；不满足差异条件的行不会出现在当前渲染的表格 DOM 中。

图片、名称、差价属于表头，始终与同一套件对象绑定。点击某列的 Select 按钮调用 `select(item)`，selectedId 变化使对应按钮 aria-pressed=true，勾选图标出现，背景变绿。

选择不会切换整车图片或导航至其他页面；宿主接收完整对象后决定如何进入后续配置流程。

## 事件和可用性

唯一输出为 `select(ridePackage: RidePackage)`。首次挂载、initialPackage 同步、开关变化或列表替换不发出选择事件。

原生 disabled 属性和函数内部 `available === false` 检查共同阻止不可用项。`available` 缺省视为可用，保持与模块选配器一致。

重复点击已选中且可用的按钮仍会发 select，消费者应允许幂等选择。payload 是 props 中对象的引用；需要保存历史快照时应复制对象。

当前选中项后来变成 unavailable 时，其 aria-pressed 可能仍为 true，同时显示 Unavailable 并禁用。组件不会替用户跳到另一种套件。

## 价格格式与数据限制

price=0 显示 Included，非零直接拼接 `+$${value}`。它不是 Intl 货币格式化，不会自动添加千分位或统一小数位，也没有币种切换。

因此默认 Road=0、All Terrain=200 分别显示 Included 和 +$200。若传入负数，会直接出现带 `+-` 的文本，接入层应提供非负的增量价格。

差异开关只比较四个规格字段，价格不同本身不会使额外价格行出现。自定义更多规格需要同时扩展类型和 features 数组。

## 键盘、布局与鼠标样式

表格使用 caption、scope=col/row，列和行语义完整。滚动容器设置 tabindex=0，使键盘可以聚焦比较区域并使用浏览器原生滚动。

选择按钮使用 aria-pressed，checkbox 由包装 label 提供名称。`useId()` 给标题生成独立 ID。

table-layout=fixed 与单元格 overflow-wrap 控制长规格文本；外层 overflow:auto 处理宽度限制。没有自定义拖拽横移、drag 事件或手写滚动惯性。

CSS 使用 pointer 表示可点击，disabled 时使用 default；焦点由 :focus-visible 轮廓表达。图片尺寸固定，object-fit:contain 保留模块形状。

组件没有 requestAnimationFrame、setTimeout、全局事件或异步请求，所以不需要额外卸载清理。

## 完整接入示例

示例放在 `src/examples/ComparisonExample.vue`，演示注入统一规格文字并接收选择。

<!-- example -->
```vue
<script setup lang="ts">
import { ref } from 'vue'
import RidePackageComparison from '../library/also/RidePackageComparison.vue'
import { ridePackages, type RidePackage } from '../library/also/ride-data'

const packages = ridePackages.map(item => ({
  ...item,
  modes: 'Auto + Manual',
}))
const selected = ref<RidePackage | null>(null)
function choose(item: RidePackage) {
  selected.value = { ...item }
}
</script>

<template>
  <RidePackageComparison
    :packages="packages"
    :differences-only="true"
    :show-prices="true"
    initial-package="road"
    @select="choose"
  />
  <output v-if="selected">{{ selected.label }}：{{ selected.price }}</output>
</template>
```

两列 modes 被设置成相同字符串，因此例子中开启差异后不会出现 Ride modes 行。

## 已验证与限制

测试使用同样的共享模式数据，验证勾选后隐藏 Ride modes、选择 All Terrain 发出其 ID 和 200 加价、全部 unavailable 时按钮禁用。

空数组通过 No ride packages available. 兜底。没有独立图片错误重试、远程库存刷新或支付逻辑；表格呈现的是宿主当前提供的数据。

选择接口不做车架兼容性校验。业务需要在配置保存时统一验证车架、套件与驾驶舱的组合。

当前实现没有“加入比较”集合或最多两项选择的限制，传入多少 packages 就会渲染多少列；只有 selectedId 表示单个当前选择。

没有推荐算法或 recommend 事件。界面中的 Selected 仅说明用户/初始参数指定了该套件，不代表系统判断它最适合用户。
