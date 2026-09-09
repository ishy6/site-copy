(() => {
  const selectedId = new URLSearchParams(location.search).get('variant');
  if (!selectedId) return;
  document.querySelectorAll('script[type="configurator/config"]').forEach(script => {
    const data = JSON.parse(script.textContent);
    const variant = data.variants.find(entry => String(entry.id) === selectedId);
    if (!variant) return;
    for (const entry of data.variants) entry.selected = entry === variant;
    script.textContent = JSON.stringify(data);
    const app = script.closest('configurator-app');
    app.setAttribute('selected-variant-id', selectedId);
    app.dataset.startSummary = 'true';
    app.setAttribute('step', '3');
    const initialImage = variant.images?.[0];
    if (initialImage) {
      app.querySelectorAll('[data-configurator-media-bootstrap]').forEach(image => {
        image.src = initialImage;
        image.dataset.remoteSrc = initialImage;
        image.alt = variant.title;
        image.removeAttribute('srcset');
      });
      app.querySelectorAll('canvas[configurator-media]').forEach(canvas => {
        canvas.dataset.remoteSrc = initialImage;
        canvas.setAttribute('aria-label', variant.title);
      });
    }
    const componentIds = new Set(variant.components.map(component => String(component.id)));
    app.querySelectorAll('input[selectable-option]').forEach(input => {
      input.checked = componentIds.has(input.value);
      input.toggleAttribute('checked', input.checked);
    });
    const action = app.querySelector('[data-action="deposit"]');
    if (action) {
      action.href = '/cart/add/' + variant.deposit_variant_id;
      action.dataset.targetUrl = location.pathname + '?variant=' + selectedId + '&view=configure';
    }
  });
  document.querySelectorAll('script[type="product/data"]').forEach(script => {
    const data = JSON.parse(script.textContent);
    const variant = data.variants?.find(entry => String(entry.id) === selectedId);
    if (!variant) return;
    for (const entry of data.variants) entry.default = entry === variant;
    script.textContent = JSON.stringify(data);
    const selector = script.closest('variant-selector');
    selector?.querySelectorAll('input[type="radio"]').forEach(input => {
      input.checked = variant.options.includes(input.value);
      input.toggleAttribute('checked', input.checked);
    });
    document.querySelectorAll('product-media-gallery').forEach(gallery => {
      gallery.dataset.selectedVariant = selectedId;
      if (variant.featured_image?.id) gallery.dataset.selectedImage = String(variant.featured_image.id);
    });
  });
})();
