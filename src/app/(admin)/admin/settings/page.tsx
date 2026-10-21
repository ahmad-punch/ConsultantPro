import { CheckCircle2Icon, CircleAlertIcon } from "lucide-react";
import { Suspense } from "react";

import { ActionButton } from "@/components/admin/action-form";
import { ActiveBadge } from "@/components/admin/badges";
import { FormDialog } from "@/components/admin/form-dialog";
import { HelpButton } from "@/components/admin/help-button";
import { ActorForm, TeamMemberForm } from "@/components/admin/forms/team-form";
import { PageHeader } from "@/components/admin/page-header";
import { TableSkeleton } from "@/components/admin/skeletons";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toggleTeamMemberAction } from "@/lib/actions/team";
import { requireAdmin } from "@/lib/auth";
import { getDbDriver } from "@/lib/db";
import { TEAM_ROLE_LABELS } from "@/lib/db/enums";
import { offerings, getStripeLink } from "@/lib/pricing";
import { getActorLabel } from "@/lib/queries/actor";
import { listTeam } from "@/lib/queries/team";
import { hasWhatsapp, isPlaceholder, site } from "@/lib/site";

export const metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        helpTopic="settings"
        title="Settings"
        description="Configuration comes from environment variables and src/lib/site.ts; change it there and redeploy."
      />
      <Suspense fallback={<TableSkeleton rows={8} />}>
        <Settings />
      </Suspense>
    </>
  );
}

async function Settings() {
  await requireAdmin();
  const [team, actor] = await Promise.all([listTeam(), getActorLabel()]);
  const driver = getDbDriver();
  const activeTeam = team.filter((t) => t.member.active).map((t) => ({ value: t.member.id, label: t.member.name }));
  const currentId = team.find((t) => t.member.name === actor)?.member.id;

  const config: { label: string; value: string; ok: boolean; hint?: string }[] = [
    { label: "Site name", value: site.name, ok: true },
    { label: "Site URL", value: site.url, ok: !site.url.includes("localhost"), hint: "NEXT_PUBLIC_SITE_URL" },
    { label: "WhatsApp number", value: hasWhatsapp ? "Set" : "Not set", ok: hasWhatsapp, hint: "NEXT_PUBLIC_WHATSAPP_NUMBER" },
    { label: "Contact email", value: isPlaceholder(site.email) ? "Not set" : site.email, ok: !isPlaceholder(site.email), hint: "NEXT_PUBLIC_CONTACT_EMAIL" },
    { label: "Legal entity", value: isPlaceholder(site.legalEntity) ? "Placeholder" : "Set", ok: !isPlaceholder(site.legalEntity), hint: "src/lib/site.ts" },
    {
      label: "Database",
      value: driver === "neon" ? "Neon Postgres" : driver === "pglite" ? "Local PGlite (.pglite/)" : "In-memory PGlite",
      ok: driver === "neon" || process.env.NODE_ENV !== "production",
      hint: "DATABASE_URL",
    },
    { label: "Admin password", value: process.env.ADMIN_PASSWORD ? "Set" : "Dev default", ok: !!process.env.ADMIN_PASSWORD, hint: "ADMIN_PASSWORD" },
    { label: "Session secret", value: process.env.AUTH_SECRET ? "Set" : "Not set", ok: !!process.env.AUTH_SECRET, hint: "AUTH_SECRET" },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-1.5">
            Acting as
            <HelpButton topic="settings" section="acting-as" />
          </CardTitle>
          <CardDescription>
            Everyone shares one password, so pick who you are on this browser. Your name goes on case notes and stage changes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeTeam.length ? (
            <ActorForm team={activeTeam} currentId={currentId} />
          ) : (
            <p className="text-sm text-muted-foreground">Add a team member first.</p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>Values are read-only here. Secrets are never shown.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="divide-y text-sm">
              {config.map((c) => (
                <li key={c.label} className="flex items-start gap-3 py-2">
                  {c.ok ? (
                    <CheckCircle2Icon className="mt-0.5 size-4 shrink-0 text-success" aria-label="OK" />
                  ) : (
                    <CircleAlertIcon className="mt-0.5 size-4 shrink-0 text-warning" aria-label="Needs attention" />
                  )}
                  <span className="w-32 shrink-0 text-muted-foreground">{c.label}</span>
                  <span className="min-w-0 flex-1 break-words">
                    {c.value}
                    {c.hint ? <span className="block font-mono text-xs text-muted-foreground">{c.hint}</span> : null}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stripe payment links</CardTitle>
            <CardDescription>From the NEXT_PUBLIC_STRIPE_LINK_* variables named in src/lib/pricing.ts.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="divide-y text-sm">
              {offerings.map((o) => {
                const link = getStripeLink(o.id);
                return (
                  <li key={o.id} className="flex items-start gap-3 py-2">
                    {link ? (
                      <CheckCircle2Icon className="mt-0.5 size-4 shrink-0 text-success" aria-label="Set" />
                    ) : (
                      <CircleAlertIcon className="mt-0.5 size-4 shrink-0 text-warning" aria-label="Not set" />
                    )}
                    <span className="flex-1">
                      {o.name}
                      <span className="block font-mono text-xs text-muted-foreground">{o.stripeLinkEnv}</span>
                    </span>
                    <span className={link ? "text-success" : "text-muted-foreground"}>{link ? "Set" : "Not set"}</span>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team</CardTitle>
          <CardDescription>Case managers appear in case assignment. Deactivated members stay on their past cases.</CardDescription>
          <CardAction>
            <FormDialog triggerLabel="Add member" triggerSize="sm" title="Add a team member">
              <TeamMemberForm />
            </FormDialog>
          </CardAction>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="hidden sm:table-cell">Email</TableHead>
                <TableHead className="text-right">Open cases</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {team.map(({ member: t, openCases }) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.name}</TableCell>
                  <TableCell>{TEAM_ROLE_LABELS[t.role]}</TableCell>
                  <TableCell className="hidden sm:table-cell">{t.email}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums">{openCases}</TableCell>
                  <TableCell>
                    <ActiveBadge active={t.active} />
                  </TableCell>
                  <TableCell className="text-right">
                    <ActionButton
                      action={toggleTeamMemberAction}
                      fields={{ id: t.id }}
                      variant="ghost"
                      confirm={t.active ? `Deactivate ${t.name}?` : undefined}
                    >
                      {t.active ? "Deactivate" : "Reactivate"}
                    </ActionButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
