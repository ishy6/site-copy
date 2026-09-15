# Shupatto Reference Replica

An independent Vue 3 + TypeScript + Vite project based on the public pages at
https://prod-raw.shupatto.com/, captured on September 9, 2026.

## Run

```sh
npm install
npm run dev
```

Development runs at http://127.0.0.1:5178/. From the parent directory, use
`npm run dev:shupatto`.

```sh
npm run typecheck
npm run build
npm run preview
npm test
```

The browser tests use installed Google Chrome, build the project, and start an
isolated preview on port 5189. Close a manually started preview before running
them. Tests cover desktop and touch layouts, photographed animation pixels,
audio activation and muting, navigation, product colors and URL restoration,
language selection, instruction PDFs, and unknown routes.

With the development server running, `npm run test:routes` checks all 48 routes
at desktop and mobile widths, including visible images, page errors, missing
resources, and horizontal overflow. Results are saved in `artifacts/routes.json`.

## Implementation

`src/App.vue` loads the matching page snapshot. `src/reference.ts` applies page
metadata and fonts, initializes the original page modules after Vue mounts the
document, and provides menu accessibility attributes. Source CSS, SVG symbols,
the animation engine, image sequences, and product sprites preserve the source
layout and transitions. The site is rendered in the local document, without an
iframe or runtime proxy to the original site.

The 48 Japanese and English routes include the homepage, product lineup and
detail pages, About, Shoplist, and Downloads. The original desktop and mobile
photographed frame sequences, responsive images, audio, PDF manuals, and
per-page webfont subsets are stored in `public/`. Product color choices update
the URL and survive reload, as on the source site. The production build emits
an `index.html` for every captured route.

The homepage uses 2D photographic sequences, including its folding intro,
pointer interaction, draggable scene transition, scroll progression, sound,
and mobile layout. Product details preserve hover color selection on desktop,
tap and swipe on touch screens, image transitions, and scrolling sections.

Buying, retailer links, Instagram, and contact links keep their original
external destinations. They require an internet connection. This project does
not implement the separate Marna store or submit an order. Browsing the
captured Shupatto pages and their media does not require the original server.

## Source Refresh

```sh
npm run reference:sync
npm run reference:fonts
npm run build
```

The sync script crawls public internal links, parses encoded product data,
and caches responsive media and animation sheets. Existing downloaded files
are reused. Font capture opens the original pages in Chrome and stores each
page's delivered font subsets locally. Run both steps after changing snapshots.

`npm run reference:audit` records the original home experience.
`npm run reference:compare` creates source/local screenshots at 1440x900 and
390x844 and stores geometry and request diagnostics in `artifacts/comparison/`.
For comparable loading times, its original-site browser serves already cached
source images and scripts from disk while retaining the original document.
Animations can be at different frames when screenshots are taken.

Captured prices, availability, shop addresses, and product information reflect
the capture date. Assets and fonts remain the property of their original owners.
