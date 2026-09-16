import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { referencePages } from './scripts/reference-plugin.ts';

export default defineConfig({ plugins: [vue(), referencePages()], server: { strictPort: true }, preview: { strictPort: true } });
