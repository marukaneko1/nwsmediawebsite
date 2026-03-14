# NWS Media — SEO & performance checklist

Status of each item and what to do next.

---

## ✅ Implemented (in this repo)

| Item | Status | What was done |
|------|--------|----------------|
| **Enable browser caching** | ✅ Done | `.htaccess` added: 1 year for images/CSS/JS, 1 hour for HTML. |
| **Enable Gzip compression** | ✅ Done | `.htaccess` enables `mod_deflate` for HTML, CSS, JS, JSON, SVG. |
| **Implement lazy loading for images below fold** | ✅ Done | `loading="lazy"` + width/height on footer and legal-page logos to avoid layout shift. |
| **Remove render-blocking resources** | ✅ Partial | Your main `script.js` is now `defer`. Critical CSS has `preload`. Fonts already use `preconnect` and Google Fonts `&display=swap`. |

---

## ⏳ You still need to do

### 1. Run PageSpeed Insights on all key pages, fix issues flagged

- **Action:** Go to [PageSpeed Insights](https://pagespeed.web.dev/) and run it for:
  - `https://nwsmedia.com/`
  - `https://nwsmedia.com/book-call.html`
  - `https://nwsmedia.com/qualify/`
  - `https://nwsmedia.com/privacy-policy.html`
  - `https://nwsmedia.com/terms-of-service.html`
- Fix whatever it reports (e.g. “Reduce unused JavaScript”, “Largest Contentful Paint”). Re-run after changes.

### 2. Compress all images (TinyPNG or WebP)

- **Current:** `IMG_8603.PNG`, `og-image.jpg`, favicons, and video thumbnails are unoptimized.
- **Action:**
  - Run [TinyPNG](https://tinypng.com/) (or similar) on all PNG/JPG.
  - Optionally serve WebP with a `<picture>` tag or by converting assets to `.webp` and updating references.
- **Files to compress:** `IMG_8603.PNG`, `og-image.jpg`, `apple-touch-icon.png`, `favicon-*.png`, `favicon.ico`.

### 3. Minify CSS, JavaScript, HTML

- **Current:** `styles.css` and `script.js` are unminified; HTML is readable (indented).
- **Action (choose one):**
  - **Option A:** Before uploading, run a build that minifies:
    - CSS (e.g. `clean-css-cli` or online minifier)
    - JS (e.g. `terser` or online minifier)
    - HTML (e.g. `html-minifier-terser` or online)
  - **Option B:** If your host supports it, enable “minify” in the control panel (e.g. GoDaddy, Cloudflare).
- **Note:** Keep unminified copies as source; deploy the minified versions.

### 4. Use CDN for static assets (optional)

- **Current:** Tailwind, Lenis, and GSAP are already loaded from CDNs (cdn.tailwindcss.com, unpkg, cdnjs). Your own files (`styles.css`, `script.js`, images) are served from your domain.
- **Action:** To improve TTFB and caching globally, put the site behind a CDN (e.g. **Cloudflare** in front of nwsmedia.com) so HTML, CSS, JS, and images are cached at the edge. No code changes required if you only switch DNS to Cloudflare.

### 5. Optimize server response time (< 200ms)

- **Current:** This is entirely server/hosting dependent.
- **Action:**
  - Use a fast host or VPS close to your audience.
  - Put the site behind a CDN (e.g. Cloudflare).
  - If on GoDaddy shared hosting, consider upgrading or moving to a faster plan/VPS.

---

## Server note (GoDaddy / Apache)

The `.htaccess` rules use `mod_deflate` and `mod_expires` (and optionally `mod_headers`). Most GoDaddy Apache setups have these enabled. If Gzip or caching don’t work, ask GoDaddy to confirm those modules are on, or use their control-panel options for “compression” and “caching” if available.

---

## Quick reference

| Item | You have? | Next step |
|------|-----------|-----------|
| PageSpeed on key pages | ❌ | Run PageSpeed Insights, fix reported issues |
| Compress images (TinyPNG/WebP) | ❌ | Compress and optionally convert to WebP |
| Browser caching | ✅ | `.htaccess` in repo |
| Minify CSS, JS, HTML | ❌ | Add build step or host minify |
| Lazy loading (images below fold) | ✅ | `loading="lazy"` + dimensions added |
| CDN for static assets | ⚠️ Partial | Third-party libs on CDN; add Cloudflare for your domain |
| Remove render-blocking | ✅ Partial | `defer` + preload in place; fix any remaining from PageSpeed |
| Server response < 200ms | ❓ | Depends on host; use CDN + good hosting |
| Gzip compression | ✅ | `.htaccess` in repo |
