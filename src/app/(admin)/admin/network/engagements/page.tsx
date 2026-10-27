import Link from "next/link";
import { Suspense } from "react";

import { EmptyState } from "@/components/admin/empty-state";
import { FilterBar } from "@/components/admin/filter-bar";
import { enumOptions, formatDate } from "@/components/admin/format";
import { EngagementActions } from "@/components/admin/network/engagement-actions";
import { EngagementStatusBadge, TierBadge } from "@/components/admin/network/network-badges";
import { PageHeader } from "@/components/admin/page-header";
import { TableSkeleton } from "@/components/admin/skeletons";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requirePermission } from "@/lib/rbac";
import { ENGAGEMENT_STATUSES, ENGAGEMENT_STATUS_LABELS } from "@/lib/db/enums";
import { listEngagements, readEngagementFilters } from "@/lib/queries/engagements";

export const metadata = { title: "Network: engagements" };

export default function EngagementsPage({ searchParams }: PageProps<"/admin/network/engagements">) {
  return (
    <>
      <PageHeader
        helpTopic="network"
        helpSection="engagements"
        title="Engagements"
        description="Each piece of work given to a provider on a case. Create one from a case page with Engage provider."
      />
      <Suspense fallback={<TableSkeleton />}>
        <Engagements searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Engagements({ searchParams }: { searchParams: PageProps<"/admin/network/engagements">["searchParams"] }) {
  await requirePermission("network.view");
  const f = readEngagementFilters(await searchParams);
  const rows = await listEngagements(f);
  return (
    <>
      <FilterBar
        basePath="/admin/network/engagements"
        values={f}
        search={false}
        filters={[{ name: "status", label: "Statuses", options: enumOptions(ENGAGEMENT_STATUSES, ENGAGEMENT_STATUS_LABELS) }]}
      />
      {rows.length === 0 ? (
        <EmptyState title="No engagements" description="Open a case and use Engage provider." />
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Case</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead className="hidden md:table-cell">Office / city</TableHead>
                <TableHead className="text-right">Fee</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Due</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.e.id}>
                  <TableCell>
                    <Link href={`/admin/cases/${r.e.caseId}`} className="font-mono text-xs hover:underline">
                      {r.caseNumber}
                    </Link>
                    {r.e.batchKey ? <span className="block text-xs text-muted-foreground">batch {r.e.batchKey}</span> : null}
                  </TableCell>
                  <TableCell>
                    <Link href={`/admin/partners/${r.e.partnerId}`} className="hover:underline">
                      {r.partnerName}
                    </Link>
                    <span className="mt-0.5 block">
                      <TierBadge tier={r.partnerTier} />
                    </span>
                  </TableCell>
                  <TableCell className="hidden text-xs md:table-cell">
                    {r.e.department ?? "-"} / {r.e.locationCity ?? "-"}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    ${r.e.agreedFeeUsd}
                    <span className="block text-xs text-muted-foreground">{r.e.feeBilledBy === "partner" ? "billed by provider" : "paid by us"}</span>
                  </TableCell>
                  <TableCell>
                    <EngagementStatusBadge status={r.e.status} />
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{formatDate(r.e.dueAt)}</TableCell>
                  <TableCell>
                    <EngagementActions
                      e={r.e}
                      caseNumber={r.caseNumber}
                      caseSummary={r.caseSummary}
                      client={{ name: r.clientName, whatsapp: r.clientWhatsapp, email: r.clientEmail }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}
