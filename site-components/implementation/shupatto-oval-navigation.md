# Oval Menu Navigation：展开状态、原生导航与语言事件

组件 ID：`shupatto-oval-navigation`。

导航组件封装 Shupatto 椭圆菜单触发器、可展开主导航、语言选择和 Escape 焦点归还。它是内联展开菜单，不是占满屏幕的模态对话框。

## 源码与测试

- [OvalNavigation.vue](../src/library/shupatto/OvalNavigation.vue#L1)：状态、菜单与样式。
- [core.test.ts](../src/library/shupatto/core.test.ts#L109)：Escape、触发器焦点、语言通知与导航关闭。

依赖 Vue 的 ref/watch/nextTick/useId 和 `lucide-vue-next` 的 Menu、X、ArrowUpRight。字体来自本地 Shupatto TT Fors 文件。

默认品牌名称固定为 Shupatto，底部公司名固定为 marna corporation。它们没有独立 props，复用于其他品牌时需先扩展文本接口。

## Props 完整契约

| 参数 | 类型 | 默认值 | 行为 |
| --- | --- | --- | --- |
| `initiallyOpen` | `boolean` | `true` | 初始化开合；后续 prop 变化也会同步 |
| `language` | `string` | `EN` | 宿主控制的语言值 |
| `links` | `{ label: string; href?: string }[]` | Lineup、About、Shoplist | 每个菜单项的名称与可选跳转 |

默认 links 都没有 href，因此渲染为 button，只发出导航通知。提供 href 时渲染为真正 a 标签。

language 目前只展示 EN 和 JA 两个 option。类型虽然是 string，其他值没有匹配 option；宿主应使用这两个值或先扩展可选语言数据契约。

links 使用 label 作为 Vue key，应避免同一菜单内重复标签。href 不经过协议校验，接入层应提供可信站内或外部链接。

## 开合状态与通知

<!-- source: src/library/shupatto/OvalNavigation.vue#L4-L11 -->
```ts
const props = withDefaults(defineProps<{ initiallyOpen?: boolean; language?: string; links?: { label: string; href?: string }[] }>(), { initiallyOpen: true, language: 'EN', links: () => [{ label: 'Lineup' }, { label: 'About' }, { label: 'Shoplist' }] })
const emit = defineEmits<{ navigate: [link: { label: string; href?: string }]; 'language-change': [language: string]; 'open-change': [open: boolean] }>()
const open = ref(props.initiallyOpen)
const trigger = ref<HTMLButtonElement>()
const id = useId()
watch(() => props.initiallyOpen, value => { open.value = value })
watch(open, value => emit('open-change', value))
async function close() { open.value = false; await nextTick(); trigger.value?.focus() }
```

open 是本地可变 ref，而 initiallyOpen 是输入同步来源。外部改变 initiallyOpen 可以打开或关闭菜单；改变 open 的 watcher 会通知宿主。

挂载时 watcher 没有 immediate，因此不会仅因默认展开而发 open-change。再次设置相同布尔值也不会形成新的状态变化通知。

trigger 保存菜单按钮 DOM，用于 Escape 后恢复焦点；id 由 useId 生成，连接 aria-controls 和 nav 的 id。

language 没有内部 ref，直接从 prop 渲染，因此其权威值归宿主所有。用户选择只是发出 language-change，宿主应更新 prop。

## 原生按钮、链接和 select

<!-- source: src/library/shupatto/OvalNavigation.vue#L14-L14 -->
```vue
  <section class="shupatto-nav" @keydown.esc="close"><header><span>Shupatto</span><button ref="trigger" type="button" :aria-expanded="open" :aria-controls="id" aria-label="Toggle Shupatto menu" @click="open = !open"><component :is="open ? X : Menu" :size="18" /><span>{{ open ? 'CLOSE' : 'MENU' }}</span></button></header><nav v-if="open" :id="id" aria-label="Shupatto navigation"><component :is="link.href ? 'a' : 'button'" v-for="link in links" :key="link.label" :href="link.href" :type="link.href ? undefined : 'button'" @click="emit('navigate', link); open = false"><span>{{ link.label }}</span><ArrowUpRight :size="24" /></component><footer><span>marna corporation</span><select :value="language" aria-label="Language" @change="emit('language-change', ($event.target as HTMLSelectElement).value)"><option>EN</option><option>JA</option></select></footer></nav></section>
```

点击触发器执行 open=!open。图标根据 open 切换 Menu/X，文字同步 MENU/CLOSE，aria-expanded 同步表达真实展开状态。

nav 使用 v-if，关闭时从 DOM 移除全部导航与语言控件，不是只通过 opacity 把仍可聚焦的元素隐藏。

动态 component 根据 href 是否存在生成 a 或 button；button 设置 type=button，防止被嵌入 form 时意外提交。

导航点击先 emit navigate(link)，再设置 open=false。有 href 的项保留浏览器默认导航，没有 preventDefault，也没有自定义 router.push。

语言 select 的原生 change 读取 event.target.value，发出 EN 或 JA 字符串；没有自动加载翻译字典或修改 document.lang。

## 事件与接入规则

| 事件 | payload | 触发时机 |
| --- | --- | --- |
| `navigate` | `{ label: string; href?: string }` | 用户点击菜单项 |
| `language-change` | `string` | 用户修改语言 select |
| `open-change` | `boolean` | open ref 实际改变 |

navigate 的 payload 是 link 对象引用，没有原生 MouseEvent。若 href 存在，宿主不能通过这个事件的返回值阻止原生导航；需要 SPA 接管时可传无 href 的项并处理事件。

组件没有 update:language，所以不能直接写 `v-model:language`；应使用 `:language` 和 `@language-change`。开合也没有 update:initiallyOpen。

无 href 时默认菜单点击只关闭并发通知，不会凭 label 猜 URL。真实路由与语言应用逻辑必须由宿主提供。

## Escape 与焦点链

Escape 的 keydown 监听放在根 section，内部控件的事件冒泡到这里后调用 close()。close 先将 open=false，再等待 nextTick，最后 focus 触发器。

等待 DOM 更新是为了确保 nav 已经移除，焦点不落在即将销毁的菜单项。测试实际验证菜单项获得焦点后 Escape 返回按钮。

触发器点击关闭时浏览器本身仍聚焦触发器；导航项点击关闭只设置 open=false，没有调用 close()，因此不保证主动归还焦点。

菜单打开时也没有自动 focus 第一项；用户继续按 Tab 进入导航。组件不设焦点陷阱，因为它不是 modal，页面其他区域仍可交互。

Escape 处理没有 preventDefault 或 stopPropagation；嵌套于更大的键盘交互区域时，祖先仍可能收到同一 Escape 事件。

## 椭圆按钮和响应式样式

<!-- source: src/library/shupatto/OvalNavigation.vue#L18-L26 -->
```css
.shupatto-nav { width: min(100%, 580px); padding: 20px 27px; color: #272726; background: #e8e8e8; font: 13px/1.4 'Library Shupatto', Arial, sans-serif; }
.shupatto-nav header { display: flex; align-items: center; justify-content: space-between; gap: 15px; }
.shupatto-nav header > span { font-size: 28px; }
.shupatto-nav header button { display: flex; align-items: center; gap: 7px; min-width: 86px; height: 57px; justify-content: center; border: 1px solid #272726; border-radius: 50%; color: inherit; background: transparent; font-size: 10px; cursor: pointer; }
.shupatto-nav nav { padding: 18px 0 0; }
.shupatto-nav nav > a, .shupatto-nav nav > button { display: flex; align-items: center; justify-content: space-between; gap: 15px; width: 100%; padding: 14px 0; border: 0; border-bottom: 1px solid #27272635; background: none; font: 25px/1.2 'Library Shupatto', Arial, sans-serif; color: inherit; text-decoration: none; cursor: pointer; text-align: left; }
.shupatto-nav footer { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 20px; font-size: 11px; }
.shupatto-nav select { background: none; border: 0; color: inherit; font: inherit; padding: 4px; }
@media(max-width: 420px) { .shupatto-nav { padding: 18px; } .shupatto-nav header > span { font-size: 23px; } .shupatto-nav header button { min-width: 68px; height: 48px; } .shupatto-nav header button span { display: none; } }
```

86×57 的不等宽高配合 border-radius:50% 构成椭圆。移动端缩小为68×48并隐藏 MENU/CLOSE 可见文字，但 aria-label 保留可访问名称。

开合没有 height transition、动画帧或延时；Vue 直接增删 nav。鼠标反馈来自 CSS pointer，没有事件中改写 cursor，也没有原生拖拽菜单。

菜单项宽度铺满容器，标签与箭头由 flex 分布。组件没有跟随滚动、吸顶或点击外部关闭逻辑。

## 完整接入示例

示例放在 `src/examples/NavigationExample.vue`。使用无 href 项交给宿主切换当前页，语言通过事件回写。

<!-- example -->
```vue
<script setup lang="ts">
import { ref } from 'vue'
import OvalNavigation from '../library/shupatto/OvalNavigation.vue'

const language = ref('EN')
const activePage = ref('Lineup')
const isOpen = ref(false)
const links = [{ label: 'Lineup' }, { label: 'About' }, { label: 'Shoplist' }]
</script>

<template>
  <OvalNavigation
    :links="links"
    :initially-open="isOpen"
    :language="language"
    @navigate="activePage = $event.label"
    @language-change="language = $event"
    @open-change="isOpen = $event"
  />
  <main>
    <h1>{{ activePage }}</h1>
    <output>{{ language }}</output>
  </main>
</template>
```

## 已验证与限制

测试覆盖初始关闭、点击展开、aria-expanded、菜单中 Escape 关闭并归还焦点、open-change 顺序、语言事件与 prop 同步、有 href 渲染 a、无 href 渲染 button 以及导航后关闭。

没有对点击外部关闭、焦点陷阱、自动语言翻译或历史路由进行测试，因为当前组件未实现这些行为。没有定时器和全局监听，不需要额外卸载清理。
