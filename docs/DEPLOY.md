# Deploy (Vercel free tier + Neon free tier)

## 1. Database (Neon, free tier)
1. Create a Neon project (region closest to Pakistan or London). Copy the pooled connection string.
2. Locally: `DATABASE_URL="postgres://..." pnpm db:migrate` (applies `drizzle/*.sql`). Optional demo data: `DATABASE_URL=... pnpm db:seed --force`.

## 2. Vercel
1. Import the GitHub repo into Vercel. Framework: Next.js. Build command: `pnpm build`. Node 22+.
2. Environment variables (Production and Preview):

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | yes | Neon pooled URL. Without it the app falls back to an ephemeral in-memory PGlite, which is wrong for production. |
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
`GET /api/health` returns `{ "ok": true, "db": "neon" }`. Point an uptime monitor at it; `db` must say `neon` in production.

## 3. After deploy
- Rotate `ADMIN_PASSWORD` every quarter or when a team member leaves.
- Never put real client documents anywhere except the client's own Google Drive. The panel stores links only.
- Backups: Neon free tier keeps point-in-time history for a short window; export monthly with `pg_dump` until a paid tier is justified.
