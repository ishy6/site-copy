import { load } from 'cheerio';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../public/reference');
const manifest = JSON.parse(await readFile(path.join(root, 'manifest.json'), 'utf8'));
const aliases = { '/pages/select-trim': '/products/tm-b-performance?view=performance', '/careers': 'https://jobs.ashbyhq.com/Ridealso' };
const deposits = {};
for (const page of manifest.pages) {
  const $ = load(await readFile(path.join(root, page.file), 'utf8'));
  $('html').attr('data-reference-route', page.route);
  if (!page.partial && !$('script[src="/reference/routes.js"]').length) $('head').prepend('<script src="/reference/routes.js"></script>');
  if (!page.partial && !$('script[src="/reference/support-adapter.js"]').length) $('head').append('<script defer src="/reference/support-adapter.js"></script>');
  if (!page.partial && !$('script[src="/reference/configurator-route.js"]').length) $('body').append('<script src="/reference/configurator-route.js"></script>');
  $('script[type="configurator/config"]').each((_, element) => {
    for (const variant of JSON.parse($(element).text()).variants) {
      if (variant.deposit_variant_id) deposits[variant.deposit_variant_id] = { ...variant, source_path: page.route.split('?')[0] };
    }
  });
  $('script:not([src])').each((_, element) => {
    const tag = $(element);
    if ((!tag.attr('type') || tag.attr('type') === 'module') && /rpq99qhx|webmcp|PaymentButton|pandect|klaviyo|clarity|monorail|trekkie|wpmLoader|ShopifyAnalytics/i.test(tag.html() || '')) tag.remove();
    if (['application/json', 'configurator/config'].includes(tag.attr('type'))) {
      try {
        const parsed = JSON.parse(tag.html());
        const normalize = value => typeof value === 'string' ? value.replace(/^(?:http:)?\/\/ridealso\.com/, 'https://ridealso.com') : Array.isArray(value) ? value.map(normalize) : value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, normalize(entry)])) : value;
        tag.html(JSON.stringify(normalize(parsed)));
      } catch {}
    }
  });
  $('a[href]').each((_, element) => {
    const tag = $(element);
    const href = tag.attr('href');
    if (aliases[href]) tag.attr('href', aliases[href]);
  });
  await writeFile(path.join(root, page.file), $.html());
}
const boundaryTemplate = await readFile(path.join(root, 'cart.html'), 'utf8');
for (const route of ['/account', '/account/login', '/account/register', '/account/recover', '/checkout']) {
  const existingPage = manifest.pages.find(page => page.route === route);
  if (existingPage?.source?.startsWith('https://ridealso.com')) continue;
  const $ = load(boundaryTemplate);
  const checkout = route === '/checkout';
  const title = checkout ? 'Continue to checkout' : 'Your ALSO account';
  $('html').attr('data-reference-route', route);
  $('title').text(`${title} - ALSO`);
  $('#main').html(`<section class="local-account-boundary"><h1>${title}</h1><p>${checkout ? 'Checkout and payment are completed securely on ridealso.com.' : 'Sign in to your ALSO account to manage orders and saved builds.'}</p><a data-also-external class="button button--primary button--large" href="https://ridealso.com${route}">${checkout ? 'CONTINUE TO CHECKOUT' : 'SIGN IN ON ALSO'}</a><a class="local-boundary-return" href="${checkout ? '/cart' : '/'}">${checkout ? 'Back to cart' : 'Back to ALSO'}</a></section>`);
  const file = route.slice(1).replaceAll('/', '__') + '.html';
  await writeFile(path.join(root, file), $.html());
  if (!manifest.pages.some(page => page.route === route)) manifest.pages.push({ route, file, title, source: 'Local handoff to ' + 'https://ridealso.com' + route });
}
await writeFile(path.join(root, 'deposits.json'), JSON.stringify(deposits));
await writeFile(path.join(root, 'manifest.json'), JSON.stringify(manifest, null, 2));
await writeFile(path.join(root, 'routes.js'), `window.__alsoReferenceRoutes = ${JSON.stringify(Object.fromEntries(manifest.pages.map(entry => [entry.route, { file: entry.file, partial: !!entry.partial }])))};`);
console.log(`Finalized ${manifest.pages.length} reference documents.`);
