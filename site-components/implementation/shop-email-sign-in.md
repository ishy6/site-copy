# Shop 邮箱登录：原生约束校验与宿主异步状态

组件 ID：`shop-email-sign-in`。主要代码 [ShopEmailSignIn.vue](../src/library/shop/ShopEmailSignIn.vue#L1)，标志子组件 [ShopBrandMark.vue](../src/library/shop/ShopBrandMark.vue#L1)。

该组件提供邮箱收集与请求状态视图。合法输入仅触发 `submit(email)`；实际发送登录链接由宿主负责。`Check your email` 只在宿主传入 `status='success'` 时出现，不由本地校验成功自动触发。

## 完整接口

| 参数 | 类型 | 默认值 | 作用 |
| --- | --- | --- | --- |
| `title` | `string` | `Sign in to Shop` | 未成功分支的主标题 |
| `subtitle` | `string` | `One account for everything you love.` | 标题下正文 |
| `initialEmail` | `string` | 空串 | 初始化邮箱，并在 prop 更新时同步 |
| `status` | `'idle' \| 'pending' \| 'success' \| 'error'` | `idle` | 宿主异步流程状态 |
| `errorMessage` | `string` | `Something went wrong. Please try again.` | status=error 时的服务端错误文案 |

| 事件 | 载荷 | 触发条件 |
| --- | --- | --- |
| `submit` | `email: string` | 非 pending、非空且原生 validity 通过 |
| `reset` | 无参数 | 成功页点击 Use another email |
| `update:email` | `email: string` | 输入框 input 事件 |

没有 `email` prop，不能只用 `v-model:email` 代替 `initial-email`。当前接口是 `:initial-email` 与 `@update:email` 配合。提交 trim 后不会再 emit update:email，宿主应以 submit 的值作为最终请求邮箱。

## 本地状态与错误优先级

<!-- source: src/library/shop/ShopEmailSignIn.vue#L6-L13 -->
```ts
const emit = defineEmits<{ submit: [email: string]; reset: []; 'update:email': [email: string] }>()
const email = ref(props.initialEmail)
const input = ref<HTMLInputElement>()
const error = ref('')
const valid = ref(false)
const id = useId()
const visibleError = computed(() => error.value || (props.status === 'error' ? props.errorMessage : ''))
watch(() => props.initialEmail, value => { email.value = value; valid.value = false })
```

`error` 是客户端输入错误，`errorMessage` 是宿主请求失败错误。visibleError 用逻辑或选择：本地错误非空时优先；本地错误为空且 status 为 error 才显示服务端文案。

`valid` 只代表最近一次本地提交校验通过，初始 false；它不是远端账户存在、邮箱所有权或验证码验证状态。它控制绿色 Check 和 `Email address confirmed` 这条局部反馈。

prop initialEmail 更新会清除 valid，但不清除本地 error。输入事件则清除本地 error 与 valid；如果父组件仍保留 status=error，服务端错误还会通过 visibleError 显示。因此通常应在宿主的编辑处理器中将 error 状态复位为 idle。

`id = useId()` 生成错误 / 验证说明的 ID，input 的 aria-describedby 根据可见分支切换到对应节点，避免多实例之间引用同名错误段落。

## 原生校验与提交执行顺序

<!-- source: src/library/shop/ShopEmailSignIn.vue#L14-L15 -->
```ts
function submit() { if (props.status === 'pending') return; email.value = email.value.trim(); if (!input.value?.validity.valid || !email.value) { error.value = 'Enter a valid email address.'; valid.value = false; input.value?.focus(); return } error.value = ''; valid.value = true; emit('submit', email.value) }
function edit() { error.value = ''; valid.value = false; emit('update:email', email.value) }
```

1. pending 状态先返回，防止同一次请求期间通过函数路径重复提交。
2. email 先做 trim，作为之后 emit 的值。
3. 读取原生 input 的 `validity.valid`，并额外检查字符串非空。
4. 不合法时设置本地错误、清除 valid、调用 input.focus，然后 return。
5. 合法时清错误、设置 valid=true、emit submit；不自动设置 pending 或 success。

模板 form 使用 `novalidate`，关闭浏览器默认的提交气泡与阻断行为，但 input 上的 `type="email" required` 仍建立 Constraint Validation API 状态。组件主动读取 validity，并用自己的错误文本展示。

这里没有正则表达式，也没有网络邮箱校验。原生 email 规则不要求所有业务系统采用同样的邮箱策略；服务端仍必须验证输入与发送权限。

email ref 的 trim 不会同步立即改写 DOM，Vue 更新发生在后续渲染；本次 validity 检查读到的是当前 input 节点的值。原生 email 控件本身有值规范化行为，不应把这个实现描述为独立的全功能邮箱解析器。

## 四种状态如何改变 DOM 和鼠标

| status | 输入框 | 提交按钮 | 视图 |
| --- | --- | --- | --- |
| `idle` | 可输入 | Continue + ArrowRight | 标题、表单、协议链接 |
| `pending` | disabled | disabled、Signing in + LoaderCircle | 保留表单，等待宿主 |
| `error` | 可输入 | Continue | visibleError 展示服务端或本地错误 |
| `success` | 原表单被移除 | Use another email | Mail 图标、已发送提示和邮箱 |

pending 的按钮匹配 `.submit:disabled { cursor:wait; opacity:.65 }`。这是 CSS 根据 disabled 属性更换鼠标，不是 submit 函数里给 document.body.style.cursor 赋值。

LoaderCircle 通过 `.loading { animation:spin 1s linear infinite }` 与 `@keyframes spin` 旋转。`prefers-reduced-motion:reduce` 时移除动画与按钮颜色 transition，但 pending 的禁用状态和文字仍保持。

visibleError 非空让 `.email-input.invalid` 产生红色边框，input `aria-invalid` 变为 true，错误节点带 `role="alert"`。valid 反馈则使用 `role="status"`。

成功分支是 `v-if`，不会把旧表单隐藏在页面中继续留在 Tab 顺序。组件没有在成功后主动把焦点转移到新标题，也没有在 reset 后自动聚焦重建的 input。

## 宿主必须完成的异步流程

提交处理器应在发请求前设置 pending，并捕获错误。success 只能在真实发送接口成功返回后设置。reset 事件本身不会改任何 prop，宿主要清邮箱并将 status 改回 idle。

下面示例放在 `src/examples/EmailSignInExample.vue`。它要求宿主实现 `POST /api/auth/email-link`，请求 JSON 为 `{ email: string }`，HTTP 2xx 表示已接受发送。此接口不包含在组件库中；示例的 fetch 是明确的业务连接位置。

<!-- example -->
```vue
<script setup lang="ts">
import { ref } from 'vue'
import ShopEmailSignIn from '../library/shop/ShopEmailSignIn.vue'

type Status = 'idle' | 'pending' | 'success' | 'error'
const email = ref('')
const status = ref<Status>('idle')
const errorMessage = ref('')
function edit(value: string) {
  email.value = value
  if (status.value === 'error') status.value = 'idle'
}
async function sendLink(value: string) {
  if (status.value === 'pending') return
  email.value = value
  status.value = 'pending'
  errorMessage.value = ''
  try {
    const response = await fetch('/api/auth/email-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: value }),
    })
    if (!response.ok) throw new Error(`发送失败 (${response.status})`)
    status.value = 'success'
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '发送失败，请重试'
    status.value = 'error'
  }
}
function reset() {
  email.value = ''
  status.value = 'idle'
  errorMessage.value = ''
}
</script>

<template>
  <ShopEmailSignIn
    :initial-email="email"
    :status="status"
    :error-message="errorMessage"
    @update:email="edit"
    @submit="sendLink"
    @reset="reset"
  />
</template>
```

## 测试与实际限制

[shop-core.test.ts](../src/library/shop/shop-core.test.ts#L37) 先输入 invalid 并断言没有 submit，再输入合法地址并检查精确载荷，确认不会自行出现 Check your email；只有 setProps success 后出现成功页，点击按钮发送 reset。

关键的成功状态边界由下面这段测试直接保证，而不是靠文案约定：

<!-- source: src/library/shop/shop-core.test.ts#L43-L50 -->
```ts
    await wrapper.get('input').setValue('buyer@example.com')
    await wrapper.get('form').trigger('submit')
    expect(wrapper.emitted('submit')?.[0]).toEqual(['buyer@example.com'])
    expect(wrapper.text()).not.toContain('Check your email')
    await wrapper.setProps({ status: 'success' })
    expect(wrapper.text()).toContain('Check your email')
    await wrapper.get('button').trigger('click')
    expect(wrapper.emitted('reset')).toHaveLength(1)
```

该测试未覆盖真实邮件投递、pending 期间原生禁用、自动填充、服务端错误优先级或屏幕阅读器焦点。组件未建立请求、计时器或全局监听，因此不存在内部请求取消或重试退避逻辑。

协议链接在组件内是固定外站地址，`target="_blank" rel="noreferrer"`。复用于非 Shop 品牌时，需要同时审查这些业务地址和文案，不能只改 title。

导出依赖 SFC、ShopBrandMark.vue、Shop 两个字体文件和 lucide 图标。样式 scoped；字体名称仍注册到页面的字体命名空间。
