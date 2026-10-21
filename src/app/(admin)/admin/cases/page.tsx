import { KanbanSquareIcon, ListIcon } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import { DueBadge, PaymentBadge, STAGE_TONE, StageBadge, TONE_DOT } from "@/components/admin/badges";
import { EmptyState } from "@/components/admin/empty-state";
import { FilterBar } from "@/components/admin/filter-bar";
import { buildHref, dueLabel, enumOptions, formatDate, formatUsd } from "@/components/admin/format";
import { PageHeader } from "@/components/admin/page-header";
import { TableSkeleton } from "@/components/admin/skeletons";
import { SortLink } from "@/components/admin/sort-link";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireAdmin } from "@/lib/auth";
import {
  CASE_CATEGORIES,
  CASE_CATEGORY_LABELS,
  CASE_STAGES,
  CASE_STAGE_LABELS,
  PAYMENT_STATUSES,
  PAYMENT_STATUS_LABELS,
  PRODUCTS,
  PRODUCT_LABELS,
} from "@/lib/db/enums";
import { listCases, readCaseFilters, type CaseListRow } from "@/lib/queries/cases";
import { getTeamOptions } from "@/lib/queries/options";
import { param } from "@/lib/queries/params";
import { cn } from "@/lib/utils";

export const metadata = { title: "Cases" };

type SP = PageProps<"/admin/cases">["searchParams"];

