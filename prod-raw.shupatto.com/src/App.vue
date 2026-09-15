<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue';
import { initializeReference, loadSnapshot, type Snapshot } from './reference';

const snapshot = ref<Snapshot | null>(null);
const loading = ref(true);
const error = ref('');
const notFound = ref(false);

onMounted(async () => {
  try {
    snapshot.value = await loadSnapshot();
    notFound.value = !snapshot.value;
    await nextTick();
    if (snapshot.value) await initializeReference(snapshot.value);
  } catch (reason) {
    document.documentElement.className = '';
    error.value = reason instanceof Error ? reason.message : 'Unable to load the page.';
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div v-if="snapshot" class="reference-document" v-html="snapshot.body"></div>
  <div v-if="loading" class="page-loading" role="status" aria-label="Loading Shupatto">
    <span>Shupatto</span>
  </div>
  <main v-else-if="error || notFound" class="page-error">
    <a href="/" class="page-error-brand">Shupatto</a>
    <h1>{{ notFound ? 'Page not found' : error }}</h1>
    <a href="/">BACK TO HOME</a>
  </main>
</template>
