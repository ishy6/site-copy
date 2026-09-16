import { createApp } from 'vue';
import App from './App.vue';
import './local.css';

createApp(App).mount('#local-app');

function enhancePage() {
  const menu = document.querySelector<HTMLElement>('.js-menu');
  const toggle = document.querySelector<HTMLButtonElement>('.js-menu-toggle');
  if (menu && toggle && !toggle.hasAttribute('aria-controls')) {
    menu.id = 'site-menu';
    toggle.setAttribute('aria-label', 'Open menu');
    toggle.setAttribute('aria-controls', menu.id);
    const update = () => {
      const open = document.body.classList.contains('menu-is-open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };
    new MutationObserver(update).observe(menu, {attributes: true, attributeFilter: ['class', 'style']});
    new MutationObserver(update).observe(document.body, {attributes: true, attributeFilter: ['class']});
    toggle.addEventListener('click', () => setTimeout(update, 500));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') toggle.click();
    });
    update();
  }
  document.querySelectorAll<HTMLInputElement>('form input[type="email"]').forEach(input => {
    input.required = true;
    if (!input.labels?.length) input.setAttribute('aria-label', 'Email address');
  });
}

document.addEventListener('submit', event => {
  if (!(event.target instanceof HTMLFormElement)) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  const form = event.target;
  if (!form.reportValidity()) return;
  window.dispatchEvent(new CustomEvent('local-form-result', { detail: { name: form.getAttribute('name') || 'Contact', source: 'https://www.thoughtlab.com/contact/' } }));
}, true);

document.addEventListener('input', event => {
  if (event.target instanceof HTMLSelectElement && event.target.id === 'categories') {
    event.stopImmediatePropagation();
    location.assign(event.target.value);
  }
}, true);

enhancePage();
new MutationObserver(enhancePage).observe(document.querySelector('main') || document.body, { childList: true, subtree: true });
