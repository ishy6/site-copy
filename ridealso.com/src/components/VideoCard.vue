<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { Pause, Play, Volume2, VolumeX } from "lucide-vue-next";
defineProps<{ src: string; poster: string; index: number }>();
const video = ref<HTMLVideoElement>();
const muted = ref(true);
const paused = ref(true);
const failed = ref(false);
const progress = ref(0);
let observer: IntersectionObserver | undefined;
let visible = false;
let userPaused = false;
const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;
function play() {
  video.value?.play().catch(() => {
    paused.value = true;
  });
}
function togglePlayback() {
  if (!video.value) return;
  userPaused = !video.value.paused;
  if (userPaused) video.value.pause();
  else {
    failed.value = false;
    play();
  }
}
function toggleMute() {
  if (!video.value) return;
  muted.value = !muted.value;
  video.value.muted = muted.value;
  if (video.value.paused) {
    userPaused = false;
    play();
  }
}
function seek(event: Event) {
  if (video.value && Number.isFinite(video.value.duration))
    video.value.currentTime =
      (Number((event.target as HTMLInputElement).value) / 100) *
      video.value.duration;
}
function updateProgress() {
  if (video.value?.duration)
    progress.value = (video.value.currentTime / video.value.duration) * 100;
}
function visibilityChanged() {
  if (document.hidden) video.value?.pause();
  else if (visible && !userPaused && !reducedMotion) play();
}
onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      visible = entries[0].isIntersecting;
      if (visible && !userPaused && !reducedMotion) play();
      else video.value?.pause();
    },
    { threshold: 0.3 },
  );
  if (video.value) {
    video.value.muted = true;
    observer.observe(video.value);
  }
  document.addEventListener("visibilitychange", visibilityChanged);
});
onBeforeUnmount(() => {
  observer?.disconnect();
  video.value?.pause();
  document.removeEventListener("visibilitychange", visibilityChanged);
});
</script>
<template>
  <article class="video-card" :aria-label="`ALSO community video ${index + 1}`">
    <video
      ref="video"
      :src="src"
      :poster="poster"
      muted
      loop
      playsinline
      preload="none"
      @play="paused = false"
      @pause="paused = true"
      @error="failed = true"
      @timeupdate="updateProgress"
    />
    <button
      class="video-mute"
      :aria-label="muted ? 'Unmute video' : 'Mute video'"
      :aria-pressed="!muted"
      @click="toggleMute"
    >
      <VolumeX v-if="muted" :size="24" /><Volume2 v-else :size="24" />
    </button>
    <button
      class="video-play"
      :class="{ paused }"
      :aria-label="paused ? 'Play video' : 'Pause video'"
      @click="togglePlayback"
    >
      <Play v-if="paused" :size="24" /><Pause v-else :size="24" />
    </button>
    <input
      class="video-progress"
      type="range"
      min="0"
      max="100"
      step="0.1"
      :value="progress"
      aria-label="Video progress"
      @input="seek"
    />
    <a
      v-if="failed"
      class="video-fallback"
      href="https://www.instagram.com/ridealso/"
      >Watch on Instagram</a
    >
  </article>
</template>
