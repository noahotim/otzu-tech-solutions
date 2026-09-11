# OTZU Tech Solutions — Cloudflare Pages Edition

Migrated from `https://otzu-tech-solutions.vercel.app/` (Vercel) to be deployable on **Cloudflare Pages** + **GitHub**.

Live demo (original Vercel): https://otzu-tech-solutions.vercel.app/

This repo contains a **static mirror** of the landing page (`index.html` + `logo.png`) with a Cloudflare Pages Function for the contact form at `POST /api/contact`.

## Can Cloudflare Pages host this site?

**Yes — 100% compatible.**

| Part | Vercel | Cloudflare Pages | Notes |
|------|--------|------------------|-------|
| Landing page `/` | `index.html` (static HTML/CSS/JS, ~55 KB) | ✅ Native static hosting | No build step needed |
| Assets `/logo.png`, room image (Vercel Blob) | Static + Blob Storage | ✅ Static + R2 / keep Blob URL | Room image is hotlinked to `vercel-storage.com` — works anywhere |
| Contact form `POST /api/contact` | Serverless (`/api/contact`) | ✅ `functions/api/contact.js` | Re-implemented as Pages Function (see below) |
| Booking `/book` & Management `/manage` | Dynamic Next.js/DB | ⚠️ Needs separate migration | Keep on Vercel or rewrite as Pages Functions + D1/KV. This repo leaves them as external links / optional proxy via `_redirects` |

Costs: Cloudflare Pages is free (unlimited bandwidth), faster global CDN than Vercel hobby, and supports custom domain + automatic HTTPS.

## Project structure

```
otzu-tech-solutions/
├── index.html              # Full landing page (single-file HTML+CSS+JS, extracted from Vercel)
├── logo.png                # Brand logo (also in public/logo.png)
├── public/
│   └── logo.png
├── functions/
│   └── api/
│       └── contact.js      # Cloudflare Pages Function for POST /api/contact
├── _headers                # Security & cache headers
├── _redirects              # Optional proxy rules for /book, /manage
├── wrangler.toml           # Optional config
└── README.md
```

No framework, no `npm install`, no build.

## Deploy to Cloudflare Pages (2 minutes)

### Option A — GitHub connected (recommended)

1. **Create GitHub repo and push:**

   ```bash
   cd otzu-tech-solutions
   git init
   git add .
   git commit -m "feat: migrate OTZU Tech Solutions from Vercel to Cloudflare Pages"
   # create repo via gh CLI or at https://github.com/new
   gh repo create otzu-tech-solutions --public --source=. --push
   # or manually:
   # git remote add origin https://github.com/<YOUR_USERNAME>/otzu-tech-solutions.git
   # git branch -M main
   # git push -u origin main
   ```

2. **Connect to Cloudflare Pages:**
   - Go to https://dash.cloudflare.com → Pages → Create project → Connect to Git
   - Select `otzu-tech-solutions`
   - Build settings:
     - Framework: `None`
     - Build command: *(leave empty)*
     - Output directory: `/` (root)
   - Deploy → Done. You get `https://otzu-tech-solutions.pages.dev`

3. **Custom domain (optional):**
   - Pages → Custom domains → Add `otzutechsolutions.com` → follow DNS instructions.

### Option B — Direct upload with Wrangler

```bash
npm i -g wrangler
wrangler pages deploy ./ --project-name=otzu-tech-solutions
```

## Contact form setup

The form in `index.html:1700` does `fetch("/api/contact", {method:"POST"})`. On Cloudflare this hits `functions/api/contact.js`.

By default it just logs and returns `{ok:true}`. To actually send emails, edit `functions/api/contact.js` and uncomment one provider:

**MailChannels (free, no API key, Cloudflare-native)** — see TODO in file, just uncomment.

**Resend** (recommended):
1. Get key at https://resend.com → API Keys
2. Cloudflare dashboard → Pages → Settings → Environment variables → add `RESEND_API_KEY` and `CONTACT_EMAIL=otim.no25@gmail.com`
3. Uncomment Resend block in `functions/api/contact.js`.

Check logs: Dashboard → Pages → Functions → Real-time logs.

## Maintaining `/book` and `/manage`

These are full-stack apps (rooms DB, bookings, auth) not included in the static capture. You have 3 choices:

1. **Keep on Vercel** (simplest): Links already point to `https://otzu-tech-solutions.vercel.app/book` and `/manage`. Optionally enable proxy in `_redirects` (uncomment lines) so they appear under same domain.
2. **Full migration**: Clone those routes' code, connect to Cloudflare D1 (SQL) + R2 (images) + KV (sessions) — ask if you want me to scaffold that.
3. **Temporary redirect**: Add to `_redirects`: `/book/* https://otzu-tech-solutions.vercel.app/book/:splat 302`

## Local preview

Just open `index.html` in a browser, or:

```bash
npx serve .
# or
python -m http.server 8000
```

For Functions locally:
```bash
npx wrangler pages dev ./ --local
# then POST to http://localhost:8788/api/contact
```

## Source attribution

- Extracted `2026-09-11` from Vercel deployment.
- Original design: navy `#0a1b33` + teal `#14b8a6`, Plus Jakarta Sans, single-file responsive.
- Contact: otim.no25@gmail.com / +256 782719875

## License

All rights reserved © 2025 OTZU Tech Solutions. Reuse with permission.
