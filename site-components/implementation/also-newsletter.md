# Newsletter Form：原生校验、同意状态与异步订阅

组件 ID：`also-newsletter`。

订阅表单将邮箱有效性、用户同意、请求中禁用、失败重试和成功后修改邮箱封装为一条明确流程。没有接入服务时只完成本地校验，不宣称真实订阅成功。

## 源码与依赖

- [NewsletterForm.vue](../src/library/also/NewsletterForm.vue#L1)：表单状态、原生验证与提交。
- [newsletter.spec.ts](../src/library/also/newsletter.spec.ts#L6)：邮箱和同意必填、服务失败重试、完成后防重复。

运行依赖 Vue、`lucide-vue-next`、ALSO Camera 与 Serial 字体。没有引入表单校验库，邮箱格式和 required 规则由 HTML Constraint Validation API 执行。

## Props 与回调

| 参数 | 类型 | 默认值 | 用途 |
| --- | --- | --- | --- |
| `title` | `string` | `Stay in the loop.` | 主标题 |
| `description` | `string` | `Join our mailing list.` | 说明文字 |
| `placeholder` | `string` | `EMAIL` | 邮箱输入占位 |
| `buttonLabel` | `string` | `Submit` | 初始按钮文案 |
| `background` | `string` | `#ac74fc` | 根节点 backgroundColor |
| `disabled` | `boolean` | `false` | 禁用填写和提交 |
| `onSubscribe` | `(email: string) => Promise<void>` | 未设置 | 可等待的实际订阅过程 |

组件没有 initialEmail、modelValue 或 initialConsent；每次创建实例，邮箱为空且同意为 false。背景接受 CSS 颜色字符串，不做额外色值验证。

## 状态及表单引用

<!-- source: src/library/also/NewsletterForm.vue#L21-L29 -->
```ts
const emit = defineEmits<{ submit: [email: string]; success: [email: string]; failure: [message: string] }>()
const id = useId()
const email = ref('')
const consent = ref(false)
const pending = ref(false)
const complete = ref(false)
const error = ref('')
const form = ref<HTMLFormElement>()
const input = ref<HTMLInputElement>()
```

`email` 与 `consent` 是用户输入；`pending` 表示正在等待回调，`complete` 表示当前邮箱流程完成，`error` 保存最后失败信息。

`form` 用于调用原生 reportValidity，`input` 用于成功后修改邮箱时恢复焦点。`id` 让多个实例的标题关联不冲突。

组件没有 watch 自动重置完成状态。改变标题、背景或 disabled 不会清空邮箱或让 complete 自动回到 false。

## 原生验证链

<!-- source: src/library/also/NewsletterForm.vue#L55-L63 -->
```vue
    <form ref="form" :aria-busy="pending" @submit.prevent="submit">
      <label class="also-newsletter__email">
        <span class="also-newsletter__sr-only">Email address</span>
        <input ref="input" v-model="email" type="email" name="email" autocomplete="email" required :placeholder="placeholder" :disabled="disabled || pending || complete" />
      </label>
      <label class="also-newsletter__consent">
        <input v-model="consent" type="checkbox" required :disabled="disabled || pending || complete" />
        <span>I agree to receive emails from ALSO.</span>
      </label>
```

邮箱使用 type=email 和 required，同意复选框同样 required。浏览器负责格式与必填检查，表单提交函数再调用 reportValidity() 统一处理直接函数触发等情况。

这里没有用手写正则匹配邮箱，也没有发送验证邮件来确认地址所有权。原生校验通过仅代表输入满足浏览器规则。

`@submit.prevent` 阻止表单默认页面导航。用户点击 submit 或在输入框按 Enter 都走表单提交路径；原生键盘行为不需要额外 keydown 监听。

v-model 根据原生输入事件同步 email，根据 checkbox change 同步 consent。没有拖拽、指针捕获或 JavaScript 修改 cursor。

## 异步提交与事件顺序

<!-- source: src/library/also/NewsletterForm.vue#L31-L47 -->
```ts
async function submit() {
  if (pending.value || complete.value || props.disabled || !form.value?.reportValidity()) return
  error.value = ''
  pending.value = true
  const submittedEmail = email.value.trim()
  emit('submit', submittedEmail)
  try {
    await props.onSubscribe?.(submittedEmail)
    complete.value = true
    emit('success', submittedEmail)
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Something went wrong. Please try again.'
    emit('failure', error.value)
  } finally {
    pending.value = false
  }
}
```

前置守卫同时阻止请求中重复提交、完成后重复提交、整体禁用和原生验证不通过。仅当全部通过才清除旧错误、开启 pending，并把 trim 后的邮箱存入局部常量。

事件与回调的顺序是 `submit(email)` → `await onSubscribe(email)` → `success(email)`，异常时改为 `failure(message)`，最终无论成败都解除 pending。

| 输出 | payload | 语义 |
| --- | --- | --- |
| `submit` | `string` | 已通过本地校验且即将提交的邮箱 |
| `success` | `string` | 可选回调成功后的邮箱 |
| `failure` | `string` | Error.message 或默认失败文案 |
| `onSubscribe` | `string` | 真正被等待的服务回调 |

`:on-subscribe` 是函数 prop；组件没有名为 subscribe 的 emit。`@submit` 的 Promise 返回值不会被等待，不应把真正的请求仅写在 @submit 监听器里。

未传回调时 optional call 得到 undefined，await 后仍设置 complete。界面明确显示 `Email validated` 和 `Your email is ready to submit.`，避免误报已订阅。

失败保留邮箱和 consent，用户可以直接重新提交；complete 保持 false。成功后输入、同意和提交按钮都禁用，直到用户选择 Change email。

## 重新编辑与焦点

<!-- source: src/library/also/NewsletterForm.vue#L48-L48 -->
```ts
async function reset() { complete.value = false; error.value = ''; await nextTick(); input.value?.focus() }
```

reset 不清空原邮箱，也不取消同意，只解除完成态并清除错误。await nextTick 等待 disabled 从输入 DOM 移除后，再 focus 邮箱框，保证焦点落在可交互控件。

这里没有自动重发机制或倒计时；Change email 只是恢复编辑。如果业务要求每次修改邮箱重新同意，需要在契约中明确增加重置 consent 的规则。

## DOM 与样式反馈

pending 绑定表单 aria-busy，按钮文字变为 Submitting，图标切到 LoaderCircle。失败文本使用 role=alert，整个反馈区 aria-live=polite。

按钮默认 pointer，disabled 时 default 和较低透明度；按下效果是 CSS `:active:not(:disabled)` 的 translateY(2px) 与移除阴影。不是拖拽位置更新。

圆角胶囊按钮沿用 ALSO 原站形态；focus-visible 和邮箱父级 focus-within 显示轮廓。反馈区 min-height 减少成功/失败文案造成的垂直跳动。

减少动态效果偏好下关闭按钮过渡和 spinner 动画，状态文本保持可读。没有全局事件和定时器。

## 完整接入示例

示例放在 `src/examples/NewsletterExample.vue`；`/api/newsletter` 是宿主需要提供的接口。

<!-- example -->
```vue
<script setup lang="ts">
import { ref } from 'vue'
import NewsletterForm from '../library/also/NewsletterForm.vue'

const subscribed = ref('')
async function subscribe(email: string): Promise<void> {
  const response = await fetch('/api/newsletter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, consent: true }),
  })
  if (!response.ok) throw new Error('暂时无法订阅，请稍后重试。')
}
</script>

<template>
  <NewsletterForm
    title="订阅动态"
    description="ALSO 最新消息"
    button-label="提交"
    :on-subscribe="subscribe"
    @success="subscribed = $event"
  />
  <output v-if="subscribed">{{ subscribed }}</output>
</template>
```

## 已验证和限制

测试覆盖空表单阻止提交、有邮箱但未同意仍阻止、无服务时只显示本地验证结果、请求失败保留输入、重试成功及完成后防重复。

没有内置请求超时、AbortController 或卸载取消，宿主 Promise 仍会继续。组件不负责发送邮件、双重确认、退订和服务端去重。

同意说明固定提到 ALSO，当前没有 consentLabel prop。用于其他品牌前需要扩展文字接口，不能只改 title 就认为整份订阅条款已适配。
