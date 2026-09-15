<script setup lang="ts">
import { ref, useId, watch } from 'vue'
import { Minus, Plus } from 'lucide-vue-next'
export interface MotionFaq { question: string; answer: string }
const props = withDefaults(defineProps<{ title?: string; initialOpen?: number; items?: MotionFaq[] }>(), {
  title: 'A few good questions.', initialOpen: 0,
  items: () => [
    { question: 'Can I use Jitter for free?', answer: 'Yes. Start with a template, explore your workspace, and create your first project without payment details.' },
    { question: 'Do I need motion design experience?', answer: 'Not at all. Ready-to-use templates make it easy to learn by doing, one animation at a time.' },
    { question: 'Can I import my Figma designs?', answer: 'The official Jitter product supports Figma import. Connect your own import workflow when integrating this component.' },
    { question: 'Where are my projects saved?', answer: 'This local project stores demo files in your browser. Storage and synchronization are provided by the host application.' },
  ],
})
const emit = defineEmits<{ change: [index: number | null] }>()
const id = useId()
const opened = ref<number | null>(props.initialOpen)
watch(() => props.initialOpen, value => { opened.value = value })
function toggle(index: number) { opened.value = opened.value === index ? null : index; emit('change', opened.value) }
</script>
<template><section class="faq-list" :aria-label="title"><h3>{{ title }}</h3><div><article v-for="(item, index) in items" :key="index"><button type="button" :id="`${id}-trigger-${index}`" :aria-expanded="opened === index" :aria-controls="`${id}-answer-${index}`" @click="toggle(index)"><span>{{ item.question }}</span><Minus v-if="opened === index" :size="17" /><Plus v-else :size="17" /></button><div v-show="opened === index" :id="`${id}-answer-${index}`" role="region" :aria-labelledby="`${id}-trigger-${index}`"><p>{{ item.answer }}</p></div></article></div></section></template>
<style scoped>
@font-face{font-family:LibraryLausanne;src:url('/assets/jitter/lausanne-400.woff2') format('woff2');font-weight:400;font-display:swap}
.faq-list{font-family:LibraryLausanne,Arial,sans-serif;color:#19181b;display:grid;grid-template-columns:minmax(0,.8fr) minmax(0,1.2fr);gap:40px;width:100%;max-width:640px;letter-spacing:0}.faq-list *{box-sizing:border-box}h3{font-size:35px;line-height:1.04;font-weight:600;margin:0;overflow-wrap:anywhere}article{border-top:1px solid #e5e2e8}article:last-child{border-bottom:1px solid #e5e2e8}button{display:flex;justify-content:space-between;align-items:center;gap:20px;width:100%;padding:20px 0;background:none;border:0;color:inherit;text-align:left;font:inherit;font-size:13px;line-height:1.4;cursor:pointer}button span{overflow-wrap:anywhere}button svg{flex:none}p{font-size:12px;line-height:1.6;color:#88818e;margin:0;padding-bottom:21px;overflow-wrap:anywhere}button:focus-visible{outline:2px solid #8055cf;outline-offset:2px}@media(max-width:520px){.faq-list{grid-template-columns:1fr;gap:24px}h3{font-size:30px}}
</style>
