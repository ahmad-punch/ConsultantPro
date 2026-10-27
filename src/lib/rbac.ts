/**
 * Role-based access for the control panel (decision 0006). Roles are env-based
 * today (see src/lib/auth.ts); the permission ids and labels here are the
 * contract a DB-backed role editor will reuse. Server-only.
 *
 * - `can(role, permission)`: pure check.
 * - `requirePermission(permission)`: call at the top of a page's data component,
 *   a server action, or a route handler. Not signed in -> /admin/login.
 *   Signed in without the permission -> /admin?denied=<permission> (toast).
 * - `navForRole(role)`: the nav hrefs that role may open.
 */
import "server-only";

import { redirect } from "next/navigation";

import { requireAdmin, type Role, type SessionPayload } from "@/lib/auth";
import { ROLES } from "@/lib/auth-token";

export { ROLES, type Role };

export const PERMISSIONS = [
  { id: "dashboard.view", label: "See the dashboard", group: "Read" },
  { id: "cases.view", label: "See cases", group: "Read" },
  { id: "metrics.view", label: "See metrics", group: "Read" },
  { id: "help.view", label: "Read help", group: "Read" },
  { id: "project.view", label: "See the project tracker", group: "Read" },
  { id: "leads.view", label: "See leads", group: "Operations" },
  { id: "clients.view", label: "See clients", group: "Operations" },
  { id: "partners.view", label: "See partners", group: "Operations" },
  { id: "network.view", label: "See the provider network", group: "Operations" },
  { id: "ambassadors.view", label: "See ambassadors", group: "Operations" },
  { id: "channels.view", label: "See channels", group: "Operations" },
  { id: "content.view", label: "See the content calendar", group: "Operations" },
  { id: "payments.view", label: "See payments", group: "Money" },
  { id: "invoices.view", label: "See invoices and their PDFs", group: "Money" },
  { id: "retainers.view", label: "See retainers", group: "Money" },
  { id: "documents.view", label: "See and generate case documents", group: "Operations" },
  { id: "records.edit", label: "Create and edit records (leads, cases, notes, payments, invoices...)", group: "Operations" },
  { id: "records.archive", label: "Archive and restore records", group: "Admin" },
  { id: "data.export", label: "Download CSV exports", group: "Admin" },
  { id: "documents.templates", label: "Edit document templates and branding", group: "Admin" },
  { id: "team.manage", label: "Add, deactivate and choose team members", group: "Admin" },
  { id: "settings.manage", label: "Open Settings", group: "Admin" },
] as const;

export type Permission = (typeof PERMISSIONS)[number]["id"];

const ALL: readonly Permission[] = PERMISSIONS.map((p) => p.id);

const VIEWER: readonly Permission[] = [
  "dashboard.view",
  "cases.view",
  "metrics.view",
  "help.view",
  "project.view",
];

const STAFF: readonly Permission[] = [
  ...VIEWER,
  "leads.view",
  "clients.view",
  "partners.view",
  "network.view",
  "ambassadors.view",
  "channels.view",
  "content.view",
  "payments.view",
  "invoices.view",
  "retainers.view",
  "documents.view",
  "records.edit",
];

export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  super_admin: ALL,
  staff: STAFF,
  viewer: VIEWER,
};

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super admin",
  staff: "Staff",
  viewer: "Viewer",
};

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  super_admin: "Everything, including Settings, team, templates and branding, exports and archiving.",
  staff: "Day-to-day work on every operational screen. No Settings, templates, exports or archiving.",
  viewer: "Read-only: dashboard, cases, metrics, help and the project tracker.",
};

export function can(role: Role | null | undefined, permission: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function permissionLabel(permission: string): string {
  return PERMISSIONS.find((p) => p.id === permission)?.label ?? permission;
}

/**
 * Session with role, or a redirect: no session -> login; missing permission ->
 * dashboard with ?denied=<permission> (the nav shows a toast). Request-time
 * only, so call inside <Suspense>.
 */
export async function requirePermission(permission: Permission): Promise<SessionPayload> {
  const session = await requireAdmin();
  if (!can(session.role, permission)) redirect(`/admin?denied=${encodeURIComponent(permission)}`);
  return session;
}

/** Which permission opens each control-panel nav item. */
export const NAV_PERMISSIONS: Record<string, Permission> = {
  "/admin": "dashboard.view",
  "/admin/leads": "leads.view",
  "/admin/cases": "cases.view",
  "/admin/clients": "clients.view",
  "/admin/partners": "partners.view",
  "/admin/network": "network.view",
  "/admin/ambassadors": "ambassadors.view",
  "/admin/channels": "channels.view",
  "/admin/content": "content.view",
  "/admin/payments": "payments.view",
  "/admin/invoices": "invoices.view",
  "/admin/documents": "documents.view",
  "/admin/retainers": "retainers.view",
  "/admin/metrics": "metrics.view",
  "/admin/project": "project.view",
  "/admin/help": "help.view",
  "/admin/settings": "settings.manage",
};

/** Nav hrefs the role may open (unknown hrefs are hidden). */
export function navForRole(role: Role): string[] {
  return Object.entries(NAV_PERMISSIONS)
    .filter(([, permission]) => can(role, permission))
    .map(([href]) => href);
}