export default function CasesPage({ searchParams }: PageProps<"/admin/cases">) {
  return (
    <>
      <PageHeader
        title="Cases"
        description="Every paid or prospective matter, from intake to close."
        actions={
          <Button asChild>
            <Link href="/admin/cases/new">New case</Link>
          </Button>
        }
      />
      <Suspense fallback={<TableSkeleton rows={8} />}>
        <Cases searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Cases({ searchParams }: { searchParams: SP }) {
  await requireAdmin();
  const sp = await searchParams;
  const f = readCaseFilters(sp);
  const board = param(sp, "view") === "board";
  const [rows, team] = await Promise.all([listCases(f), getTeamOptions(true)]);
  const now = new Date();
  const params = {
    q: f.q,
    stage: f.stage,
    category: f.category,
    product: f.product,
    payment: f.payment,
    manager: f.manager,
    open: f.open ? "1" : undefined,
    sort: f.sort === "created" && f.dir === "desc" ? undefined : f.sort,
    dir: f.sort === "created" && f.dir === "desc" ? undefined : f.dir,
    view: board ? "board" : undefined,
  };
  const base = "/admin/cases";
  const filtered = !!(f.q || f.stage || f.category || f.product || f.payment || f.manager || f.open);

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex rounded-lg border bg-card p-0.5" role="group" aria-label="View">
          <ViewLink href={buildHref(base, params, { view: undefined })} active={!board} icon={<ListIcon />}>
            List
          </ViewLink>
          <ViewLink href={buildHref(base, params, { view: "board" })} active={board} icon={<KanbanSquareIcon />}>
            Board
          </ViewLink>
        </div>
        <p className="text-xs text-muted-foreground">{rows.length} cases</p>
      </div>
      <FilterBar
        basePath={base}
        values={params}
        searchPlaceholder="Case number, client, summary"
        filters={[
          { name: "open", label: "Cases", options: [{ value: "1", label: "Open only" }] },
          ...(board ? [] : [{ name: "stage", label: "Stages", options: enumOptions(CASE_STAGES, CASE_STAGE_LABELS) }]),
          { name: "category", label: "Categories", options: enumOptions(CASE_CATEGORIES, CASE_CATEGORY_LABELS) },
          { name: "product", label: "Products", options: enumOptions(PRODUCTS, PRODUCT_LABELS) },
          { name: "payment", label: "Payments", options: enumOptions(PAYMENT_STATUSES, PAYMENT_STATUS_LABELS) },
          { name: "manager", label: "Managers", options: [{ value: "none", label: "Unassigned" }, ...team] },
        ]}
      />
      {rows.length === 0 ? (
        <EmptyState
          title={filtered ? "No cases match these filters" : "No cases yet"}
          description="Open a case from a lead, or start one directly."
          action={
            <Button asChild size="sm">
              <Link href="/admin/cases/new">New case</Link>
            </Button>
          }
        />
      ) : board ? (
        <Board rows={rows} now={now} />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <SortLink label="Case" sortKey="caseNumber" basePath={base} params={params} current={f.sort} dir={f.dir} />
                </TableHead>
                <TableHead>
                  <SortLink label="Client" sortKey="client" basePath={base} params={params} current={f.sort} dir={f.dir} />
                </TableHead>
                <TableHead className="hidden lg:table-cell">Product</TableHead>
                <TableHead>
                  <SortLink label="Stage" sortKey="stage" basePath={base} params={params} current={f.sort} dir={f.dir} />
                </TableHead>
                <TableHead className="hidden sm:table-cell text-right">
                  <SortLink label="Price" sortKey="price" basePath={base} params={params} current={f.sort} dir={f.dir} />
                </TableHead>
                <TableHead className="hidden md:table-cell">Payment</TableHead>
                <TableHead className="hidden md:table-cell">
                  <SortLink label="Next action" sortKey="due" basePath={base} params={params} current={f.sort} dir={f.dir} />
                </TableHead>
                <TableHead className="hidden xl:table-cell">Manager</TableHead>
                <TableHead className="hidden xl:table-cell">
                  <SortLink label="Opened" sortKey="created" basePath={base} params={params} current={f.sort} dir={f.dir} />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((c) => {
                const due = c.nextActionDue && c.stage !== "closed" && c.stage !== "declined" ? dueLabel(c.nextActionDue, now) : null;
                return (
                  <TableRow key={c.id}>
                    <TableCell>
                      <Link href={`/admin/cases/${c.id}`} className="font-mono text-sm font-medium text-primary hover:underline">
                        {c.caseNumber}
                      </Link>
                    </TableCell>
                    <TableCell className="max-w-56">
                      <span className="block truncate font-medium">{c.clientName}</span>
                      <span className="block truncate text-xs text-muted-foreground">{CASE_CATEGORY_LABELS[c.category]}</span>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">{PRODUCT_LABELS[c.product]}</TableCell>
                    <TableCell>
                      <StageBadge stage={c.stage} />
                    </TableCell>
                    <TableCell className="hidden text-right font-mono tabular-nums sm:table-cell">{formatUsd(c.priceUsd)}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <PaymentBadge status={c.paymentStatus} />
                    </TableCell>
                    <TableCell className="hidden max-w-60 md:table-cell">
                      {c.nextAction || due ? (
                        <div className="flex items-center gap-2">
                          {due ? <DueBadge label={due.label} tone={due.tone} /> : null}
                          <span className="truncate text-xs text-muted-foreground">{c.nextAction}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">{c.managerName ?? <span className="text-muted-foreground">Unassigned</span>}</TableCell>
                    <TableCell className="hidden xl:table-cell">{formatDate(c.createdAt)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}

function ViewLink({
  href,
  active,
  icon,
  children,
}: {
  href: string;
  active: boolean;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm text-muted-foreground [&_svg]:size-4",
        active && "bg-primary text-primary-foreground",
      )}
    >
      {icon}
      {children}
    </Link>
  );
}

function Board({ rows, now }: { rows: CaseListRow[]; now: Date }) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
      <div className="flex min-w-max gap-3">
        {CASE_STAGES.map((stage) => {
          const items = rows.filter((r) => r.stage === stage);
          const shown = stage === "closed" || stage === "declined" ? items.slice(0, 12) : items;
          return (
            <section key={stage} className="flex w-64 shrink-0 flex-col rounded-xl border bg-muted/40" aria-label={CASE_STAGE_LABELS[stage]}>
              <header className="flex items-center gap-2 px-3 py-2.5">
                <span className={cn("size-2 rounded-full", TONE_DOT[STAGE_TONE[stage]])} aria-hidden />
                <h2 className="text-sm font-semibold">{CASE_STAGE_LABELS[stage]}</h2>
                <span className="ml-auto font-mono text-xs text-muted-foreground">{items.length}</span>
              </header>
              <ul className="flex flex-1 flex-col gap-2 px-2 pb-2">
                {shown.map((c) => {
                  const due = c.nextActionDue && stage !== "closed" && stage !== "declined" ? dueLabel(c.nextActionDue, now) : null;
                  return (
                    <li key={c.id}>
                      <Link
                        href={`/admin/cases/${c.id}`}
                        className="block rounded-lg border bg-card p-3 shadow-xs transition-colors hover:border-primary/40"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-xs text-muted-foreground">{c.caseNumber}</span>
                          <PaymentBadge status={c.paymentStatus} />
                        </div>
                        <p className="mt-1 truncate text-sm font-medium">{c.clientName}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {PRODUCT_LABELS[c.product]} · {formatUsd(c.priceUsd)}
                        </p>
                        {c.nextAction || due ? (
                          <div className="mt-2 flex items-center gap-1.5">
                            {due ? <DueBadge label={due.label} tone={due.tone} /> : null}
                            <span className="truncate text-xs text-muted-foreground">{c.nextAction}</span>
                          </div>
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
                {items.length === 0 ? <li className="px-1 py-4 text-center text-xs text-muted-foreground">Empty</li> : null}
                {shown.length < items.length ? (
                  <li className="px-1 text-center text-xs">
                    <Link href={`/admin/cases?stage=${stage}`} className="text-primary hover:underline">
                      +{items.length - shown.length} more
                    </Link>
                  </li>
                ) : null}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
