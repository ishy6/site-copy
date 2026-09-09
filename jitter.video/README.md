# Jitter local replica

A standalone Vue 3 + TypeScript implementation of the Jitter marketing homepage,
email sign-in interface, and a custom beginner onboarding flow. The original
homepage and public `/join/` entry were inspected on September 7, 2026. The
post-verification onboarding and workspace are local implementations, not a claim
to reproduce private authenticated screens.

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:5177`. From the parent directory, run `npm run dev:jitter`.

## Routes and demo flow

- `/`: homepage, video showcase, product features, customer section, FAQ.
- `/templates`: searchable/filterable gallery with video preview dialogs.
- `/pricing`: illustrative plan comparison and functioning billing toggle.
- `/join` and `/login`: email entry and demo code verification.
- `/onboarding`: name → role → experience → workspace, with saved progress.
- `/files`: local workspace, templates, project search, settings, and file deletion.

Use any example email and the displayed demo code **123456**. No email is sent.
The Google button opens an explicitly labeled demo-account dialog, not Google OAuth.
After setup, create a file or choose a template; edit the headline and background,
play/pause the CSS preview, and download a **static SVG**. Video, Lottie, Figma,
AI generation, cloud collaboration, real billing, and production authentication
are not implemented. Choosing a template initializes its name and palette;
the full source video's animation is not imported into the demo editor.

Profile and files are stored under `jitter-demo-profile` and
`jitter-demo-projects:<demo-email>` in localStorage. Signing out preserves the same
demo profile/files. Switching to a different demo email restarts profile setup,
but its previously saved files remain available when that demo email is used again.
This is not an authentication or data-security boundary; do not
use real secrets or private content. If browser storage is blocked, the UI shows
a warning and continues in memory. Newsletter submissions only show local feedback.

## Verification

```bash
npm test
npm run typecheck
npm run build
```

The app supports mobile layouts, keyboard focus, native accessible dialogs,
protected-route redirects, reduced motion, and video playback only in view.

## Reference assets

`public/assets` contains the Jitter wordmark, customer logos, Lausanne/Inter fonts,
six template preview videos, and a product demonstration video downloaded from
public `jitter.video` / `assets.jitter.video` pages for this local reference build.
They remain the property of their respective owners. Review asset and brand
permissions before any public or commercial deployment. The app has no runtime
analytics, external login SDKs, or remote media dependencies. Official help and
legal links open the source site in a separate tab.
