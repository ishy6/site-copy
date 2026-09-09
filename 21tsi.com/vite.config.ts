import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: {
    rollupOptions: {
      input: {
        home: 'index.html',
        french: 'fr/index.html',
        jobs: 'job-offers/index.html',
        jobsFrench: 'fr/offres-d-emploi/index.html',
        legal: 'legal-notice/index.html',
        privacyFrench: 'fr/politique-de-confidentialite/index.html',
      },
    },
  },
})
