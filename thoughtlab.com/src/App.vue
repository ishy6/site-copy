<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref } from 'vue';

const isReference = document.documentElement.hasAttribute('data-reference-route');
const feedback = ref(false);
const formName = ref('');
const dialog = ref<HTMLDialogElement>();
let previousFocus: HTMLElement | null = null;
const close = () => { dialog.value?.close(); feedback.value = false; previousFocus?.focus(); };
const result = async (event: Event) => {
  previousFocus = document.activeElement as HTMLElement;
  formName.value = (event as CustomEvent<{name: string}>).detail.name;
  feedback.value = true;
  await nextTick();
  dialog.value?.showModal();
};
const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') close(); };
onMounted(() => { window.addEventListener('local-form-result', result); document.addEventListener('keydown', escape); });
onUnmounted(() => { window.removeEventListener('local-form-result', result); document.removeEventListener('keydown', escape); });
</script>

<template>
  <section v-if="!isReference" class="local-not-found">
    <a href="/" class="local-brand">THOUGHTLAB</a>
    <p>404</p>
    <h1>Page not found.</h1>
    <a href="/">Back to home</a>
  </section>
    <dialog v-if="feedback" ref="dialog" aria-labelledby="local-dialog-title" class="local-dialog" @cancel.prevent="close">
      <button type="button" class="local-dialog-close" aria-label="Close feedback" @click="close">&#215;</button>
      <p class="local-dialog-eyebrow">{{ formName }}</p>
      <h2 id="local-dialog-title">Local preview</h2>
      <p>Your form is valid. No message, subscription, or attachment has been sent.</p>
      <a href="https://www.thoughtlab.com/contact/" target="_blank" rel="noopener noreferrer">Contact ThoughtLab on the original site</a>
      <button type="button" class="local-dialog-done" @click="close">Close</button>
    </dialog>
</template>
