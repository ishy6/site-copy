<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
const container = ref<HTMLElement>();
const ready = ref(false);
const failed = ref(false);
let observer: MutationObserver | undefined;
let visibilityObserver: IntersectionObserver | undefined;
let timeout: number | undefined;
function loadForm() {
  observer = new MutationObserver(() => {
    if (container.value?.querySelector(".klaviyo-form-TeJALY form")) {
      ready.value = true;
      clearTimeout(timeout);
      observer?.disconnect();
    }
  });
  if (container.value)
    observer.observe(container.value, { childList: true, subtree: true });
  if (!document.querySelector("script[data-also-newsletter]")) {
    const script = document.createElement("script");
    script.src =
      "https://static.klaviyo.com/onsite/js/RGF2YV/klaviyo.js?company_id=RGF2YV";
    script.async = true;
    script.dataset.alsoNewsletter = "";
    script.onerror = () => {
      failed.value = true;
    };
    document.head.appendChild(script);
  }
  timeout = window.setTimeout(() => {
    if (!ready.value) failed.value = true;
  }, 15000);
}
onMounted(() => {
  visibilityObserver = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        loadForm();
        visibilityObserver?.disconnect();
      }
    },
    { rootMargin: "300px" },
  );
  if (container.value) visibilityObserver.observe(container.value);
});
onBeforeUnmount(() => {
  observer?.disconnect();
  visibilityObserver?.disconnect();
  clearTimeout(timeout);
});
</script>
<template>
  <div ref="container" class="newsletter-embed">
    <div class="klaviyo-form-TeJALY"></div>
    <div v-if="!ready" class="newsletter-loading" :aria-busy="!failed">
      <div class="email-placeholder">EMAIL</div>
      <button class="pill dark" disabled>SUBMIT</button>
      <p v-if="failed" role="status">
        The form could not load.
        <a href="https://ridealso.com/#footer"
          >Join our mailing list on ALSO.</a
        >
      </p>
      <p v-else>
        By entering your email address, you agree to receive future
        communications from ALSO and have read and agree to ALSO's
        <a href="https://ridealso.com/pages/terms">Terms</a> and acknowledge the
        <a href="https://ridealso.com/pages/privacy">Privacy Policy.</a>
      </p>
    </div>
  </div>
</template>
