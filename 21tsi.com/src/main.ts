import { createApp } from 'vue'
import App from './App.vue'

const mountPoint = document.querySelector('#replica-runtime')

if (mountPoint) {
  createApp(App).mount(mountPoint)
}
