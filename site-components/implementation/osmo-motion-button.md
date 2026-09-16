# Osmo 旋转文字按钮：MotionButton

组件 ID：`osmo-motion-button`。入口：[MotionButton.vue](../src/library/osmo/MotionButton.vue#L1)，内部文字动效：[ButtonLabel.vue](../src/library/osmo/ButtonLabel.vue#L1)。它保留原生按钮或链接的激活行为，文字动效由 Web Animations API 实现。此组件没有拖拽操作。

## 接口与依赖

| 参数 | 类型 | 默认值 | 实际作用 |
| --- | --- | --- | --- |
| `label` | `string`，必填 | 无 | 两层文字均使用此值，文本长度还影响旋转原点 |
| `href` | `string` | `undefined` | 只要不为 `undefined` 就渲染 `a`，空字符串也走链接分支 |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | 仅传给原生 button |
| `disabled` | `boolean` | 未显式赋值，布尔 prop 缺省为 false | 原生按钮禁用或链接软禁用 |
| `variant` | `'dark' \| 'lime' \| 'violet'` | `'dark'` | 选择背景色和文字色类名 |
| `arrow` | `boolean` | `true` | 控制默认插槽中的 ArrowUpRight |

`click(event: MouseEvent)` 只在非禁用状态发出。默认插槽可替换右侧箭头；`arrow=false` 仅关闭默认箭头，不会隐藏调用方自己的插槽。依赖 Vue、`lucide-vue-next`、`ButtonLabel.vue`；Haffer 字体由宿主字体样式或组件下载包的字体说明接入。

## 点击如何保持原生语义

<!-- source: src/library/osmo/MotionButton.vue#L15-L22 -->
```ts
function handleClick(event: MouseEvent) {
  if (props.disabled) {
    event.preventDefault()
    event.stopPropagation()
    return
  }
  emit('click', event)
}
```

`handleClick` 在禁用分支同时阻止默认动作和向上冒泡，因此禁用链接不能因点击继续跳转，也不会发出业务 click。正常路径不调用 `preventDefault`，链接的浏览器导航、submit 按钮的表单行为继续存在；调用方监听 click 时也能通过收到的原始事件取消默认动作。

<!-- source: src/library/osmo/MotionButton.vue#L25-L33 -->
```vue
<template>
  <component :is="href !== undefined ? 'a' : 'button'" v-bind="$attrs"
    class="osmo-button" :class="`osmo-button--${variant}`" :href="href"
    :type="href !== undefined ? undefined : type" :disabled="href === undefined ? disabled : undefined"
    :aria-disabled="disabled || undefined" :tabindex="disabled && href !== undefined ? -1 : $attrs.tabindex"
    @click="handleClick">
    <ButtonLabel :label="label" /><slot><ArrowUpRight v-if="arrow" :size="20" /></slot>
  </component>
</template>
```

`inheritAttrs:false` 与根节点 `v-bind="$attrs"` 配套，使外部 class、id、aria 和 tabindex 明确传给实际交互元素。链接没有原生 disabled，因此使用 `aria-disabled` 和 `tabindex=-1`；原生 button 则直接绑定 disabled。按钮文字与箭头都在真正的交互元素内部，不额外套一个可点击 div。

## 文字旋转不是 CSS hover 动画

<!-- source: src/library/osmo/ButtonLabel.vue#L4-L8 -->
```ts
const props = defineProps<{ label: string }>()
const origin = computed(() => `${Math.min(10000, 460 + 180 * props.label.length)}%`)
const root = ref<HTMLElement>()
let parent: HTMLElement | null = null
let animations: Animation[] = []
```

`origin` 把字符数映射为百分比旋转原点：最小常数 460，加每字符 180，最大 10000%。它被绑定为 `--roll-origin`；CSS 的 `transform-origin:50% var(--roll-origin)` 令文字沿远端圆弧运动。`animations` 保存当前浏览器 Animation 对象，`parent` 保存最近的 button/a。

<!-- source: src/library/osmo/ButtonLabel.vue#L15-L30 -->
```ts
function rotate() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || parent?.matches(':disabled, [aria-disabled="true"]')) return
  if (animations.some(animation => animation.playState === 'running' || animation.pending)) return
  reset()
  animations = Array.from(root.value?.children ?? []).flatMap((element, index) => {
    if (typeof element.animate !== 'function') return []
    return element.animate([
      { transform: `rotate(${index === 0 ? 0 : -20}deg)`, opacity: 1 },
      { transform: `rotate(${index === 0 ? 20 : 0}deg)`, opacity: 1 },
    ], { duration: 500, delay: index * 75, easing: 'cubic-bezier(.625,.05,0,1)', fill: 'forwards' })
  })
  const current = animations
  void Promise.all(current.map(animation => animation.finished)).then(() => {
    if (animations === current) reset()
  }).catch(() => {})
}
```

每次 `rotate` 先检查减少动态效果、禁用状态和已有动画。两层文字分别从 0° 转到 20°、从 -20° 转到 0°，第二层延迟 75ms，总时长 500ms。`fill:'forwards'` 保持本轮终态，全部 `finished` 完成后调用 reset 取消动画，使基础 CSS 恢复。比较 `animations === current` 防止旧 Promise 完成时清掉新一轮动画；取消动画导致的 Promise 拒绝被 catch 消化。

模板第一层是正常可读文字，第二层 `aria-hidden=true`，避免读屏重复播报。第二层绝对定位并默认 opacity 0、rotate(-20deg)，两层不会把按钮撑宽两倍。`overflow:hidden` 在按钮根节点裁切旋转过程。

<!-- source: src/library/osmo/ButtonLabel.vue#L32-L42 -->
```ts
onMounted(() => {
  parent = root.value?.closest('button, a') ?? null
  parent?.addEventListener('pointerenter', rotate)
  parent?.addEventListener('focusin', rotate)
})
onBeforeUnmount(() => {
  parent?.removeEventListener('pointerenter', rotate)
  parent?.removeEventListener('focusin', rotate)
  reset()
})
watch(() => props.label, reset)
```

`pointerenter` 覆盖鼠标及支持悬停的指针；`focusin` 让键盘聚焦同样触发动效。它们直接注册在最近交互父元素，不是 Vue 根节点 hover 事件。触摸点击仍使用原生 click，但没有专用触摸拖拽识别。卸载时移除两个监听并取消全部 Animation，label 改变时也会 reset。

## 样式、焦点与边界

<!-- source: src/library/osmo/MotionButton.vue#L36-L41 -->
```css
.osmo-button { display: inline-flex; align-items: center; justify-content: center; gap: 28px; max-width: 100%; min-height: 56px; padding: 16px 24px; border: 0; border-radius: 4px; background: #201d1d; color: #f4f4f4; font: 500 18px/1.25 'Haffer', Arial, sans-serif; text-decoration: none; isolation: isolate; overflow: hidden; cursor: pointer; }
.osmo-button--lime { background: #b1ff69; color: #201d1d; }
.osmo-button--violet { background: #6541f4; color: #fff; }
.osmo-button > :deep(svg) { flex: none; }
.osmo-button:focus-visible { outline: 2px solid #6541f4; outline-offset: 4px; }
.osmo-button:disabled, .osmo-button[aria-disabled=true] { opacity: .4; cursor: not-allowed; }
```

正常光标固定为 pointer，禁用时通过伪类或属性选择器改成 not-allowed。没有 mousedown/up 修改 cursor，也没有 grab/grabbing 状态。focus-visible 的外轮廓与键盘焦点关联，不因普通鼠标点击永久显示。

不支持 Web Animations API 时，`typeof element.animate` 检查令动效跳过，标签仍可阅读。没有 loading prop；异步提交需宿主用 disabled 管理，不能把 click 事件视为请求完成。

## 接入示例

以下示例假定放在 `src/examples/`。业务提交由宿主管理；组件不内置网络请求。

<!-- example -->
```vue
<script setup lang="ts">
import { ref } from 'vue'
import MotionButton from '../library/osmo/MotionButton.vue'

const busy = ref(false)
const message = ref('')
async function submit() {
  busy.value = true
  try {
    const response = await fetch('/api/collections', { method: 'POST' })
    if (!response.ok) throw new Error('创建失败')
    message.value = '已创建'
  } catch (error) {
    message.value = error instanceof Error ? error.message : '创建失败'
  } finally { busy.value = false }
}
</script>
<template>
  <MotionButton :label="busy ? '处理中' : '创建收藏'"
    variant="lime" :disabled="busy" @click="submit" />
  <p role="status">{{ message }}</p>
</template>
```

## 已有验证与未覆盖项

[osmo.test.ts](../src/library/osmo/osmo.test.ts#L6) 验证根节点 button/type、正常 click、禁用链接 tabindex/aria-disabled、阻止默认动作和不发 click。测试没有模拟真实 Web Animations 时间线、Animation.finished 取消竞态或不同字体的旋转裁切；这些视觉行为应在浏览器中检查。
