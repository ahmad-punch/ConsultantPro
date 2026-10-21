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

3. Deploy. Check `/`, `/pricing`, `/start` (submit a test lead), `/admin` (login), `/admin/leads` (the test lead appears).
4. Add the custom domain in Vercel. Enable Vercel Analytics (free) in the project settings.

## 3. After deploy
- Rotate `ADMIN_PASSWORD` every quarter or when a team member leaves.
- Never put real client documents anywhere except the client's own Google Drive. The panel stores links only.
- Backups: Neon free tier keeps point-in-time history for a short window; export monthly with `pg_dump` until a paid tier is justified.
