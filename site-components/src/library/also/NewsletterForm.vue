<script setup lang="ts">
import { nextTick, ref, useId } from 'vue'
import { ArrowRight, Check, LoaderCircle } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  title?: string
  description?: string
  placeholder?: string
  buttonLabel?: string
  background?: string
  disabled?: boolean
  onSubscribe?: (email: string) => Promise<void>
}>(), {
  title: 'Stay in the loop.',
  description: 'Join our mailing list.',
  placeholder: 'EMAIL',
  buttonLabel: 'Submit',
  background: '#ac74fc',
  disabled: false,
})
const emit = defineEmits<{ submit: [email: string]; success: [email: string]; failure: [message: string] }>()
const id = useId()
const email = ref('')
const consent = ref(false)
const pending = ref(false)
const complete = ref(false)
const error = ref('')
const form = ref<HTMLFormElement>()
const input = ref<HTMLInputElement>()

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
async function reset() { complete.value = false; error.value = ''; await nextTick(); input.value?.focus() }
</script>

<template>
  <section class="also-newsletter" :style="{ backgroundColor: background }" :aria-labelledby="`${id}-title`">
    <h3 :id="`${id}-title`">{{ title }}</h3>
    <p class="also-newsletter__intro">{{ description }}</p>
    <form ref="form" :aria-busy="pending" @submit.prevent="submit">
      <label class="also-newsletter__email">
        <span class="also-newsletter__sr-only">Email address</span>
        <input ref="input" v-model="email" type="email" name="email" autocomplete="email" required :placeholder="placeholder" :disabled="disabled || pending || complete" />
      </label>
      <label class="also-newsletter__consent">
        <input v-model="consent" type="checkbox" required :disabled="disabled || pending || complete" />
        <span>I agree to receive emails from ALSO.</span>
      </label>
      <button class="also-newsletter__submit" type="submit" :disabled="disabled || pending || complete">
        <span>{{ pending ? 'Submitting' : complete ? (onSubscribe ? 'Subscribed' : 'Email validated') : buttonLabel }}</span>
        <LoaderCircle v-if="pending" class="also-newsletter__spinner" :size="16" aria-hidden="true" />
        <Check v-else-if="complete" :size="17" aria-hidden="true" />
        <ArrowRight v-else :size="17" aria-hidden="true" />
      </button>
      <div class="also-newsletter__feedback" aria-live="polite">
        <p v-if="error" role="alert">{{ error }}</p>
        <p v-else-if="complete">{{ onSubscribe ? 'You are on the list.' : 'Your email is ready to submit.' }} <button type="button" @click="reset">Change email</button></p>
      </div>
    </form>
  </section>
</template>

<style scoped>
@font-face { font-family: 'Library ALSO Camera'; src: url('/assets/also/ABCCameraPlainVariable.woff2') format('woff2'); font-weight: 100 900; font-display: swap; }
@font-face { font-family: 'Library ALSO Serial'; src: url('/assets/also/SerialC-Bold.woff2') format('woff2'); font-weight: 700 900; font-display: swap; }
.also-newsletter { width: min(100%, 480px); color: #0b0b0b; padding: 30px; font: 13px/1.4 'Library ALSO Camera', Arial, sans-serif; letter-spacing: 0; }
.also-newsletter, .also-newsletter * { box-sizing: border-box; }
.also-newsletter h3 { margin: 0; font-size: 32px; font-weight: 400; line-height: 1.1; overflow-wrap: anywhere; }
.also-newsletter__intro { margin: 8px 0 24px; overflow-wrap: anywhere; }
.also-newsletter__email { display: block; border-bottom: 1px solid #0b0b0b; }
.also-newsletter__email input { width: 100%; min-width: 0; height: 38px; padding: 0 0 9px; border: 0; border-radius: 0; background: none; color: #0b0b0b; font: 700 16px/24px 'Library ALSO Serial', Arial, sans-serif; }
.also-newsletter__email input::placeholder { color: #0b0b0b; opacity: 1; }
.also-newsletter__email input:focus { outline: none; }
.also-newsletter__email:focus-within { outline: 2px solid #0b0b0b; outline-offset: 4px; }
.also-newsletter__consent { display: flex; align-items: start; gap: 8px; margin: 14px 0; font-size: 11px; cursor: pointer; }
.also-newsletter__consent input { accent-color: #111; width: 14px; height: 14px; flex-shrink: 0; margin: 0; }
.also-newsletter__submit { display: flex; align-items: center; justify-content: center; gap: 14px; width: 100%; min-height: 42px; padding: 10px 15px; border: 1px solid #111; border-radius: 999px; background: #111; color: #fff; box-shadow: 0 2px 0 #111; font: 900 13px/20px 'Library ALSO Serial', Arial, sans-serif; text-transform: uppercase; cursor: pointer; transition: background .2s, transform .2s; }
.also-newsletter__submit svg { flex-shrink: 0; }
.also-newsletter__submit:hover:not(:disabled) { background: #303030; }
.also-newsletter__submit:active:not(:disabled) { transform: translateY(2px); box-shadow: none; }
.also-newsletter__submit:disabled { cursor: default; opacity: .75; }
.also-newsletter__submit:focus-visible, .also-newsletter__consent input:focus-visible, .also-newsletter__feedback button:focus-visible { outline: 2px solid #111; outline-offset: 4px; }
.also-newsletter__feedback { min-height: 26px; padding-top: 10px; font-size: 11px; overflow-wrap: anywhere; }
.also-newsletter__feedback p { margin: 0; }
.also-newsletter__feedback button { border: 0; padding: 0; color: inherit; background: none; font: inherit; text-decoration: underline; cursor: pointer; }
.also-newsletter__spinner { animation: also-newsletter-spin .8s linear infinite; }
.also-newsletter__sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
@keyframes also-newsletter-spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { .also-newsletter__submit { transition: none; } .also-newsletter__spinner { animation: none; } }
</style>
