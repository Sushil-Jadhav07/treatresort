# Changelog: finishing pass

## Added
- **Enquiry backend**: `public/api/enquiry.php` (validation, honeypot, 5 req/10 min/IP rate limit, optional Turnstile, stores to `api/_data/enquiries.jsonl`, emails `ENQUIRY_TO_EMAIL` over SMTP or `mail()`, rejects non-POST and bodies over 16 KB). Config via `api/config.php` / env vars.
- **Form frontend** (`Enquire.jsx`): loading state, per-field and server errors, "Thank you" only after `{ ok: true }`, honeypot field, optional Turnstile. Booking-bar prefill unchanged.
- **Pre-render**: `src/entry-server.jsx` + `scripts/prerender.mjs`; `npm run build` now writes real HTML into `dist/index.html`; client hydrates it (`src/main.jsx`).
- **SEO build plugin** (`vite.config.js`): canonical, robots meta, Open Graph/Twitter, JSON-LD (Organization + 11 open LodgingBusiness), `robots.txt`, `sitemap.xml`, all from `SITE_URL`; `asynk.in` = staging (noindex, `Disallow: /`).
- **Tracking** (`src/lib/analytics.js`): GTM / GA4 / Meta Pixel from `VITE_GTM_ID`, `VITE_GA4_ID`, `VITE_META_PIXEL_ID`; events `enquiry_submit_success|error`, `search_bar_submit`, `phone_click`, `whatsapp_click`, `email_click`.
- Tests in `tests/` and `scripts/dev-api.mjs` (dev mock of the endpoint); `docs/DEPLOY.md`; `.env.example`.

## Changed
- Preloader: ~1.4 s total (was ~4.1 s), skipped on repeat visits in a session and for reduced-motion; its title is no longer a second `<h1>`.
- Hero video: not requested until the section is near the viewport AND the visitor interacts or 3.5 s after load; `poster` added; `preload="metadata"`.
- Images: p-udaipur, p-sangamner, p-ahilyanagar, p-vrindavan, o-1, o-8, o-9 under 250 KB; new `hero-poster.webp`.
- Footer: real URLs for About, Awards, Blog, Media & PR, Careers, Factsheet, Privacy, Terms (taken from the original site footer).
- Testimonial author "L&T Special Stale" -> "L&T".
- "Jim Corbett" no longer shows a state (it was not on the original site).

## Removed
- Static `public/robots.txt` / `public/sitemap.xml` (now generated).
