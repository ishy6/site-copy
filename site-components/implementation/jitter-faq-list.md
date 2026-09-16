# Jitter 问答折叠列表：FaqList

组件 ID：`jitter-faq-list`。源码：[FaqList.vue](../src/library/jitter/FaqList.vue#L1)。单个opened索引决定所有答案显隐，重复点击当前问题会全部收起。标题和问题列表保持原站分栏及细线风格。

## 参数与输出

| prop | 类型 | 默认 |
| --- | --- | --- |
| `title` | string | `'A few good questions.'` |
| `initialOpen` | number | 0；-1表示没有匹配的展开项 |
| `items` | `MotionFaq[]` | 源码内4条问答 |

`MotionFaq` 是 `{question:string;answer:string}`。所有文字由普通Vue插值渲染，不使用v-html，因此answer不是可执行HTML，也不支持富文本插槽。`change(index:number|null)` 在用户点击toggle后发出；null表示再次点击当前项而关闭。

<!-- source: src/library/jitter/FaqList.vue#L14-L18 -->
```ts
const emit = defineEmits<{ change: [index: number | null] }>()
const id = useId()
const opened = ref<number | null>(props.initialOpen)
watch(() => props.initialOpen, value => { opened.value = value })
function toggle(index: number) { opened.value = opened.value === index ? null : index; emit('change', opened.value) }
```

## 展开状态的具体规则

`opened` 初值直接取initialOpen，不做clamp。按钮循环使用index与opened严格相等，因此initialOpen=-1、超出长度或NaN都表现为全部收起；内部值本身不一定为null。

用户点第二项时toggle(1)：如果opened不是1则变1，只第二项匹配；再次点变null。它没有逐项布尔数组，因此不会同时展开多个答案。

watch(initialOpen)在外部值变化时覆盖opened，但不发change。没有对items.length的watch；数据删项后opened可能指向不存在的位置，所有项收起，而不是自动选中最后一项。

## 按钮与答案的关联

<!-- source: src/library/jitter/FaqList.vue#L20-L20 -->
```vue
<template><section class="faq-list" :aria-label="title"><h3>{{ title }}</h3><div><article v-for="(item, index) in items" :key="index"><button type="button" :id="`${id}-trigger-${index}`" :aria-expanded="opened === index" :aria-controls="`${id}-answer-${index}`" @click="toggle(index)"><span>{{ item.question }}</span><Minus v-if="opened === index" :size="17" /><Plus v-else :size="17" /></button><div v-show="opened === index" :id="`${id}-answer-${index}`" role="region" :aria-labelledby="`${id}-trigger-${index}`"><p>{{ item.answer }}</p></div></article></div></section></template>
```

`useId`提供实例ID，后缀分别为trigger-index和answer-index，触发器aria-controls指向答案，答案role=region用aria-labelledby反向指向问题按钮。

aria-expanded、Minus/Plus图标和v-show条件使用同一opened===index，不会出现图标已展开而内容关闭的第二份状态。v-show仅切display，所有答案节点仍存在，关闭时不会销毁其DOM。

这里没有高度测量、scrollHeight、CSS grid行高过渡或Transition；展开/收起即时变化。隐藏答案文本不占布局，读屏根据display:none不读取隐藏区。

## 键盘、鼠标及布局

原生button承担Enter/空格激活与Tab导航。组件没有ArrowUp/Down、Home/End、Escape折叠处理，也不主动改变焦点，点击/键盘激活后焦点留在问题按钮。

CSS在[源码第23行](../src/library/jitter/FaqList.vue#L23)定义两列minmax(0,.8fr)/minmax(0,1.2fr)，gap40px；520px以下改一列、gap24px。按钮横排问题和图标，图标flex:none防止被长标题挤压，问题与答案overflow-wrap:anywhere允许长词换行。

button固定cursor:pointer、focus-visible紫色轮廓。无drag/drop、PointerEvent、触摸手势和动态cursor。触屏操作沿用原生click。

## 可运行接入

示例放在 `src/examples/`。

<!-- example -->
```vue
<script setup lang="ts">
import { ref } from 'vue'
import FaqList, { type MotionFaq } from '../library/jitter/FaqList.vue'

const opened = ref<number | null>(0)
const items: MotionFaq[] = [
  { question: '怎样选择模板？', answer: '在模板列表中筛选并选择一项。' },
  { question: '修改会自动保存吗？', answer: '保存策略由接入应用决定。' },
]
</script>
<template>
  <FaqList title="常见问题" :items="items"
    :initial-open="opened ?? -1" @change="opened = $event" />
  <p>当前展开项：{{ opened === null ? '无' : opened + 1 }}</p>
</template>
```

## 默认内容与依赖

默认问答含原站产品能力及本地演示存储说明，它们只是示例内容，不会让组件具备Figma导入或浏览器存储逻辑。实际产品应传入自己的items。依赖Vue、lucide的Minus/Plus及Lausanne本地字体。

无异步任务、计时器、全局监听或卸载清理代码。items=[]时保留标题但不显示空状态文案。key使用数组index；动态重排后展开的是当前位置，而非按question身份追踪。

## 测试事实

[core.test.ts](../src/library/jitter/core.test.ts#L57) 点击第二问题，检查aria-expanded=true、通过aria-controls找到的答案可见；重复点击后change最后参数为null。尚未单测多实例ID、外部initialOpen更新、动态删除或无效索引。
