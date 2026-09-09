(() => {
  const currentUrl = new URL(location.href);
  if (currentUrl.pathname.startsWith('/reference/') && currentUrl.searchParams.has('__route')) {
    history.replaceState(null, '', currentUrl.searchParams.get('__route'));
  }
  const selectedView = new URLSearchParams(location.search).get('view');
  const selectedPage = new URLSearchParams(location.search).get('page');
  const selectedRoute = location.pathname + (selectedView ? `?view=${selectedView}` : selectedPage ? `?page=${selectedPage}` : '');
  const selectedSnapshot = window.__alsoReferenceRoutes?.[selectedRoute];
  if ((selectedView || selectedPage) && selectedSnapshot && !selectedSnapshot.partial && document.documentElement.dataset.referenceRoute !== selectedRoute) {
    location.replace(`/reference/${selectedSnapshot.file}?__route=${encodeURIComponent(location.pathname + location.search + location.hash)}`);
    return;
  }
  window.Shopify = { routes: { root: '/' }, locale: 'en', country: 'US', currency: { active: 'USD' }, theme: { id: 158376952032 } };
  const nativeFetch = window.fetch.bind(window);
  const money = value => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value / 100);
  const key = 'also-replica-cart-v1';
  const emptyCart = () => ({ note: null, attributes: {}, original_total_price: 0, total_price: 0, total_discount: 0, total_weight: 0, item_count: 0, items: [], requires_shipping: false, currency: 'USD', items_subtotal_price: 0, cart_level_discount_applications: [], checkout_charge_amount: 0 });
  let cart;
  try { cart = JSON.parse(localStorage.getItem(key)) || emptyCart(); } catch { cart = emptyCart(); }
  let catalogPromise;
  const catalog = () => catalogPromise ||= nativeFetch('/reference/products.json').then(response => response.json());
  let collectionHtml;
  async function filteredCollection(url) {
    collectionHtml ||= nativeFetch('/reference/collections__gear.html').then(response => response.text());
    const [html, products, categories] = await Promise.all([collectionHtml, catalog(), nativeFetch('/reference/categories.json').then(response => response.json())]);
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const types = url.searchParams.getAll('filter.p.m.filters.product_type');
    const legacyTypes = url.searchParams.get('filter[product_type]')?.split(',') || [];
    for (const [id, category] of Object.entries(categories)) if (legacyTypes.includes(category.label)) types.push(id);
    const allowed = types.length ? new Set(types.flatMap(type => categories[type]?.handles || [])) : null;
    const minimum = Number(url.searchParams.get('filter.v.price.gte') || 0) * 100;
    const maximum = Number(url.searchParams.get('filter.v.price.lte') || Infinity) * 100;
    let count = 0;
    doc.querySelectorAll('[data-filter-results] collection-grid-tile').forEach(tile => {
      const handle = tile.dataset.productHandle;
      if (!handle) return;
      const product = products[handle];
      const price = product?.price ?? 0;
      if ((allowed && !allowed.has(handle)) || price < minimum || price > maximum) tile.remove();
      else count++;
    });
    const results = doc.querySelector('[data-filter-results]');
    if (results) results.dataset.count = String(count);
    const empty = doc.querySelector('[data-collection-empty-slot]');
    if (empty) empty.hidden = count > 0;
    doc.querySelectorAll('[name^="filter"]').forEach(input => {
      if (input.type === 'checkbox') {
        input.checked = types.includes(input.value);
        input.toggleAttribute('checked', input.checked);
      } else input.setAttribute('value', url.searchParams.get(input.name) || '');
    });
    return '<!doctype html>' + doc.documentElement.outerHTML;
  }
  const json = value => new Response(JSON.stringify(value), { headers: { 'Content-Type': 'application/json' } });
  const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
  function saveCart() {
    cart.items = cart.items.filter(item => item.quantity > 0);
    for (const item of cart.items) item.line_price = item.final_line_price = item.original_line_price = item.quantity * item.price;
    cart.item_count = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cart.total_price = cart.original_total_price = cart.items_subtotal_price = cart.checkout_charge_amount = cart.items.reduce((sum, item) => sum + item.line_price, 0);
    cart.requires_shipping = !!cart.item_count;
    localStorage.setItem(key, JSON.stringify(cart));
  }
  async function addItem(input) {
    const products = await catalog();
    let product, variant;
    for (const entry of Object.values(products)) {
      const match = entry.variants.find(candidate => String(candidate.id) === String(input.id));
      if (match) { product = entry; variant = match; break; }
    }
    if (!variant) {
      const deposits = await nativeFetch('/reference/deposits.json').then(response => response.json());
      const deposit = deposits[input.id];
      if (deposit) {
        const bike = products[deposit.source_path.split('/').pop()];
        product = { id: bike?.id, title: `${deposit.product_title} Reservation`, handle: bike?.handle || 'tm-b-reservation', vendor: 'ALSO', type: 'Reservation', options: ['Configuration'], featured_image: deposit.images[0] };
        variant = { id: Number(input.id), title: deposit.title, price: deposit.deposit_variant_price, sku: deposit.sku, options: [deposit.title] };
      }
    }
    if (!variant) throw new Error('This configuration is not available. Please choose another option.');
    const properties = input.properties || {};
    const itemKey = `${variant.id}:${JSON.stringify(properties)}`;
    let item = cart.items.find(candidate => candidate.key === itemKey);
    if (item) item.quantity += Math.max(1, Number(input.quantity) || 1);
    else {
      item = {
        id: variant.id, variant_id: variant.id, product_id: product.id, key: itemKey,
        quantity: Math.max(1, Number(input.quantity) || 1), properties, title: `${product.title} - ${variant.title}`,
        product_title: product.title, variant_title: variant.title, price: variant.price, final_price: variant.price,
        original_price: variant.price, discounted_price: variant.price, sku: variant.sku, vendor: product.vendor,
        product_type: product.type, handle: product.handle, url: `/products/${product.handle}?variant=${variant.id}`,
        image: variant.featured_image?.src || product.featured_image, featured_image: variant.featured_image || { url: product.featured_image },
        options_with_values: product.options.map((option, i) => ({ name: option.name || option, value: variant.options[i] })),
        discounts: [], line_level_discount_allocations: [], requires_shipping: true, taxable: true,
      };
      cart.items.push(item);
    }
    saveCart();
    return item;
  }
  function cartMarkup() {
    return `<div class="cart__items" data-cart-items aria-label="Cart items">${cart.items.map((item, index) => `
      <article class="local-cart-item" data-cart-item-index="${index}">
        <a href="${escape(item.url)}"><img src="${escape(item.image)}" alt="${escape(item.product_title)}"></a>
        <div><a class="local-cart-item__title" href="${escape(item.url)}">${escape(item.product_title)}</a>
          <p>${escape(item.variant_title === 'Default Title' ? '' : item.variant_title)}</p>
          ${Object.entries(item.properties).filter(([name]) => !name.startsWith('_')).map(([name, value]) => `<p>${escape(name)}: ${escape(value)}</p>`).join('')}
          <div class="local-cart-item__actions"><div class="local-cart-quantity"><button type="button" data-local-quantity="${index}" data-delta="-1" aria-label="Decrease ${escape(item.product_title)} quantity">−</button><input aria-label="${escape(item.product_title)} quantity" data-local-count="${index}" type="number" min="1" max="99" value="${item.quantity}"><button type="button" data-local-quantity="${index}" data-delta="1" aria-label="Increase ${escape(item.product_title)} quantity">+</button></div><button type="button" data-local-remove="${index}">Remove</button></div>
        </div><strong>${money(item.line_price)}</strong>
      </article>`).join('')}</div>`;
  }
  function renderCart() {
    document.querySelectorAll('[data-cart-items]').forEach(container => {
      container.innerHTML = new DOMParser().parseFromString(cartMarkup(), 'text/html').body.firstElementChild.innerHTML;
    });
  }
  window.fetch = async function(input, init = {}) {
    const url = new URL(input instanceof Request ? input.url : String(input), location.origin);
    if (url.hostname === 'ridealso.com' && url.protocol === 'http:') url.protocol = 'https:';
    const local = url.origin === location.origin;
    if (local && url.pathname === '/collections/gear' && [...url.searchParams.keys()].some(name => name.startsWith('filter'))) {
      return new Response(await filteredCollection(url), { headers: { 'Content-Type': 'text/html' } });
    }
    if (local && /^\/cart(?:\/(add|change|update|clear))?\.js$/.test(url.pathname)) {
      let body = {};
      const supplied = init.body || (input instanceof Request ? await input.clone().text() : '');
      if (supplied instanceof FormData) body = Object.fromEntries(supplied);
      else if (supplied) { try { body = JSON.parse(String(supplied)); } catch { body = Object.fromEntries(new URLSearchParams(String(supplied))); } }
      if (url.pathname.includes('/add')) {
        try { return json({ items: await Promise.all((body.items || [body]).map(addItem)) }); }
        catch (error) { return json({ status: 422, description: error.message }); }
      }
      if (url.pathname.includes('/clear')) cart = emptyCart();
      if (url.pathname.includes('/change')) {
        const item = body.line ? cart.items[Number(body.line) - 1] : cart.items.find(entry => String(entry.id) === String(body.id) || entry.key === body.id);
        if (item) item.quantity = Math.max(0, Math.min(99, Number(body.quantity) || 0));
      }
      if (url.pathname.includes('/update')) {
        if (body.attributes) cart.attributes = { ...cart.attributes, ...body.attributes };
        if ('note' in body) cart.note = body.note;
        for (const [id, quantity] of Object.entries(body.updates || {})) {
          const item = cart.items.find(entry => String(entry.id) === id || entry.key === id);
          if (item) item.quantity = Math.max(0, Number(quantity) || 0);
        }
      }
      saveCart();
      return json(cart);
    }
    if (local && url.pathname === '/recommendations/products.json') {
      const recommendations = await nativeFetch('/reference/recommendations.json').then(response => response.json());
      return json(recommendations[url.searchParams.get('product_id')] || { products: [] });
    }
    if (local && /^\/products\/[^/]+\.js$/.test(url.pathname)) return json((await catalog())[url.pathname.split('/').pop().replace(/\.js$/, '')] || {});
    if (local && url.searchParams.has('view')) {
      const snapshot = window.__alsoReferenceRoutes?.[url.pathname + '?view=' + url.searchParams.get('view')];
      if (snapshot?.partial) return nativeFetch('/reference/' + snapshot.file, init);
    }
    if (local && url.searchParams.has('sections') && document.querySelector('[data-cart-items]')) {
      return json(Object.fromEntries(url.searchParams.get('sections').split(',').map(section => [section, cartMarkup()])));
    }
    if (local && url.pathname === '/account' && url.searchParams.get('view') === 'data') return json({ customer: { identity: {}, account: {}, subscriptions: {}, profiles: [{ preferences: {} }] } });
    return nativeFetch(url.href, init);
  };
  const play = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function(...args) {
    const result = play.apply(this, args);
    return result?.catch(error => { if (error.name !== 'AbortError') throw error; });
  };
  function externalDialog(url, title, message) {
    document.querySelector('.local-external-dialog')?.remove();
    const dialog = document.createElement('dialog');
    dialog.className = 'local-external-dialog';
    dialog.innerHTML = `<button class="local-dialog-close" aria-label="Close">×</button><h2>${escape(title)}</h2><p>${escape(message)}</p><a class="button button--primary button--large" href="${escape(url)}">Continue on ALSO</a>`;
    document.body.append(dialog);
    dialog.querySelector('button').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
    dialog.addEventListener('close', () => dialog.remove());
    dialog.showModal();
  }
  document.addEventListener('click', async event => {
    const authenticatedAction = event.target.closest('[data-requires-login]');
    if (authenticatedAction) {
      event.preventDefault(); event.stopImmediatePropagation();
      location.href = '/account/login?return_url=' + encodeURIComponent(location.pathname + location.search);
      return;
    }
    const provider = event.target.closest('[data-identity-provider]');
    if (provider) {
      event.preventDefault(); event.stopImmediatePropagation();
      externalDialog('https://ridealso.com/account/login' + location.search, 'Continue signing in', 'Continue securely on ridealso.com to sign in with ' + (provider.dataset.identityProvider === 'Google' ? 'Google.' : 'Apple.'));
      return;
    }
    const remove = event.target.closest('[data-local-remove]');
    const quantity = event.target.closest('[data-local-quantity]');
    if (remove || quantity) {
      event.preventDefault();
      const index = Number(remove?.dataset.localRemove ?? quantity.dataset.localQuantity);
      await window.Cart.change({ line: index + 1, quantity: remove ? 0 : cart.items[index].quantity + Number(quantity.dataset.delta) });
      renderCart();
      return;
    }
    const anchor = event.target.closest('a[href]');
    if (!anchor || anchor.closest('.local-external-dialog') || anchor.hasAttribute('data-also-external')) return;
    const url = new URL(anchor.href, location.origin);
    if (anchor.dataset.action === 'deposit' && anchor.closest('configurator-app')) return;
    if (url.origin === location.origin && /^\/cart\/add(?:\/\d+)?$/.test(url.pathname)) {
      event.preventDefault(); event.stopImmediatePropagation();
      const id = url.pathname.split('/')[3] || url.searchParams.get('id');
      if (!id) return;
      anchor.setAttribute('aria-busy', 'true');
      try {
        await addItem({ id, quantity: 1 });
        location.href = '/cart';
      } catch (error) {
        anchor.removeAttribute('aria-busy');
        externalDialog('https://ridealso.com' + url.pathname + url.search, 'Complete your reservation', error.message);
      }
    } else if (url.origin === location.origin && url.pathname.startsWith('/checkout')) {
      event.preventDefault(); event.stopImmediatePropagation();
      if (!cart.item_count) return;
      externalDialog(`https://ridealso.com/cart/${cart.items.map(item => `${item.variant_id}:${item.quantity}`).join(',')}`, 'Continue to checkout', 'Checkout and payment are completed securely on ridealso.com. Your selected items will be transferred to ALSO.');
    }
  }, true);
  document.addEventListener('submit', event => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || !(form.closest('cognito-auth-form') || /^\/account/.test(form.getAttribute('action') || ''))) return;
    event.preventDefault(); event.stopImmediatePropagation();
    if (!form.reportValidity()) return;
    externalDialog('https://ridealso.com/account/login' + location.search, 'Continue signing in', 'Complete sign-in securely on ridealso.com. This preview has not sent a login code or submitted your account details.');
  }, true);
  document.addEventListener('change', async event => {
    const input = event.target.closest('[data-local-count]');
    if (input) {
      await window.Cart.change({ line: Number(input.dataset.localCount) + 1, quantity: Math.max(1, Math.min(99, Number(input.value) || 1)) });
      renderCart();
    }
  });
  document.addEventListener('DOMContentLoaded', async () => {
    window.cart = cart;
    const addId = location.pathname === '/cart' && new URLSearchParams(location.search).get('add');
    if (addId) {
      try { await addItem({ id: addId, quantity: 1 }); } catch (error) { externalDialog('https://ridealso.com/cart', 'Item unavailable', error.message); }
      history.replaceState(null, '', '/cart');
    }
    if (window.Cart) window.Cart.get().then(renderCart);
    document.querySelectorAll('configurator-app').forEach(app => {
      const synchronizeVariant = () => {
        const variant = app._variant;
        if (!variant) return;
        app.querySelectorAll('canvas').forEach(canvas => canvas.setAttribute('aria-label', variant.title));
        app.querySelectorAll('[data-action="deposit"]').forEach(action => {
          action.dataset.targetUrl = location.pathname + '?variant=' + variant.id + '&view=configure';
        });
      };
      app.addEventListener('change', () => requestAnimationFrame(synchronizeVariant));
      synchronizeVariant();
    });
    document.querySelectorAll('a[href]').forEach(anchor => {
      if (anchor.hasAttribute('data-also-external')) return;
      const url = new URL(anchor.href, location.origin);
      if (url.origin === 'https://ridealso.com') anchor.href = url.pathname + url.search + url.hash;
    });
    if (location.pathname === '/checkout' && cart.item_count) {
      document.querySelector('[data-also-external]').href = `https://ridealso.com/cart/${cart.items.map(item => `${item.variant_id}:${item.quantity}`).join(',')}`;
    }
    if (location.pathname === '/collections/gear' && [...new URLSearchParams(location.search).keys()].some(name => name.startsWith('filter'))) {
      document.querySelector('collection-facets')?.apply(location.pathname + location.search, false);
    }
    document.querySelectorAll('.klaviyo-form-TeJALY').forEach(slot => {
      if (slot.querySelector('form')) return;
      const form = document.createElement('form');
      form.className = 'local-newsletter';
      form.noValidate = true;
      form.innerHTML = '<label class="sr-only" for="also-newsletter-email">Email</label><input id="also-newsletter-email" name="email" type="email" autocomplete="email" placeholder="EMAIL" required aria-describedby="also-newsletter-status"><span class="local-newsletter-error" id="also-newsletter-status" role="status" hidden></span><button type="submit">SUBMIT</button><p><span>By entering your email address, you agree to receive future communications from ALSO and have read and agree to ALSO\'s <a href="/pages/terms">Terms</a> and acknowledge the <a href="/pages/privacy">Privacy Policy.</a></span></p>';
      form.addEventListener('submit', event => {
        event.preventDefault();
        const input = form.querySelector('input');
        const status = form.querySelector('[role="status"]');
        const valid = input.validity.valid;
        input.setAttribute('aria-invalid', String(!valid));
        status.hidden = valid;
        status.textContent = valid ? '' : 'Please enter a valid email address.';
        if (!valid) return input.focus();
        sessionStorage.setItem('also-newsletter-draft', input.value);
        externalDialog('https://ridealso.com/#footer', 'Join the mailing list', 'Complete your subscription on ridealso.com. This preview has not subscribed your email address.');
      });
      slot.append(form);
    });
    if (!localStorage.getItem('also-replica-cookie-consent')) setTimeout(() => {
      if (document.querySelector('.local-cookie-consent')) return;
      const dialog = document.createElement('aside');
      dialog.className = 'local-cookie-consent';
      dialog.setAttribute('role', 'dialog');
      dialog.setAttribute('aria-label', 'Cookie consent');
      dialog.innerHTML = '<h2>Cookie consent</h2><div class="local-cookie-message"><p>We and our partners, including Shopify, use cookies and other technologies to personalize your experience, show you ads, and perform analytics, and we will not use cookies or other technologies for these purposes unless you accept them. Learn more in our Privacy Policy</p><a href="/pages/privacy">Learn more</a></div><div class="local-cookie-actions"><button data-consent="accepted">Accept</button><button data-consent="declined">Decline</button></div>';
      dialog.querySelectorAll('button').forEach(button => button.addEventListener('click', () => {
        localStorage.setItem('also-replica-cookie-consent', button.dataset.consent);
        dialog.remove();
      }));
      document.body.append(dialog);
    }, 1800);
  });
})();
