# ThoughtLab verification

Verified on 2026-09-15 with installed Google Chrome, using a static HTTP server that reads only `dist/`.

- `npm run typecheck`: passed.
- `npm run build`: passed; all 138 captured routes have standalone production HTML.
- `npm test`: 4 passed in 55 seconds.
- Desktop WebGL canvas: 720 x 450 pixels, 79,140 nonblack pixels; checksum changed from 14,427,425 to 18,253,148 after pointer movement and animation.
- Mobile WebGL canvas: 195 x 422 pixels, 19,218 nonblack pixels; subsequent frame changed.
- All 138 static page requests and 634 asset mappings returned HTTP 200; no missing local links or assets.
- Desktop homepage, menu, wheel scroll, project navigation, About, blog category selection and route refresh passed.
- Mobile homepage, menu, inquiry type selection, required-field validation and valid local submission passed. No POST requests were sent. The feedback dialog received focus, closed with Escape and restored the submit-button focus.
- Checked workflows recorded no JavaScript page errors. Desktop recorded no external HTTP requests.
- Unknown route renders the local 404 page and returns to the home page.

Screenshots: `desktop.png`, `desktop-menu.png`, `desktop-projects.png`, `desktop-lower.png`, `mobile.png`, `mobile-menu.png`, `mobile-form-feedback.png`, and `blog-category.png`.

Machine-readable results: `canvas-desktop.json`, `canvas-mobile.json`, and `static-routes.json`. Pixel totals depend on the animation frame; current JSON contains the most recent run.
