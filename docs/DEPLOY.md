# Deploy guide (Hostinger shared hosting / Apache + PHP)

## 1. Build
```bash
npm install
npm run build            # production (SITE_URL=https://treatresorts.com/ from .env.production)
npm run build:staging    # staging  (SITE_URL=https://tree.asynk.in/  -> noindex + robots Disallow)
```
Tracking IDs are baked in at build time: put them in `.env.production` (or `.env.staging`) before building:
```
VITE_GTM_ID=GTM-XXXXXXX
VITE_GA4_ID=G-XXXXXXXXXX
VITE_META_PIXEL_ID=123456789012345
```
Leave a value empty to load nothing for that tool. (Use GA4 here OR as a tag inside GTM, never both, or pageviews double.)

## 2. Upload
Upload **everything inside `dist/`** (including the hidden `.htaccess` and the `api/` folder) to `public_html/` (or the staging subdomain's folder) with hPanel File Manager or FTP.

## 3. Enquiry endpoint (`/api/enquiry.php`)
1. In hPanel create a mailbox, e.g. `no-reply@treatresorts.com`.
2. On the server copy `api/config.sample.php` to `api/config.php` and fill in:
   `ENQUIRY_TO_EMAIL` (client to confirm), `MAIL_FROM`, and for reliable delivery `SMTP_HOST` (`smtp.hostinger.com`), `SMTP_PORT` (`465` + `SMTP_SECURE=ssl`, or `587` + `tls`), `SMTP_USER`, `SMTP_PASS`.
   With `SMTP_HOST` empty the endpoint falls back to PHP `mail()`.
3. Optional spam protection: create a Cloudflare Turnstile widget, put the secret in `TURNSTILE_SECRET` (server) and the site key in `VITE_TURNSTILE_SITE_KEY` (build).
4. The folder `api/` must be writable by PHP (it creates `api/_data/` for `enquiries.jsonl`, rate-limit files and `errors.log`).
5. Check: open `https://<site>/api/_data/enquiries.jsonl` and `https://<site>/api/config.php` in a browser: both must be **403/404**, never downloadable.
6. Submit the form once and confirm the email arrives and a line is added to `api/_data/enquiries.jsonl`.
7. Run the contract test once (it uses this IP's 5 requests / 10 min, so wait 10 minutes before running it again):
   `node tests/api-contract.mjs https://<site>`

## 4. SEO before going live on treatresorts.com
- Decide what happens to the old WordPress pages (`/about-us/`, `/property/`, `/wedding-vows/`, ...). Either keep WordPress for inner pages and serve only the homepage from this build, or add 301 redirects for every old URL. Do **not** just overwrite the site root.
- In Google Search Console: add the property, submit `https://treatresorts.com/sitemap.xml`, and use URL Inspection to confirm Googlebot sees the page (and is not shown Hostinger's "Checking your browser" screen).
- Staging must stay on the `build:staging` output (noindex).

## 5. Checks after every deploy
```bash
node tests/verify-seo.mjs dist          # JSON-LD, canonical, OG, robots, pre-rendered text
curl -s https://<site>/ | grep -i "redefining hospitality"
```
Local test tools: `node scripts/dev-api.mjs` (mock endpoint), `node tests/ui-tests.mjs <url>`, `node tests/tracking-test.mjs <url>`.
