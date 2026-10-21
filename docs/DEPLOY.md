# Deploy (Vercel free tier + Neon free tier)

## 0. Minimum to get the current deploy working (no database yet)
Set these five in Vercel (Project, Settings, Environment Variables, Production and Preview), then redeploy:

| Variable | Value |
|---|---|
| `AUTH_SECRET` | Output of `openssl rand -base64 32`. Signs the admin session cookie. |
| `SUPER_ADMIN_EMAIL` | The founder's email, used to sign in as super admin. |
| `SUPER_ADMIN_PASSWORD` | A long random password for that account. |
| `ADMIN_PASSWORD` | A long random shared password (the existing shared admin login). |
| `NEXT_PUBLIC_SITE_URL` | `https://<your-vercel-domain>` with no trailing slash. |

Leave `DATABASE_URL` unset and the site runs in demo mode (next section). Check `/api/health`: it should say `"mode": "demo"`.

## 1. Running without a database (demo mode)
When `DATABASE_URL` is unset on a deploy (`NODE_ENV=production` or `VERCEL` set), the app cannot use the on-disk PGlite from development, because Vercel's filesystem is read-only. Instead it:

1. Starts an in-memory PGlite (embedded Postgres) on the first request of each server process.
2. Applies the migrations in `drizzle/` (shipped with every route via `outputFileTracingIncludes`).
3. Loads the demo seed (the same data as `pnpm db:seed`) once per process. Set `DEMO_SEED=0` to start empty instead.

What that means:
- **Data resets on every cold start.** Anything entered (leads from `/start`, cases, notes) disappears when Vercel recycles the function, often within minutes of inactivity.
- **Data is not shared between servers.** Two simultaneous serverless instances each hold their own copy, so a lead submitted on one may not appear on the next page load.
- The control panel shows an amber "Demo mode" bar, the public footer says "Demo site", and `GET /api/health` returns `"mode": "demo"`.
- Fine for showing the site and the panel. Not fine for real clients: add a database before taking real leads.

Running `pnpm build && pnpm start` locally without `DATABASE_URL` also uses demo mode. `pnpm dev` keeps the on-disk `.pglite/` folder as before.

## 2. Create a free Neon database
1. Sign up at [neon.tech](https://neon.tech) and create a project on the **Free** plan (region closest to Pakistan or London).
2. On the project dashboard, open **Connect**, turn on **Connection pooling**, and copy the pooled connection string (`postgres://...-pooler...`).
3. Locally, create the tables: `DATABASE_URL="postgres://..." pnpm db:migrate`. Optional demo data: `DATABASE_URL="postgres://..." pnpm db:seed --force` (deletes every row first).
4. In Vercel, add `DATABASE_URL` with that pooled string (Production and Preview).
5. Redeploy. `/api/health` should now return `"db": "neon", "mode": "persistent"`, and the demo bar disappears.

## 3. Vercel
1. Import the GitHub repo into Vercel. Framework: Next.js. Build command: `pnpm build`. Node 22+.
2. Environment variables (Production and Preview):

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | for real use | Neon pooled URL. Without it the app runs in demo mode (in-memory data that resets on cold start). See section 1. |
| `SUPER_ADMIN_EMAIL` | yes | Email of the super admin account. |
| `SUPER_ADMIN_PASSWORD` | yes | Long random password for the super admin account. |
| `ADMIN_PASSWORD` | yes | Long random string. Shared by the founders for now. |
| `AUTH_SECRET` | yes | 32+ random bytes, base64. Signs the admin cookie. |
| `NEXT_PUBLIC_SITE_URL` | yes | `https://your-domain` for sitemap, OG and referral links. |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | recommended | International format without plus, e.g. 447700900000. |
| `NEXT_PUBLIC_CONTACT_EMAIL` | recommended | Public contact address. |
| `NEXT_PUBLIC_STRIPE_LINK_*` | optional | One Stripe Payment Link per product. See `.env.example`. Until set, buttons say "Pay on invoice". |
| `STRIPE_SECRET_KEY` | optional | Needed by the Stripe webhook. Without it and the next variable, `/api/stripe/webhook` returns 503. |
| `STRIPE_WEBHOOK_SECRET` | optional | Signing secret (`whsec_...`) of the webhook endpoint. |
| `RESEND_API_KEY` | optional | Sends the intake confirmation and memo-delivered emails. Without it (or `EMAIL_FROM`) emails are skipped. |
| `EMAIL_FROM` | optional | Verified sender on Resend, e.g. `Rasta <hello@your-domain>`. |
| `EMAIL_REPLY_TO` | optional | Reply-to address for those emails. |
| `DEMO_SEED` | optional | Demo mode only. `0` starts the in-memory database empty instead of loading demo data. |

3. Deploy. Check `/`, `/pricing`, `/start` (submit a test lead), `/admin` (login), `/admin/leads` (the test lead appears).
4. Add the custom domain in Vercel. Enable Vercel Analytics (free) in the project settings.

### Stripe webhook
1. In Stripe: Developers, Webhooks, Add endpoint: `https://your-domain/api/stripe/webhook`, event `checkout.session.completed`. Copy the signing secret into `STRIPE_WEBHOOK_SECRET`.
2. The webhook matches a payment to a case by `client_reference_id` (the case number, e.g. `RS-0001`) or `metadata.caseNumber`. Case payment links get `?client_reference_id=<case number>` added automatically on the client status page (`src/lib/payments/links.ts`). A payment with no case reference is logged and must be recorded by hand.
3. Each payment is recorded once (keyed on the Checkout Session id); Stripe retries are safe. Amounts are stored as `amount_total / 100`, so keep the Payment Links in USD.
4. Test locally with `stripe listen --forward-to localhost:3000/api/stripe/webhook` and `stripe trigger checkout.session.completed`.

### Email (Resend)
Verify the sending domain on Resend, then set `RESEND_API_KEY` and `EMAIL_FROM`. Check with a test submission on `/start` that includes an email address.

### Health check
`GET /api/health` returns `{ "ok": true, "db": "neon", "mode": "persistent" }`. Point an uptime monitor at it; with real clients `db` must say `neon` and `mode` must say `persistent`. In demo mode it returns `"db": "pglite-memory", "mode": "demo"`.

## 4. After deploy
- Rotate `ADMIN_PASSWORD` every quarter or when a team member leaves.
- Never put real client documents anywhere except the client's own Google Drive. The panel stores links only.
- Backups: Neon free tier keeps point-in-time history for a short window; export monthly with `pg_dump` until a paid tier is justified.
