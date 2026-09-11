# OTZU Tech Solutions — Cloudflare Pages Edition

**Full-stack migration from Vercel → Cloudflare Pages + GitHub.**

- **Original (Vercel):** https://otzu-tech-solutions.vercel.app/
- **GitHub (this repo):** https://github.com/noahotim/otzu-tech-solutions
- **Cloudflare Pages (deploy target):** `https://otzu-tech-solutions.pages.dev` *(connect GitHub to deploy — see below)*

> Verified locally: `npx wrangler pages dev .` compiles, 8 header rules, worker ready on `:8788`. Static + Functions.

## Can Cloudflare Pages host this site?

**YES — fully.** This is not just a landing page. The entire Guest House Management System migrates.

| Route | Vercel | Cloudflare Pages | Status |
|-------|--------|------------------|--------|
| `/` (landing) | static `index.html` (~55KB, navy `#0a1b33` + teal `#14b8a6`) | ✅ native static | extracted 2026-09-11, UTF-8 intact |
| `/book` (Booking, MTN/Stripe, demo gate) | `booking` JS `39KB` + `/api/booking`, `/api/stripe` | ✅ `book/index.html` + `functions/api/booking.js` + `stripe.js` proxy | live via Vercel DB until D1 cutover |
| `/manage` (Auth: sign-in/sign-up, `ownerExists`) | `/api/auth` | ✅ `manage/index.html` + `functions/api/auth.js` | session cookies forwarded |
| `/console` (Dashboard `105KB`, rooms/guests/reservations/billing/inventory/staff/roles, reports, upload) | `/api/catalog`, `/api/reservations`, `/api/billing`, `/api/reports`, `/api/upload` | ✅ `console/index.html` + `functions/api/{catalog,reservations,billing,reports,upload}.js` |  |
| `POST /api/contact` | serverless | ✅ `functions/api/contact.js` native (log + MailChannels/Resend) | no proxy needed |
| Assets `logo.png`, room blob `vercel-storage.com` | Vercel Blob | ✅ `logo.png` + `public/logo.png` (keep blob URL or move to R2) | `Cache-Control: immutable` |
| Any other `/api/*` | serverless | ✅ `functions/api/[[fallback]].js` catch-all proxy | future-proof |

**Architecture:** Cloudflare Pages (static CDN, free unlimited bandwidth, auto HTTPS) + Pages Functions (serverless, edge) + optional D1 (SQLite) + R2 (images) + KV (sessions). No build step.

## Project structure

```
otzu-tech-solutions/
├── index.html                  # Landing (extracted, en-dash – intact)
├── logo.png / public/logo.png  # 1.2MB
├── book/index.html             # Booking UI (39KB, MTN Mobile Money, Stripe, demo-gate)
├── manage/index.html           # Auth gate (12KB, /api/auth)
├── console/index.html          # Management console (105KB, full SPA)
├── functions/
│   ├── _lib/proxy.js           # Shared Vercel proxy (forwards cookies, Set-Cookie, body)
│   └── api/
│       ├── contact.js          # NATIVE: logs, optional MailChannels/Resend -> otim.no25@gmail.com
│       ├── auth.js             # proxy → VERCEL_ORIGIN
│       ├── booking.js          # proxy (access-status, mtn-pay, receipt-pdf…)
│       ├── stripe.js           # proxy
│       ├── catalog.js          # proxy ?resource=rooms|guests|inventory|staff|roles
│       ├── reservations.js     # proxy
│       ├── billing.js          # proxy
│       ├── reports.js          # proxy
│       ├── upload.js           # proxy ?name=
│       └── [[fallback]].js     # catch-all proxy for any future /api/*
├── schema.sql                  # D1 schema (users, roles, rooms, guests, reservations, invoices, payments, inventory, staff, contact_submissions)
├── seed.sql                    # 8 rooms (60k-250k UGX), 3 inventory, 1 staff — demo data
├── package.json                # npm scripts + wrangler ^3.114
├── wrangler.toml               # Pages config + D1/R2/KV bindings (commented, enable after `wrangler d1 create`)
├── _headers                    # 8 header rules (security, cache)
├── _redirects                  # no redirects needed (keep for legacy)
└── README.md
```

## How it works on Cloudflare

1. **Day 1 (proxy mode, recommended):** Set `VERCEL_PROXY="true"` (default in `wrangler.toml:20`). All `functions/api/*.js` call `proxyToVercel()` → `https://otzu-tech-solutions.vercel.app` with full cookie/header forwarding. Your Vercel DB stays source of truth, Cloudflare is a fast edge + custom domain. Zero data loss.

