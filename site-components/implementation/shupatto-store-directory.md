# Regional Store Directory：地区选择与门店名称检索

组件 ID：`shupatto-store-directory`。

门店目录按地区选择实际零售商，再对该地区的店名进行本地过滤。它使用快照提取的门店资料，交互结果会改变列表、链接和计数。

## 源码和数据来源

- [StoreDirectory.vue](../src/library/shupatto/StoreDirectory.vue#L1)：地区同步、搜索和列表。
- [regions.ts](../src/library/shupatto/regions.ts#L1)：23 个地区的零售商快照数据。
- [core.test.ts](../src/library/shupatto/core.test.ts#L78)：地区切换、名称过滤、链接安全属性和空目录。

数据来自原站本地 `en__shoplist.json` 中的地区/门店列表，不通过客户端请求实时门店 API。默认数据更新需要重新提取快照或注入新的 regions。

## Props 与数据结构

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `regions` | `typeof defaults` | 本地 regions | 全部地区与门店 |
| `initialRegion` | `string` | `JAPAN` | 初始地区名称，精确匹配 |
| `title` | `string` | `Shoplist` | 目录标题 |

regions 是 `{ name: string; stores: { name: string; href: string }[] }[]`。地区名称作为 select 值和 Vue key，应唯一。

门店 key 使用 href+name 组合，同一地区内这个组合应唯一。href 用于真实原生链接，宿主应提供可信的 http/https 地址。

初始地区是名称而非独立 ID；`JAPAN` 与 `Japan` 会被视为不同值。搜索输入没有 initialSearch prop，组件新建时总为空。

## 状态、同步和过滤

<!-- source: src/library/shupatto/StoreDirectory.vue#L5-L11 -->
```ts
const props = withDefaults(defineProps<{ regions?: typeof defaults; initialRegion?: string; title?: string }>(), { regions: () => defaults, initialRegion: 'JAPAN', title: 'Shoplist' })
const emit = defineEmits<{ 'region-change': [region: string] }>()
const region = ref(props.initialRegion)
const search = ref('')
const id = useId()
watch([() => props.initialRegion, () => props.regions], () => { region.value = props.regions.some(item => item.name === props.initialRegion) ? props.initialRegion : props.regions[0]?.name ?? '' }, { immediate: true })
const stores = computed(() => (props.regions.find(item => item.name === region.value)?.stores ?? []).filter(item => item.name.toLowerCase().includes(search.value.toLowerCase().trim())))
```

region 是当前地区，search 是当前搜索文本，stores 是“找到该地区 → 取门店数组 → 按店名过滤”的 computed。useId 为两个表单控件生成独立关联 ID。

watcher immediate 执行：initialRegion 存在则使用它，否则回到第一地区，空数组则 region=''。当 regions 数组引用变化时，也会重新按 props.initialRegion 定位，而不是优先保留用户当前地区。

接入层刷新数据时如果希望保持当前地区，应同时将最近的 region-change 结果作为 initialRegion 传回。只更新 regions 而保持旧 initialRegion，可能使选择返回初始地区。

watcher 非 deep，不把 regions 内部原地修改当成完整同步信号；建议以新数组更新数据。

## 名称检索规则

search 先 toLowerCase 再 trim，以整个字符串执行 includes。`  ABSOLUTELY FABULOUS  ` 可以匹配 Absolutely Fabulous。

这里没有拆成多个关键词，也没有 AND/OR 搜索语法。例如包含两个分离单词但顺序不同的店名不会仅因为都有这些词就命中。

过滤只扫描当前地区的 stores；它不是跨全部地区搜索。切地区时不会清空 search，因此原搜索词继续应用于新的门店集合。

空 search 对所有门店成立，清空输入即可恢复该地区全部结果。复杂度是当前地区门店数的线性扫描，无节流、索引或分页。

## 原生 select/input 到 DOM

<!-- source: src/library/shupatto/StoreDirectory.vue#L14-L14 -->
```vue
  <section class="shupatto-stores"><header><span>Shupatto</span><h2>{{ title }}</h2></header><div class="shupatto-stores__filters"><label :for="`${id}-region`">Region<select :id="`${id}-region`" v-model="region" @change="emit('region-change', region)"><option v-for="item in regions" :key="item.name">{{ item.name }}</option></select></label><label :for="`${id}-search`">Store name<div><Search :size="14" /><input :id="`${id}-search`" v-model="search" type="search" placeholder="Search stores" /></div></label></div><div class="shupatto-stores__results"><a v-for="store in stores" :key="store.href + store.name" :href="store.href" target="_blank" rel="noopener noreferrer"><span>{{ store.name }}</span><ArrowUpRight :size="15" /></a><p v-if="!stores.length">No stores found.</p></div><footer>{{ stores.length }} stores · {{ region }}</footer></section>
```

1. 原生 select change 通过 v-model 写入 region。
2. 同一变更事件发出 region-change，payload 是所选名称。
3. stores computed 读取新地区并应用现有搜索字符串。
4. 门店 a 元素列表按数据更新，footer 使用同一个 stores.length。
5. 原生搜索框 input 通过 v-model 写入 search，重复第3–4步，但不发额外业务事件。

option 没有显式 value，因此浏览器使用其文本作为值，这与地区 name 一致。没有自定义下拉浮层或 Combobox 状态机。

region-change 仅表示用户改变 select，不表示 mounted 或 props 同步。唯一 emit 为 `region-change(region: string)`；没有 search、selectStore 或 openStore 事件。

## 外部链接与空结果

门店项是原生 `<a>`，使用 href、target=_blank、rel=noopener noreferrer。点击无需 JavaScript 调用 window.open，也不会阻止默认导航。

链接不会回传完整门店对象，宿主如果需要点击分析应增加明确事件，而不是假设已存在 select 输出。

无匹配结果时显示 No stores found.，footer 数量变为0。regions 为空时无 option、无门店链接，避免显示上一个地区的残留链接。

组件不会检查门店是否营业、地理距离或链接是否返回200；这些属于外部资料准确性。地址、营业时间、地图坐标不在当前数据模型中。

## 滚动与布局实现

<!-- source: src/library/shupatto/StoreDirectory.vue#L22-L30 -->
```css
.shupatto-stores__filters { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 15px; }
.shupatto-stores label { display: block; min-width: 0; font-size: 10px; }
.shupatto-stores select, .shupatto-stores input { min-width: 0; width: 100%; height: 38px; border: 0; color: inherit; background: none; font: 12px 'Library Shupatto', Arial, sans-serif; }
.shupatto-stores select { border-bottom: 1px solid #27272660; }
.shupatto-stores label > div { display: flex; align-items: center; gap: 8px; border-bottom: 1px solid #27272660; }
.shupatto-stores__results { max-height: 205px; overflow-y: auto; border-top: 1px solid #27272630; }
.shupatto-stores__results > a { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 12px 4px; border-bottom: 1px solid #27272620; color: inherit; text-decoration: none; }
.shupatto-stores__results > a > span { overflow-wrap: anywhere; }
.shupatto-stores__results svg { flex-shrink: 0; }
```

两列表单在420px以下改为单列。结果区域最大205px高，超过后由浏览器原生 overflow-y:auto 提供滚动。

长店名允许 anywhere 换行，箭头 flex-shrink:0，防止名称挤压或覆盖图标。结果条目按内容高度增长，没有固定高度裁掉文本。

没有拖拽列表、pointer capture、wheel 监听或动态 cursor 修改。链接使用浏览器原生指针反馈，select/input 保留对应系统交互。

## 键盘与生命周期

原生 select 支持键盘选择，搜索框支持常规文本编辑，门店链接可通过 Tab 进入并 Enter 打开。label/for 与唯一 ID 提供名称关联。

没有自定义 Escape 清空、方向键在门店中移动、自动聚焦结果或 aria-live 计数播报。footer 当前只是可见文本，不是 role=status。

组件无 timer、RAF、IntersectionObserver、全局监听或网络请求，因此无卸载清理任务。

## 完整接入示例

示例放在 `src/examples/StoreExample.vue`。宿主把最近地区同步回 initialRegion，可在替换数据时保持选中地区。

<!-- example -->
```vue
<script setup lang="ts">
import { ref } from 'vue'
import StoreDirectory from '../library/shupatto/StoreDirectory.vue'
import { regions } from '../library/shupatto/regions'

const selectedRegion = ref('JAPAN')
const directory = ref(regions.map(region => ({
  ...region,
  stores: region.stores.map(store => ({ ...store })),
})))
</script>

<template>
  <StoreDirectory
    title="Shoplist"
    :regions="directory"
    :initial-region="selectedRegion"
    @region-change="selectedRegion = $event"
  />
  <output>当前地区：{{ selectedRegion }}</output>
</template>
```

## 已验证与限制

测试验证 Australia 真实条目数量、不区分大小写与首尾空白的名称匹配、href/target/rel、无结果计数、清空恢复、无效初始地区回退、自定义数据替换以及空目录无旧链接。

没有远程加载和失败重试，因此测试不包含 API 断网场景。业务需要实时资料时应先在宿主完成请求，再将整理后的数组传入。

快照只保证当前本地收录数据的来源，不保证外部门店网站永远可访问。
