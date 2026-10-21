# Changelog

Format: Keep a Changelog. Newest first. Group by Added / Changed / Fixed / Removed / Docs.

## [Unreleased]
### Added
- Repo structure, CLAUDE.md, docs skeleton, decision records 0001-0003.
- Next.js app scaffold (App Router, TypeScript, Tailwind).
- Foundation: dependencies (Drizzle, Neon, PGlite, zod, next-mdx-remote, react-hook-form, Vercel Analytics, lucide), shadcn/ui kit (button, card, input, textarea, select, badge, table, dialog, sheet, tabs, label, separator, dropdown-menu, field, sonner, skeleton, avatar, tooltip).
- Foundation: `src/lib/site.ts` (brand), `src/lib/pricing.ts` (catalogue and retainer tiers), `src/lib/db/schema.ts` + `enums.ts` (data model), `src/lib/db/index.ts` (Neon or PGlite), initial migration in `drizzle/`, `pnpm db:seed` demo data, `src/lib/auth.ts` + `src/proxy.ts` (admin password and signed cookie), `src/lib/ids.ts`, `src/lib/validation/common.ts`.
- Design tokens: Fraunces display, Inter body, deep green primary, warm paper background, terracotta highlight; `.env.example`.
- Content: 10 pathway guides (`content/guides/*.mdx`) and the marketing pack (`marketing/`: strategy, WhatsApp posts, group intro scripts, ambassador pitch, FAQ replies, objection handling, price sheet, video scripts, email sequence, channels CSV).
### Changed
- `src/middleware.ts` is `src/proxy.ts` (Next 16 rename); ARCHITECTURE.md updated.
- Root page moved to `src/app/(marketing)/page.tsx`; placeholder layouts for `(marketing)` and `(admin)/admin`, working `/admin/login`.
### Removed
- Scaffold boilerplate (Geist demo page, Next/Vercel SVGs in `public/`).
