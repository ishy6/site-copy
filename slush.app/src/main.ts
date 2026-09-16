import { createApp } from 'vue';
import App from './App.vue';
import './style.css';

createApp(App).mount('#app');

// The captured theme declares global animation state and requires a fresh lifecycle.
if (import.meta.hot) import.meta.hot.on('vite:beforeUpdate', () => window.location.reload());
