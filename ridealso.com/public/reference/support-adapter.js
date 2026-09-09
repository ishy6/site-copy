(() => {
  function mountHelpCenter() {
    if (document.querySelector('[data-gorgias-loader-help-center]')) return;
    const anchor = [...document.querySelectorAll('#main script')].find(script =>
      script.textContent.includes('open-gorgias-chat'),
    );
    if (!anchor) return;

    // Preserve the source site's embedded help center and its hcUrl navigation.
    const script = document.createElement('script');
    script.src = 'https://help-center.gorgias.help/api/help-centers/loader.js?v=2';
    script.dataset.gorgiasLoaderHelpCenter = '';
    script.dataset.gorgiasHelpCenterUid = '37idu0ns';
    script.defer = true;
    script.addEventListener('error', () => {
      const link = document.createElement('a');
      const requested = new URLSearchParams(location.search).get('hcUrl');
      const target = new URL(requested || '/en-US', 'https://ridealso-hu2bxiox05b.gorgias.help');
      link.href = target.origin === 'https://ridealso-hu2bxiox05b.gorgias.help'
        ? target.href
        : 'https://ridealso-hu2bxiox05b.gorgias.help/en-US';
      link.className = 'button button--primary button--large';
      link.textContent = 'Open Help Center';
      script.after(link);
    }, { once: true });
    anchor.before(script);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountHelpCenter, { once: true });
  } else {
    mountHelpCenter();
  }
})();
