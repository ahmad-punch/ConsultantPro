import Link from "next/link";
import { Suspense } from "react";

import { ArchivedBadge, ShowArchivedToggle } from "@/components/admin/archive-controls";
import { LeadStatusBadge, UrgencyBadge } from "@/components/admin/badges";
import { ImportLeadsDialog } from "@/components/admin/import/import-dialogs";
import { EmptyState } from "@/components/admin/empty-state";
import { FilterBar } from "@/components/admin/filter-bar";
import { ageLabel, enumOptions, formatDate } from "@/components/admin/format";
import { PageHeader } from "@/components/admin/page-header";
import { TableSkeleton } from "@/components/admin/skeletons";
import { SortLink } from "@/components/admin/sort-link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requireAdmin } from "@/lib/auth";
import {
  CASE_CATEGORIES,
  CASE_CATEGORY_LABELS,
  LEAD_STATUSES,
  LEAD_STATUS_LABELS,
} from "@/lib/db/enums";
import { listLeads, listLeadSources, readLeadFilters } from "@/lib/queries/leads";

export const metadata = { title: "Leads" };

export default function LeadsPage({ searchParams }: PageProps<"/admin/leads">) {
  return (
    <>
      <PageHeader
        helpTopic="leads"
        title="Leads"
        description="Everyone who asked for help. Contact new leads within a working day, then convert or close them."
        actions={
          <>
            <ImportLeadsDialog />
            <Button asChild>
              <Link href="/admin/leads/new">New lead</Link>
            </Button>
          </>
        }
      />
      <Suspense fallback={<TableSkeleton />}>
        <LeadsTable searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function LeadsTable({ searchParams }: { searchParams: PageProps<"/admin/leads">["searchParams"] }) {
  await requireAdmin();
  const sp = await searchParams;
  const f = readLeadFilters(sp);
  const [rows, sources] = await Promise.all([listLeads(f), listLeadSources()]);
  const now = new Date();
  const params = {
    q: f.q,
    status: f.status,
    category: f.category,
    source: f.source,
    sort: f.sort,
    dir: f.dir,
    archived: f.archived ? "1" : undefined,
  };
  const base = "/admin/leads";
  return (
    <>
      <div className="mb-3">
        <ShowArchivedToggle basePath={base} params={params} on={f.archived} />
      </div>
      <FilterBar
        basePath={base}
        values={params}
        searchPlaceholder="Name, phone, country, text"
        filters={[
          { name: "status", label: "Statuses", options: enumOptions(LEAD_STATUSES, LEAD_STATUS_LABELS) },
          { name: "category", label: "Categories", options: enumOptions(CASE_CATEGORIES, CASE_CATEGORY_LABELS) },
          { name: "source", label: "Sources", options: sources.map((s) => ({ value: s, label: s })) },
        ]}
      />
      {rows.length === 0 ? (
        <EmptyState
          title={f.q || f.status || f.category || f.source ? "No leads match these filters" : "No leads yet"}
          description="Leads arrive from the intake form on the site, or add one by hand from a WhatsApp message."
          action={
            <Button asChild size="sm">
              <Link href="/admin/leads/new">New lead</Link>
            </Button>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <SortLink label="Name" sortKey="name" basePath={base} params={params} current={f.sort} dir={f.dir} />
                </TableHead>
                <TableHead className="hidden md:table-cell">Category</TableHead>
                <TableHead>
                  <SortLink label="Urgency" sortKey="urgency" basePath={base} params={params} current={f.sort} dir={f.dir} />
                </TableHead>
                <TableHead className="hidden lg:table-cell">Source</TableHead>
                <TableHead>
                  <SortLink label="Status" sortKey="status" basePath={base} params={params} current={f.sort} dir={f.dir} />
                </TableHead>
                <TableHead className="hidden sm:table-cell">
                  <SortLink label="Received" sortKey="created" basePath={base} params={params} current={f.sort} dir={f.dir} />
                </TableHead>
                <TableHead className="hidden md:table-cell">Case</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="max-w-64">
                    <Link href={`/admin/leads/${l.id}`} className="font-medium hover:text-primary hover:underline">
                      {l.name}
                    </Link>
                    <ArchivedBadge archivedAt={l.archivedAt} />
                    <p className="truncate text-xs text-muted-foreground">
                      {l.country} · {l.description}
                    </p>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{CASE_CATEGORY_LABELS[l.category]}</TableCell>
                  <TableCell>
                    <UrgencyBadge urgency={l.urgency} />
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {l.source}
                    {l.referralCode ? <span className="ml-1 font-mono text-xs text-muted-foreground">{l.referralCode}</span> : null}
                  </TableCell>
                  <TableCell>
                    <LeadStatusBadge status={l.status} />
                  </TableCell>
                  <TableCell className="hidden sm:table-cell" title={formatDate(l.createdAt)}>
                    {ageLabel(l.createdAt, now)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {l.caseId ? (
                      <Link href={`/admin/cases/${l.caseId}`} className="font-mono text-xs text-primary hover:underline">
                        {l.caseNumber}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <p className="mt-3 text-xs text-muted-foreground">{rows.length} leads</p>
    </>
  );
}
