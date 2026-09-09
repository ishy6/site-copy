<script setup lang="ts">
import { footerGroups } from '../data'
import ShopIcon from './ShopIcon.vue'

defineEmits<{
  navigate: [path: string]
}>()
</script>

<template>
  <footer class="footer">
    <div class="footer-brand">
      <ShopIcon name="wordmark" class="footer-wordmark" />
      <p>Shopping designed around you.</p>
      <div class="download-badges">
        <img class="qr-code" src="/assets/images/shop-download-qr.png" alt="Download Shop QR code" />
        <div>
          <a href="https://open.shop.app/E2jp6/yphyl/7qog"><img src="/assets/app-store-badge.svg" alt="Download on the App Store" /></a>
          <a href="https://open.shop.app/E2jp6/frmk/3n2h"><img src="/assets/google-play-badge.svg" alt="Download on Google Play" /></a>
        </div>
      </div>
    </div>
    <nav v-for="group in footerGroups" :key="group.title" class="footer-group" :aria-label="group.title">
      <strong>{{ group.title }}</strong>
      <a v-for="link in group.links" :key="link.label" :href="link.href">
        {{ link.label }}
        <svg v-if="link.label === 'Your Privacy Choices'" class="privacy-choices-icon" viewBox="0 0 30 14" aria-hidden="true">
          <path d="M7.4 12.8h6.8l3.1-11.6H7.4C4.2 1.2 1.6 3.8 1.6 7s2.6 5.8 5.8 5.8z" fill="#fff" />
          <path d="M22.6 0H7.4c-3.9 0-7 3.1-7 7s3.1 7 7 7h15.2c3.9 0 7-3.1 7-7s-3.2-7-7-7zm-21 7c0-3.2 2.6-5.8 5.8-5.8h9.9l-3.1 11.6H7.4c-3.2 0-5.8-2.6-5.8-5.8z" fill="#06f" />
          <path d="M24.6 4c.2.2.2.6 0 .8L22.5 7l2.2 2.2c.2.2.2.6 0 .8-.2.2-.6.2-.8 0l-2.2-2.2-2.2 2.2c-.2.2-.6.2-.8 0-.2-.2-.2-.6 0-.8L20.8 7l-2.2-2.2c-.2-.2-.2-.6 0-.8.2-.2.6-.2.8 0l2.2 2.2L23.8 4c.2-.2.6-.2.8 0zM12.7 4.1c.2.2.3.6.1.8L8.6 9.8c-.1.1-.2.2-.3.2-.2.1-.5.1-.7-.1L5.4 7.7c-.2-.2-.2-.6 0-.8.2-.2.6-.2.8 0L8 8.6l3.8-4.5c.2-.2.6-.2.9 0z" fill="#fff" />
        </svg>
      </a>
    </nav>
    <div class="footer-bottom">
      <span class="powered-by">Powered by <span class="shopify-lockup"><svg viewBox="0 0 16 18" role="img" aria-label="Shopify"><path d="M13.5 3.4c0-.1-.1-.1-.2-.1l-1.3-.1s-1-1-1.1-1.1c-.1-.1-.3 0-.4 0l-.5.2c-.4-1.2-1.1-2.3-2.5-2.3h-.2C6.9-.1 6.5 0 6.1.3 5.1 1 4.6 2.2 4.4 3.2l-2.1.7c-.7.2-.7.2-.8.9L.2 15.7 10.8 18l4.9-1.1L13.5 3.4ZM9.4 2.5l-1.8.6c.2-.8.6-1.6 1.1-2 .4.2.6.9.7 1.4ZM7.3.7h.1c-.6.6-1.1 1.6-1.3 2.9l-1.2.4C5.2 2.5 6.2.8 7.3.7Z" fill="currentColor"/><path d="M13.3 3.3 12 3.2s-1-1-1.1-1.1l-.2-.1v16l5-1.1-2.2-13.5c0-.1-.1-.1-.2-.1Z" fill="currentColor" opacity=".7"/></svg><b>Shopify</b></span></span><span>|</span>
      <a href="https://www.shopify.com/free-trial">Start selling for free</a>
      <a class="language-link" href="/language-settings" @click.prevent="$emit('navigate', '/language-settings')">Language</a>
      <span>© Shopify Inc. 2026</span>
    </div>
  </footer>
</template>
