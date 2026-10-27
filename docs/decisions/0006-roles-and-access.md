# 0006. Roles and access: env-based now, database-backed later

Status: accepted, 2026-10-28.

## Context
Two founders and a few staff share the control panel. There is no user database yet and the deploy may run without a database (decision 0007). The super admin is the tech founder.

## Decision
- Three roles in `src/lib/rbac.ts`: `super_admin` (everything), `staff` (operations: leads, cases, clients, partners, network, ambassadors, channels, content, payments, invoices, retainers, metrics, help, project), `viewer` (read-only: dashboard, cases, metrics, help, project).
- Sign-in is email plus password. Super admin: `SUPER_ADMIN_EMAIL` with `SUPER_ADMIN_PASSWORD`. Staff: any email with `ADMIN_PASSWORD`. Viewer: any email with `VIEWER_PASSWORD`. When the super-admin pair is unset, `ADMIN_PASSWORD` signs in as super admin so a single-password deploy keeps working.
- Pages and server actions call `requirePermission()`; the proxy only checks that a session exists. Navigation hides what the role cannot open.
- The signed-in email becomes the default author on case notes.

## Consequences
- Secrets live in Vercel env vars and the gitignored `_local/env/` folder, never in the repo.
- A database-backed user and role editor (per-person logins, custom roles) is the next step once a database is connected; `PERMISSIONS` in `rbac.ts` is the list it will edit.