2. **Day 2 (native D1 cutover, optional):** When ready to leave Vercel entirely:
   ```bash
   npx wrangler d1 create otzu-db          # copy database_id into wrangler.toml
   npx wrangler d1 execute otzu-db --file=./schema.sql
   npx wrangler d1 execute otzu-db --file=./seed.sql
   # then implement native handlers in functions/api/*.js (use env.DB.prepare)
   # set VERCEL_PROXY="false" and redeploy
   ```
   Schema already defines all tables inferred from `/console`: `users`, `rooms` (media JSON), `reservations` (reference, momo, stripe), `invoices`/`payments`, `inventory`, `staff`/`roles`.

Contact stays native regardless — no proxy needed.

## Deploy to Cloudflare Pages — do everything

### A) GitHub → Pages (1-click, production)

Already pushed to https://github.com/noahotim/otzu-tech-solutions (branch `main`).

1. Cloudflare dashboard → https://dash.cloudflare.com → **Workers & Pages → Create application → Pages → Connect to Git** → select `noahotim/otzu-tech-solutions`
2. **Set up builds:**
   - Framework preset: `None`
   - Build command: *(leave empty)*
   - Build output directory: `/` (or `.`)
   - Environment variables: `VERCEL_PROXY=true`, `CONTACT_EMAIL=otim.no25@gmail.com` (add `RESEND_API_KEY` if using Resend)
3. **Save and Deploy** → get `https://otzu-tech-solutions.pages.dev` (test: `/`, `/book`, `/manage`, `/console`)
4. **Custom domain:** Pages → Custom domains → **Set up a custom domain** → `otzutechsolutions.com` + `www.otzutechsolutions.com` → Cloudflare auto-provisions SSL. If domain is on Cloudflare, DNS is auto. If elsewhere, add CNAME shown.
5. **Verify:** open `/api/auth?action=status` → should return `{"ok":true,…}` (proxied), test booking search, console login.

### B) CLI (`wrangler pages deploy`) — alternative

Requires `wrangler login` (browser) once:
```bash
cd otzu-tech-solutions
npm install                 # already done, wrangler 3.114 installed
npx wrangler login          # opens browser → authorize Cloudflare
npx wrangler pages deploy . --project-name=otzu-tech-solutions
# or npm run deploy
```
Local preview before deploy:
```bash
npm run dev                  # wrangler pages dev . --port 8788
# open http://127.0.0.1:8788, test POST http://127.0.0.1:8788/api/contact
```

### C) DNS / Domain move from Vercel

- If `otzutechsolutions.com` is still on Vercel: after Cloudflare Pages verifies custom domain, change nameservers to Cloudflare or add CNAME `otzutechsolutions.com → otzu-tech-solutions.pages.dev` (proxied).
- Keep Vercel deployment as fallback until Cloudflare is stable — proxy ensures no downtime. Then disable Vercel domain or keep as `vercel.otzutechsolutions.com`.

## Contact form (native)

Form in `index.html:1700` posts to `/api/contact`. `functions/api/contact.js:13` (native, not proxied):

- Validates `name, email, message`, logs to `wrangler tail` / Dashboard → Functions → Logs.
- To actually email: uncomment **MailChannels** block (free, no key, Cloudflare-native) or **Resend** block → add `RESEND_API_KEY` var.
- Optional D1 store: bind `DB` and insert into `contact_submissions`.

Test:
```bash
curl -X POST https://otzu-tech-solutions.pages.dev/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","phone":"+256700000000","message":"Hello"}'
```

## Local dev

```bash
python -m http.server 8000          # static only, open index.html
npm run dev                          # full Pages + Functions on :8788
```

`npx wrangler pages dev .` confirmed: ✨ Compiled Worker, 8 header rules, VERCEL_PROXY true.

## Cost / Perf

- Cloudflare Pages: **free** (unlimited requests/bandwidth) vs Vercel hobby limits.
- Edge latency: Cloudflare 300+ PoPs vs Vercel ~18.
- D1/R2/KV free tiers generous for guest house scale. Invoice PDFs (`/api/booking?action=receipt-pdf`) will stream via proxy (or generate in R2 later).

## Source

- Extracted `2026-09-11T09:37:47Z` from `https://otzu-tech-solutions.vercel.app/` (ETag `1da8b44ae95894b0c69f07c6b3215586`, `x-vercel-cache: HIT`).
- Design tokens `index.html:40` + console tokens preserved.
- Contact: `otim.no25@gmail.com`, `+256 782719875`.

## License

© 2025 OTZU Tech Solutions. All rights reserved.
