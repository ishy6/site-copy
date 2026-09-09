import { defineConfig, type ProxyOptions } from 'vite'
import vue from '@vitejs/plugin-vue'

const wiseReferenceProxy: ProxyOptions = {
  target: 'https://wise.com',
  changeOrigin: true,
  headers: { 'accept-language': 'zh-CN,zh;q=0.9' },
  rewrite: (path) => path.replace(/^\/wise-reference/, '/zh-hk'),
}

const wiseRatesProxy: ProxyOptions = {
  target: 'https://wise.com',
  changeOrigin: true,
  rewrite: (path) => path.replace(/^\/wise-rates/, '/rates/history+live'),
}

export default defineConfig({
  plugins: [vue()],
  server: { proxy: { '/wise-reference': wiseReferenceProxy, '/wise-rates': wiseRatesProxy } },
  preview: { proxy: { '/wise-reference': wiseReferenceProxy, '/wise-rates': wiseRatesProxy } },
})
