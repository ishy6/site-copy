# ALSO Reference Replica

The active site uses captured public ALSO page documents and the original theme's CSS, fonts, and browser interaction modules. The earlier Vue implementation remains in `src/`; Vite serves the more complete reference routes first. This preserves the source's layout, media galleries, mega menus, mobile navigation, product variants, configurator, carousels, and modal behavior.

## Run

```sh
npm install
npm run dev -- --host 127.0.0.1 --port 5177
npm run build
npm run serve:built
npm run test:fidelity
```

`serve:built` serves only `dist` on port 5188. It does not use Vite or read the source directory. Query templates such as `?view=configure`, `?view=performance`, and blog pagination resolve to separate complete documents while retaining the public URL. Tests run against this standalone build using installed Chrome.

## Reference Content

`public/reference/manifest.json` records each original source URL and its snapshot. The source theme scripts and styles, responsive image assets, fonts, and Lottie files are cached locally. Large videos and configurator image variants continue to use the original CDN.

The scripts under `scripts/` refresh source documents with Cheerio, cache images and public product data, and finalize the local route metadata. Run the steps in sequence, since media caching and finalization both update captured documents:

```sh
CRAWL=1 node scripts/sync-reference.mjs / /cart
node scripts/cache-reference-products.mjs
node scripts/cache-reference-media.mjs
node scripts/finalize-reference.mjs
npm run build
```

Pass explicit query URLs to `sync-reference.mjs` to refresh the corresponding template. The manifest preserves previously captured routes.

## Local Behavior

The small `local-adapter.js` layer supplies persistent local cart APIs, captured product recommendations, category/price filters, cookie preferences, email validation, and source variant URL initialization. No live purchase, subscription, login, or reservation is submitted by this project. Account and checkout screens explicitly hand off to ALSO; newsletter submission validates the address and asks the visitor to complete the subscription on the original site. Event registration and third-party support content retain their original external destinations.

`configurator-route.js` applies a shared URL's variant before the source custom elements initialize, so a refreshed configuration preserves the selected frame, color, package, and cockpit.
