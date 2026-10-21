import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import { DueBadge, StageBadge, TONE_DOT, STAGE_TONE, UrgencyBadge } from "@/components/admin/badges";
import { EmptyState } from "@/components/admin/empty-state";
import { ageLabel, dueLabel, formatDate, formatUsd } from "@/components/admin/format";
import { PageHeader } from "@/components/admin/page-header";
import { CardsSkeleton, TableSkeleton } from "@/components/admin/skeletons";
import { StatCard } from "@/components/admin/stat-card";
import { Card, CardContent, CardHeader, CardTitle, CardAction } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth";
import { CASE_CATEGORY_LABELS, CASE_STAGE_LABELS, CASE_STAGES, PRODUCT_LABELS } from "@/lib/db/enums";
import { getDashboard } from "@/lib/queries/dashboard";
import { cn } from "@/lib/utils";

export const metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <>
      <PageHeader title="Today" description="What needs doing now: next actions, memos due, new leads and the pipeline." />
      <Suspense
        fallback={
          <div className="space-y-6">
            <CardsSkeleton count={5} />
            <TableSkeleton rows={4} />
          </div>
        }
      >
        <Dashboard />
      </Suspense>
    </>
  );
}

async function Dashboard() {
  await requireAdmin();
  const now = new Date();
  const d = await getDashboard(now);
  const actionCount = d.overdue.length + d.dueToday.length;
  const open = CASE_STAGES.filter((s) => s !== "closed" && s !== "declined");
  const openTotal = open.reduce((n, s) => n + (d.stageCounts[s] ?? 0), 0);
  const maxStage = Math.max(1, ...CASE_STAGES.map((s) => d.stageCounts[s] ?? 0));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard
          label="Actions due"
          value={actionCount}
          hint={`${d.overdue.length} overdue, ${d.dueToday.length} today`}
          tone={d.overdue.length ? "danger" : actionCount ? "warning" : "success"}
          href="/admin/cases?open=1&sort=due&dir=asc"
        />
        <StatCard
          label="New leads"
          value={d.newLeads}
          hint="Waiting for first contact"
          tone={d.newLeads ? "info" : "neutral"}
          href="/admin/leads?status=new"
        />
        <StatCard
          label="Memos due"
          value={d.memoDue.length}
          hint="Older than 3 working days"
          tone={d.memoDue.length ? "danger" : "success"}
        />
        <StatCard
          label="Revenue this month"
          value={formatUsd(d.revenueThisMonth)}
          hint={`${d.paymentsThisMonth} paid payments`}
          href="/admin/payments?status=paid"
        />
        <StatCard
          label="Paid cases"
          value={`${d.paidCases} / 20`}
          hint="90-day gate target"
          tone={d.paidCases >= 20 ? "success" : "primary"}
          href="/admin/metrics"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Next actions due</CardTitle>
            <CardAction>
              <Link href="/admin/cases?open=1&sort=due&dir=asc" className="text-sm text-primary hover:underline">
                All open cases
              </Link>
            </CardAction>
          </CardHeader>
          <CardContent>
            {actionCount === 0 ? (
              <EmptyState
                title="Nothing due today"
                description={
                  d.openWithoutNextAction
                    ? `${d.openWithoutNextAction} open cases have no next action date. Give each one a date so nothing slips.`
                    : "Every open case has a future next action."
                }
              />
            ) : (
              <ul className="divide-y">
                {[...d.overdue, ...d.dueToday].map((c) => {
                  const due = dueLabel(c.nextActionDue!, now);
                  return (
                    <li key={c.id}>
                      <Link
                        href={`/admin/cases/${c.id}`}
                        className="-mx-2 flex flex-col gap-1 rounded-lg px-2 py-2.5 hover:bg-muted/60 sm:flex-row sm:items-center sm:gap-3"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-muted-foreground">{c.caseNumber}</span>
                          <DueBadge label={due.label} tone={due.tone} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{c.nextAction ?? "No next action written"}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {c.clientName} · {PRODUCT_LABELS[c.product]}
                            {c.managerName ? ` · ${c.managerName}` : " · unassigned"}
                          </p>
                        </div>
                        <StageBadge stage={c.stage} />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
            {actionCount > 0 && d.openWithoutNextAction ? (
              <p className="mt-3 text-xs text-muted-foreground">
                Also: {d.openWithoutNextAction} open cases have no next action date.
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pipeline</CardTitle>
            <CardAction>
              <Link href="/admin/cases?view=board" className="text-sm text-primary hover:underline">
                Board
              </Link>
            </CardAction>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-xs text-muted-foreground">{openTotal} open cases</p>
            <ul className="space-y-2">
              {CASE_STAGES.map((s) => {
                const n = d.stageCounts[s] ?? 0;
                return (
                  <li key={s}>
                    <Link href={`/admin/cases?stage=${s}`} className="group grid grid-cols-[8.5rem_1fr_2rem] items-center gap-2 text-sm">
                      <span className="truncate text-muted-foreground group-hover:text-foreground">
                        {CASE_STAGE_LABELS[s]}
                      </span>
                      <span className="h-2 overflow-hidden rounded-full bg-muted">
                        <span
                          className={cn("block h-full rounded-full", TONE_DOT[STAGE_TONE[s]])}
                          style={{ width: `${(n / maxStage) * 100}%` }}
                        />
                      </span>
                      <span className="text-right font-mono tabular-nums">{n}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Memo deliveries due</CardTitle>
          </CardHeader>
          <CardContent>
            {d.memoDue.length === 0 ? (
              <EmptyState title="No memos overdue" description="Every memo case is inside the 3-working-day window." />
            ) : (
              <ul className="divide-y">
                {d.memoDue.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/admin/cases/${c.id}`}
                      className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-muted/60"
                    >
                      <span className="font-mono text-xs text-muted-foreground">{c.caseNumber}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{c.clientName}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {CASE_CATEGORY_LABELS[c.category]} · opened {formatDate(c.createdAt)} ({ageLabel(c.createdAt, now)})
                        </p>
                      </div>
                      <StageBadge stage={c.stage} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>New leads</CardTitle>
            <CardAction>
              <Link href="/admin/leads?status=new" className="text-sm text-primary hover:underline">
                All leads
              </Link>
            </CardAction>
          </CardHeader>
          <CardContent>
            {d.recentLeads.length === 0 ? (
              <EmptyState title="No new leads" description="Leads from the intake form and WhatsApp land here." />
            ) : (
              <ul className="divide-y">
                {d.recentLeads.map((l) => (
                  <li key={l.id}>
                    <Link
                      href={`/admin/leads/${l.id}`}
                      className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-muted/60"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{l.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {CASE_CATEGORY_LABELS[l.category]} · {l.source} · {ageLabel(l.createdAt, now)}
                        </p>
                      </div>
                      <UrgencyBadge urgency={l.urgency} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { href: "/admin/cases/new", label: "Open a case" },
          { href: "/admin/leads/new", label: "Log a lead" },
          { href: "/admin/channels?view=due", label: "Channels due a post" },
          { href: "/admin/content", label: "Content calendar" },
          { href: "/admin/metrics", label: "90-day gate" },
        ].map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-sm hover:border-primary/30 hover:text-primary"
          >
            {l.label}
            <ArrowRightIcon className="size-3.5" aria-hidden />
          </Link>
        ))}
      </div>
    </div>
  );
}
