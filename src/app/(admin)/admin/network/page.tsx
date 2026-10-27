import Link from "next/link";
import { Suspense } from "react";

import { EmptyState } from "@/components/admin/empty-state";
import { FilterBar } from "@/components/admin/filter-bar";
import { enumOptions, formatDate } from "@/components/admin/format";
import { ApplicationStatusBadge } from "@/components/admin/network/network-badges";
import { PageHeader } from "@/components/admin/page-header";
import { TableSkeleton } from "@/components/admin/skeletons";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requirePermission } from "@/lib/rbac";
import { APPLICATION_STATUSES, APPLICATION_STATUS_LABELS, APPLICATION_TYPES, APPLICATION_TYPE_LABELS } from "@/lib/db/enums";
import { listApplications, readApplicationFilters } from "@/lib/queries/applications";

export const metadata = { title: "Network: applications" };

export default function ApplicationsPage({ searchParams }: PageProps<"/admin/network">) {
  return (
    <>
      <PageHeader
        helpTopic="network"
        title="Partner network"
        description="Applications from /partners/apply and /partners/ambassadors. Review, interview, then approve to create a provider or an ambassador."
      />
      <Suspense fallback={<TableSkeleton />}>
        <Applications searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Applications({ searchParams }: { searchParams: PageProps<"/admin/network">["searchParams"] }) {
  await requirePermission("network.view");
  const f = readApplicationFilters(await searchParams);
  const rows = await listApplications(f);
  return (
    <>
      <FilterBar
        basePath="/admin/network"
        values={f}
        search={false}
        filters={[
          { name: "status", label: "Statuses", options: enumOptions(APPLICATION_STATUSES, APPLICATION_STATUS_LABELS) },
          { name: "type", label: "Types", options: enumOptions(APPLICATION_TYPES, APPLICATION_TYPE_LABELS) },
        ]}
      />
      {rows.length === 0 ? (
        <EmptyState title="No applications" description="Share /partners/apply in the recruitment posts (marketing/partner-recruitment.md)." />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="hidden md:table-cell">City</TableHead>
                <TableHead className="hidden md:table-cell">Experience</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Received</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>
                    <Link href={`/admin/network/applications/${a.id}`} className="font-medium hover:text-primary hover:underline">
                      {a.name}
                    </Link>
                    <span className="block text-xs text-muted-foreground">{a.whatsapp}</span>
                  </TableCell>
                  <TableCell>{APPLICATION_TYPE_LABELS[a.type]}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {a.city ?? "-"}, {a.country}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{a.yearsExperience != null ? `${a.yearsExperience} yrs` : "-"}</TableCell>
                  <TableCell>
                    <ApplicationStatusBadge status={a.status} />
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{formatDate(a.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}
