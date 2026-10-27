import { CheckCircle2Icon, CircleDashedIcon, XCircleIcon } from "lucide-react";
import Form from "next/form";
import Link from "next/link";
import { Suspense } from "react";

import { EmptyState } from "@/components/admin/empty-state";
import { FormDialog } from "@/components/admin/form-dialog";
import { formatDate, formatUsd, toDateInput } from "@/components/admin/format";
import { HelpButton } from "@/components/admin/help-button";
import { PageHeader } from "@/components/admin/page-header";
import { CardsSkeleton, TableSkeleton } from "@/components/admin/skeletons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requirePermission } from "@/lib/rbac";
import {
  CASE_CATEGORY_LABELS,
  CHANNEL_PLATFORM_LABELS,
  CHANNEL_STATUSES,
  CHANNEL_STATUS_LABELS,
  PRODUCTS,
  PRODUCT_LABELS,
} from "@/lib/db/enums";
import { getFirstCaseDate, getMetrics, listMetricsSnapshots, type GateMetric } from "@/lib/queries/metrics";
import { param } from "@/lib/queries/params";
import { addDays, startOfDayUtc, startOfMonthUtc } from "@/lib/queries/time";
import { cn } from "@/lib/utils";
import { parseDateInput } from "@/lib/validation/fields";

import { SnapshotForm } from "./snapshot-form";

export const metadata = { title: "Metrics" };

type SP = PageProps<"/admin/metrics">["searchParams"];

export default function MetricsPage({ searchParams }: PageProps<"/admin/metrics">) {
  return (
    <>
      <PageHeader
        helpTopic="metrics"
        title="Metrics"
        description="The 90-day gate from the business plan (section 10.2): go if all six pass within 60 days of the first sale."
      />
      <Suspense
        fallback={
          <div className="space-y-6">
            <CardsSkeleton count={6} />
            <TableSkeleton rows={4} />
          </div>
        }
      >
        <Metrics searchParams={searchParams} />
      </Suspense>
    </>
  );
}

