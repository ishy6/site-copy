<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue';
import { initializeReference, loadSnapshot, type Snapshot } from './reference';

const snapshot = ref<Snapshot | null>(null);
const loading = ref(true);
const error = ref('');

onMounted(async () => {
  try {
    snapshot.value = await loadSnapshot();
    await nextTick();
    if (snapshot.value) await initializeReference(snapshot.value);
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : 'Unable to load this page.';
  } finally {
    loading.value = false;
    document.documentElement.dataset.replicaReady = 'true';
  }
});
</script>

<template>
  <div v-if="snapshot" class="reference-document" v-html="snapshot.body"></div>
  <div v-if="loading" class="page-loading" role="status" aria-label="Loading Slush"><span>SLUSH</span></div>
  <main v-else-if="error || !snapshot" class="page-error">
    <a href="/" class="page-error-brand">SLUSH</a>
    <h1>{{ error || 'Page not found' }}</h1>
    <a href="/">Back to home</a>
  </main>
</template>
