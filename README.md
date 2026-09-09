# Site Copy

Seven standalone site replicas live in this directory. Each project can be
installed, run, and built independently with Vite. Most application code uses
Vue 3 and TypeScript; ALSO also serves captured source templates with the
original theme scripts and a local interaction adapter.

| Project | Source site | Development command |
| --- | --- | --- |
| `wise.com` | <https://wise.com/> | `npm run dev:wise` |
| `osmo.supply` | <https://www.osmo.supply/> | `npm run dev:osmo` |
| `shop.app` | <https://shop.app/> | `npm run dev:shop` |
| `21tsi.com` | <https://21tsi.com/> | `npm run dev:21tsi` |
| `jitter.video` | <https://jitter.video/?noredir=1> | `npm run dev:jitter` |
| `makr.com` | <https://makr.com/> | `npm run dev:makr` |
| `ridealso.com` | <https://ridealso.com/> | `npm run dev:ridealso` |

Install each project's dependencies from this directory:

```bash
npm --prefix wise.com install
npm --prefix osmo.supply install
npm --prefix shop.app install
npm --prefix 21tsi.com install
npm --prefix jitter.video install
npm --prefix makr.com install
npm --prefix ridealso.com install
```

Run shared verification across all seven projects:

```bash
npm run typecheck
npm test
npm run build
```

Authentication, checkout, contact, and money-transfer submissions are local
demonstration flows. Real accounts, payment, subscriptions, and bookings require
the original providers; a local interaction does not submit an order or send
an email.

The MAKR and ALSO replicas include source page snapshots, fonts, styles, and
cached product images under their respective `public/reference/` directories.
Their `scripts/` directories contain the source synchronization and validation
utilities. MAKR renders these snapshots through Vue and maintains navigation,
search, product options, and its shopping bag locally. ALSO preserves its theme
components, including the configurator, and adapts cart and filtering requests
to local data. Query-specific pages are included in the production build.

Live video, provider embeds, and MAKR pages outside the captured route index
can still require an internet connection. Source snapshots reflect the capture
date and do not automatically track later price, stock, or content changes.

For the MAKR and ALSO browser checks, use an installed Google Chrome. Start
MAKR on port 5176 in another terminal, then run its desktop and mobile flows:

```bash
npm --prefix makr.com run dev -- --host 127.0.0.1 --port 5176
```

```bash
npm --prefix makr.com run test:fidelity
npm --prefix ridealso.com run build
npm --prefix ridealso.com run test:fidelity
```

The ALSO browser suite starts its built-site server on port 5188 automatically.
The browser checks provide interaction coverage; these two projects currently
have no Vitest unit tests.