function readDate(v: string | undefined): Date | null {
  if (!v || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return null;
  const d = startOfDayUtc(parseDateInput(v));
  return Number.isNaN(d.getTime()) ? null : d;
}

async function Metrics({ searchParams }: { searchParams: SP }) {
  await requirePermission("metrics.view");
  const sp = await searchParams;
  const now = new Date();
  const today = startOfDayUtc(now);
  const first = await getFirstCaseDate();
  const firstDay = first ? startOfDayUtc(first) : today;
  const from = readDate(param(sp, "from")) ?? firstDay;
  const toDay = readDate(param(sp, "to")) ?? today;
  const range = { from, to: addDays(toDay, 1) };
  const [m, snapshots] = await Promise.all([getMetrics(range), listMetricsSnapshots()]);

  const presets = [
    { label: "Since first case", from: firstDay, to: today },
    { label: "First 60 days", from: firstDay, to: addDays(firstDay, 59) },
    { label: "Last 30 days", from: addDays(today, -29), to: today },
    { label: "This month", from: startOfMonthUtc(now), to: today },
  ];
  const isPreset = (p: (typeof presets)[number]) =>
    p.from.getTime() === from.getTime() && p.to.getTime() === toDay.getTime();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-xl border bg-card p-3 lg:flex-row lg:items-end lg:justify-between">
        <Form action="/admin/metrics" className="flex flex-wrap items-end gap-2">
          <div className="grid gap-1">
            <Label htmlFor="from" className="text-xs">From</Label>
            <Input id="from" name="from" type="date" defaultValue={toDateInput(from)} className="w-40" />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="to" className="text-xs">To</Label>
            <Input id="to" name="to" type="date" defaultValue={toDateInput(toDay)} className="w-40" />
          </div>
          <Button type="submit" variant="outline">Apply</Button>
        </Form>
        <div className="flex flex-wrap gap-1">
          {presets.map((p) => (
            <Link
              key={p.label}
              href={`/admin/metrics?from=${toDateInput(p.from)}&to=${toDateInput(p.to)}`}
              className={cn(
                "rounded-full border px-3 py-1 text-xs hover:border-primary/40",
                isPreset(p) && "border-primary bg-primary text-primary-foreground",
              )}
            >
              {p.label}
            </Link>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-sm font-semibold">
            Gate: {m.passed} of {m.gate.length} passing
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-xs text-muted-foreground">
              {formatDate(from)} to {formatDate(toDay)}
              {first ? ` · first case ${formatDate(first)}` : " · no cases yet"}
            </p>
            <div className="inline-flex items-center gap-0.5">
              <FormDialog
                triggerLabel="Save snapshot"
                triggerVariant="outline"
                triggerSize="sm"
                title="Save a snapshot of the gate"
                description="Stores the six gate values and pass flags for this range, so you can compare later."
              >
                <SnapshotForm
                  from={toDateInput(from)}
                  to={toDateInput(toDay)}
                  label={`${formatDate(from)} to ${formatDate(toDay)}`}
                />
              </FormDialog>
              <HelpButton topic="metrics" section="save-snapshot" />
            </div>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {m.gate.map((g) => (
            <GateCard key={g.key} g={g} />
          ))}
        </div>
      </div>

      <SnapshotHistory snapshots={snapshots} gate={m.gate} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Leads by source</CardTitle>
            <CardDescription>{m.leadsTotal} leads received in range</CardDescription>
          </CardHeader>
          <CardContent>
            {m.leadsBySource.length === 0 ? (
              <EmptyState title="No leads in range" />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Source</TableHead>
                    <TableHead className="w-2/5">Share</TableHead>
                    <TableHead className="text-right">Leads</TableHead>
                    <TableHead className="text-right">Converted</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {m.leadsBySource.map((r) => (
                    <TableRow key={r.source}>
                      <TableCell>{r.source}</TableCell>
                      <TableCell>
                        <Bar value={r.total} max={m.leadsBySource[0].total} />
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums">{r.total}</TableCell>
                      <TableCell className="text-right font-mono tabular-nums">
                        {r.converted}
                        <span className="text-muted-foreground"> ({Math.round((r.converted / r.total) * 100)}%)</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cases by category</CardTitle>
            <CardDescription>Cases opened in range; revenue is the price of paid cases</CardDescription>
          </CardHeader>
          <CardContent>
            {m.casesByCategory.length === 0 ? (
              <EmptyState title="No cases in range" />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead className="w-1/3">Share</TableHead>
                    <TableHead className="text-right">Cases</TableHead>
                    <TableHead className="text-right">Paid</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {m.casesByCategory.map((r) => (
                    <TableRow key={r.category}>
                      <TableCell>{CASE_CATEGORY_LABELS[r.category]}</TableCell>
                      <TableCell>
                        <Bar value={r.total} max={Math.max(...m.casesByCategory.map((x) => x.total))} />
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums">{r.total}</TableCell>
                      <TableCell className="text-right font-mono tabular-nums">{r.paid}</TableCell>
                      <TableCell className="text-right font-mono tabular-nums">{formatUsd(r.revenueUsd)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue by product by month</CardTitle>
          <CardDescription>Paid payments by the month they were paid (UTC). Total {formatUsd(m.revenue)}.</CardDescription>
        </CardHeader>
        <CardContent>
          {m.revenueByMonth.length === 0 ? (
            <EmptyState title="No paid payments in range" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  {PRODUCTS.map((p) => (
                    <TableHead key={p} className="text-right">
                      {PRODUCT_LABELS[p]}
                    </TableHead>
                  ))}
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {m.revenueByMonth.map((r) => (
                  <TableRow key={r.month}>
                    <TableCell className="font-mono">{r.month}</TableCell>
                    {PRODUCTS.map((p) => (
                      <TableCell key={p} className={cn("text-right font-mono tabular-nums", !r.byProduct[p] && "text-muted-foreground")}>
                        {r.byProduct[p] ? formatUsd(r.byProduct[p]) : "-"}
                      </TableCell>
                    ))}
                    <TableCell className="text-right font-mono font-semibold tabular-nums">{formatUsd(r.total)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Channel coverage</CardTitle>
          <CardDescription>All channels by platform and status (not filtered by date)</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Platform</TableHead>
                {CHANNEL_STATUSES.map((s) => (
                  <TableHead key={s} className="text-right">
                    {CHANNEL_STATUS_LABELS[s]}
                  </TableHead>
                ))}
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {m.channelCoverage.map((r) => (
                <TableRow key={r.platform}>
                  <TableCell>
                    <Link href={`/admin/channels?platform=${r.platform}`} className="hover:text-primary hover:underline">
                      {CHANNEL_PLATFORM_LABELS[r.platform]}
                    </Link>
                  </TableCell>
                  {CHANNEL_STATUSES.map((s) => (
                    <TableCell key={s} className={cn("text-right font-mono tabular-nums", !r.byStatus[s] && "text-muted-foreground")}>
                      {r.byStatus[s] || "-"}
                    </TableCell>
                  ))}
                  <TableCell className="text-right font-mono font-semibold tabular-nums">{r.total}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <details className="rounded-xl border bg-card p-4 text-sm">
        <summary className="cursor-pointer font-medium">How each gate metric is calculated</summary>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-muted-foreground">
          <li>Paid cases: cases opened in the range whose payment status is paid.</li>
          <li>Revenue per paid interaction: total of paid payments (cases and retainers) dated in the range, divided by their number.</li>
          <li>Referrals: share of those paid cases linked to an ambassador or to an earlier client&apos;s case.</li>
          <li>Retainer sign-ups: retainers started in the range, including ones since cancelled.</li>
          <li>Days to memo: working days (Mon-Fri) from case opened to memo delivered; median over cases opened in the range.</li>
          <li>Would recommend: closed cases in the range with an answer recorded at close-out.</li>
        </ul>
      </details>
    </div>
  );
}

/** Help section slug for each gate metric key (H3s in docs/help/screens/metrics.md). */
const GATE_HELP: Record<string, string> = {
  paid: "paid-cases",
  blended: "revenue-per-paid-interaction",
  referrals: "referrals",
  retainers: "retainer-sign-ups",
  memo: "median-days-to-memo",
  recommend: "would-recommend",
};

function GateCard({ g }: { g: GateMetric }) {
  const Icon = g.pass === null ? CircleDashedIcon : g.pass ? CheckCircle2Icon : XCircleIcon;
  return (
    <div
      className={cn(
        "rounded-xl border p-4",
        g.pass === true && "border-success/30 bg-success-soft",
        g.pass === false && "border-destructive/25 bg-destructive/5",
        g.pass === null && "bg-card",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="flex items-center gap-1 text-sm font-medium">
          {g.label}
          <HelpButton topic="metrics" section={[GATE_HELP[g.key], "the-six-gate-metrics"].filter((s): s is string => !!s)} label={g.label} />
        </p>
        <Icon
          className={cn(
            "size-5 shrink-0",
            g.pass === true && "text-success",
            g.pass === false && "text-destructive",
            g.pass === null && "text-muted-foreground",
          )}
          aria-label={g.pass === null ? "No data" : g.pass ? "Passing" : "Not passing"}
        />
      </div>
      <p className="mt-2 font-mono text-3xl font-semibold tracking-tight tabular-nums">{g.display}</p>
      <p className="mt-1 text-xs">
        <span className="font-medium">Target: {g.threshold}</span>
        <span className="text-muted-foreground"> · {g.detail}</span>
      </p>
    </div>
  );
}

function Bar({ value, max }: { value: number; max: number }) {
  return (
    <span className="block h-2 overflow-hidden rounded-full bg-muted" aria-hidden>
      <span className="block h-full rounded-full bg-primary/70" style={{ width: `${max ? (value / max) * 100 : 0}%` }} />
    </span>
  );
}

type Snapshot = Awaited<ReturnType<typeof listMetricsSnapshots>>[number];

/** Format a stored gate value the way the card shows it. */
function snapshotValue(key: string, v: number | boolean | null | undefined): string {
  if (v === null || v === undefined || typeof v === "boolean") return "-";
  if (key === "blended") return formatUsd(Math.round(v));
  if (key === "referrals" || key === "recommend") return `${Math.round(v * 100)}%`;
  if (key === "memo") return v.toFixed(1);
  return String(v);
}

function SnapshotHistory({ snapshots, gate }: { snapshots: Snapshot[]; gate: GateMetric[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>History</CardTitle>
        <CardDescription>Saved snapshots of the gate, newest first.</CardDescription>
      </CardHeader>
      <CardContent>
        {snapshots.length === 0 ? (
          <EmptyState title="No snapshots yet" description="Use Save snapshot to record the gate at a review point." />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Saved</TableHead>
                  <TableHead className="hidden md:table-cell">Range</TableHead>
                  {gate.map((g) => (
                    <TableHead key={g.key} className="text-right">
                      {g.label}
                    </TableHead>
                  ))}
                  <TableHead className="text-right">Passing</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {snapshots.map((s) => {
                  const v = s.values ?? {};
                  const passed = typeof v.passed === "number" ? v.passed : gate.filter((g) => v[`${g.key}Pass`] === true).length;
                  return (
                    <TableRow key={s.id}>
                      <TableCell>
                        <span className="block">{formatDate(s.takenAt)}</span>
                        {s.note ? <span className="block max-w-48 truncate text-xs text-muted-foreground">{s.note}</span> : null}
                      </TableCell>
                      <TableCell className="hidden text-xs text-muted-foreground md:table-cell">
                        {s.rangeFrom ? formatDate(s.rangeFrom) : "-"} to{" "}
                        {s.rangeTo ? formatDate(addDays(s.rangeTo, -1)) : "-"}
                      </TableCell>
                      {gate.map((g) => {
                        const pass = v[`${g.key}Pass`];
                        return (
                          <TableCell
                            key={g.key}
                            className={cn(
                              "text-right font-mono tabular-nums",
                              pass === true && "text-success",
                              pass === false && "text-destructive",
                            )}
                          >
                            {snapshotValue(g.key, v[g.key])}
                          </TableCell>
                        );
                      })}
                      <TableCell className="text-right font-mono tabular-nums">
                        {passed}/{gate.length}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
