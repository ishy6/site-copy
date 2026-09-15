import type { ComponentEntry } from './types'

export const osmoEntries: ComponentEntry[] = [
  {
    id: 'osmo-motion-button', title: 'Rotating Label Button', summary: '沿用 Osmo 的文字旋转动效，支持链接、禁用状态与键盘聚焦。',
    site: 'osmo', category: 'Buttons', loadComponent: () => import('../library/osmo/MotionButton.vue'), tags: ['hover', 'motion', '按钮'],
    source: 'osmo.supply/src/components/MotionButton.vue + ButtonLabel.vue', sourceKind: 'extracted',
    files: ['library/osmo/MotionButton.vue', 'library/osmo/ButtonLabel.vue'], assets: ['/assets/osmo/haffer.ttf'],
    usage: '<script setup lang="ts">\nimport MotionButton from \'./library/osmo/MotionButton.vue\'\n\nfunction onExplore() { console.info(\'Explore selected\') }\n</script>\n\n<template>\n  <MotionButton label="Explore the collection" variant="dark" @click="onExplore" />\n</template>',
    props: [
      { name: 'label', label: '按钮文字', type: 'text', default: 'Explore the collection' },
      { name: 'variant', label: '配色', type: 'select', default: 'dark', options: ['dark', 'lime', 'violet'] },
      { name: 'arrow', label: '箭头图标', type: 'boolean', default: true },
      { name: 'disabled', label: '禁用', type: 'boolean', default: false },
    ], background: '#dcd5fa',
  },
  {
    id: 'osmo-billing-switch', title: 'Billing Period Switch', summary: '方形与圆形组合的计费切换，保留 Osmo 手写注释和键盘选择行为。',
    site: 'osmo', category: 'Forms', loadComponent: () => import('../library/osmo/BillingSwitch.vue'), tags: ['switch', 'pricing', '计费'],
    source: 'osmo.supply/src/components/BillingSwitch.vue', sourceKind: 'extracted',
    files: ['library/osmo/BillingSwitch.vue', 'library/osmo/ButtonLabel.vue'], assets: ['/assets/osmo/haffer.ttf', '/assets/osmo/brisa.woff2'],
    usage: '<script setup lang="ts">\nimport { ref } from \'vue\'\nimport BillingSwitch from \'./library/osmo/BillingSwitch.vue\'\n\nconst billing = ref<\'quarterly\' | \'annual\'>(\'annual\')\n</script>\n\n<template>\n  <div style="background: #201d1d; padding: 32px">\n    <BillingSwitch v-model="billing" savings="Save 20%" />\n  </div>\n</template>',
    props: [
      { name: 'modelValue', label: '计费周期', type: 'select', default: 'annual', options: ['quarterly', 'annual'] },
      { name: 'savings', label: '优惠注释', type: 'text', default: 'Save 20%' },
    ], background: '#201d1d', foreground: '#f4f4f4',
  },
]
