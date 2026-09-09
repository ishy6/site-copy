<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from "vue";
import { X } from "lucide-vue-next";
const props = defineProps<{ query: string }>();
defineEmits<{ close: [] }>();
type Product = {
  title: string;
  url: string;
  productImage: string;
  price: number;
  salePrice: number;
};
type SearchResponse = {
  collection_data: {
    subcategory_title: string;
    subcategory_products: Product[];
  }[];
}[];
const products = ref<Product[]>([]);
const title = ref("Search Results");
const loading = ref(false);
const error = ref(false);
let timer: number | undefined;
let controller: AbortController | undefined;
const money = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
function productImage(source: string) {
  const path = new URL(source).pathname.replace("/media.makr.com/", "/");
  return `https://media-makr-com.imgix.net${path}?w=700&auto=format&q=75`;
}
async function load() {
  controller?.abort();
  const request = new AbortController();
  controller = request;
  loading.value = true;
  error.value = false;
  try {
    const response = await fetch(
      `https://makr.com/search/results?q=${encodeURIComponent(props.query.trim())}`,
      { signal: request.signal },
    );
    if (!response.ok) throw new Error("Search failed");
    const data: SearchResponse = await response.json();
    if (request.signal.aborted) return;
    products.value = data.flatMap((collection) =>
      collection.collection_data.flatMap((group) => group.subcategory_products),
    );
    title.value =
      data[0]?.collection_data[0]?.subcategory_title ||
      `0 results for ${props.query}`;
  } catch {
    if (!request.signal.aborted) error.value = true;
  } finally {
    if (!request.signal.aborted) loading.value = false;
  }
}
watch(
  () => props.query,
  () => {
    clearTimeout(timer);
    controller?.abort();
    products.value = [];
    loading.value = true;
    timer = window.setTimeout(load, 200);
  },
  { immediate: true },
);
onBeforeUnmount(() => {
  clearTimeout(timer);
  controller?.abort();
});
</script>
<template>
  <section
    class="search-results"
    aria-labelledby="search-title"
    :aria-busy="loading"
  >
    <div class="search-heading">
      <h1 id="search-title">Search Results</h1>
      <button aria-label="Close search results" @click="$emit('close')">
        <X :size="22" />
      </button>
    </div>
    <p class="search-status" role="status">
      {{
        loading
          ? "Searching..."
          : error
            ? "Search is temporarily unavailable."
            : title
      }}
    </p>
    <button v-if="error" class="search-retry" @click="load">Try again</button>
    <div class="search-grid">
      <a
        v-for="product in products"
        :key="product.url"
        :href="product.url"
        class="search-product"
        ><img
          :src="productImage(product.productImage)"
          :alt="product.title"
          loading="lazy"
        />
        <div>
          <h2>{{ product.title }}</h2>
          <p>
            <del v-if="product.salePrice < product.price">{{
              money(product.price)
            }}</del>
            {{ money(product.salePrice || product.price) }}
          </p>
        </div></a
      >
    </div>
  </section>
</template>
