# Site Copy

Eight standalone site replicas live in this directory. Each project can be
installed, run, and built independently with Vite. Most application code uses
Vue 3 and TypeScript; ALSO also serves captured source templates with the
original theme scripts and a local interaction adapter.

`site-components/` is the companion Vue 3 + TypeScript component collection,
styled after Osmo. It contains 43 independently previewable interactive components from all
eight sites, eight source style palettes, editable props, source and usage views,
local bookmarks, and portable ZIP downloads with the required source and assets.
See [its README](site-components/README.md) for integration and extension details.

| Project | Source site | Development command |
| --- | --- | --- |
| `wise.com` | <https://wise.com/> | `npm run dev:wise` |
| `osmo.supply` | <https://www.osmo.supply/> | `npm run dev:osmo` |
| `shop.app` | <https://shop.app/> | `npm run dev:shop` |
| `21tsi.com` | <https://21tsi.com/> | `npm run dev:21tsi` |
| `jitter.video` | <https://jitter.video/?noredir=1> | `npm run dev:jitter` |
| `makr.com` | <https://makr.com/> | `npm run dev:makr` |
| `ridealso.com` | <https://ridealso.com/> | `npm run dev:ridealso` |
| `prod-raw.shupatto.com` | <https://prod-raw.shupatto.com/> | `npm run dev:shupatto` |
| `site-components` | Local component and style collection | `npm run dev:components` |

## Project Documentation

Each replica has a `docs/README.md` describing its visual style, core interactions,
active code entry points, component behavior, implementation approach, and
verification boundaries. The documents are written in Chinese and describe the
current local code rather than assuming every flow uses a remote production API.

| Replica | Documentation |
| --- | --- |
| Wise | [Interactions, Style, and Components](wise.com/docs/README.md) |
| Osmo | [Interactions, Style, and Components](osmo.supply/docs/README.md) |
| Shop | [Interactions, Style, and Components](shop.app/docs/README.md) |
| 21TSI | [Interactions, Style, and Components](21tsi.com/docs/README.md) |
| Jitter | [Interactions, Style, and Components](jitter.video/docs/README.md) |
| MAKR | [Interactions, Style, and Components](makr.com/docs/README.md) |
| ALSO | [Interactions, Style, and Components](ridealso.com/docs/README.md) |
| Shupatto | [Interactions, Style, and Components](prod-raw.shupatto.com/docs/README.md) |

## Development

Install each project's dependencies from this directory:

```bash
npm --prefix wise.com install
npm --prefix osmo.supply install
npm --prefix shop.app install
npm --prefix 21tsi.com install
npm --prefix jitter.video install
npm --prefix makr.com install
npm --prefix ridealso.com install
npm --prefix prod-raw.shupatto.com install
npm --prefix site-components install
```

Run shared verification across the eight replicas and the component collection:

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

Shupatto uses Vue to load 48 Japanese and English page snapshots with the
original interaction modules, locally cached image sequences, audio, fonts,
and PDF manuals. `npm run dev:shupatto` starts it on port 5178. Its browser tests
build and start an isolated preview on port 5189. See
[the project README](prod-raw.shupatto.com/README.md) for source refresh and
comparison commands.
