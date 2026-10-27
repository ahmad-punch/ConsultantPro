import { HelpButton } from "@/components/admin/help-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PERMISSIONS, ROLES, ROLE_DESCRIPTIONS, ROLE_LABELS, can } from "@/lib/rbac";

/** Read-only roles and permissions matrix for Settings (decision 0006). */
export function RolesCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-1.5">
          Roles
          <HelpButton topic="settings" section="roles" />
        </CardTitle>
        <CardDescription>
          Roles come from environment variables for now (SUPER_ADMIN_EMAIL / SUPER_ADMIN_PASSWORD, ADMIN_PASSWORD for
          staff, VIEWER_PASSWORD). A role editor backed by the database is planned; see decision 0006 in
          docs/decisions/0006-roles-and-access.md.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-3">
        {ROLES.map((role) => (
          <section key={role} className="rounded-lg border p-3">
            <h3 className="text-sm font-semibold">{ROLE_LABELS[role]}</h3>
            <p className="mb-2 text-xs text-muted-foreground">{ROLE_DESCRIPTIONS[role]}</p>
            <ul className="space-y-1 text-sm">
              {PERMISSIONS.filter((p) => can(role, p.id)).map((p) => (
                <li key={p.id} className="flex gap-1.5">
                  <span aria-hidden className="text-success">
                    &#10003;
                  </span>
                  {p.label}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </CardContent>
    </Card>
  );
}
