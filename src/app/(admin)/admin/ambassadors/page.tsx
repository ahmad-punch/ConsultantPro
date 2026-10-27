import Link from "next/link";
import { Suspense } from "react";

import { ArchivedBadge, ShowArchivedToggle } from "@/components/admin/archive-controls";
import { ActiveBadge } from "@/components/admin/badges";
import { EmptyState } from "@/components/admin/empty-state";
import { formatUsd } from "@/components/admin/format";
import { FormDialog } from "@/components/admin/form-dialog";
import { AmbassadorForm } from "@/components/admin/forms/ambassador-form";
import { PageHeader } from "@/components/admin/page-header";
import { TableSkeleton } from "@/components/admin/skeletons";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requirePermission } from "@/lib/rbac";
import { listAmbassadors } from "@/lib/queries/ambassadors";
import { param } from "@/lib/queries/params";

export const metadata = { title: "Ambassadors" };

export default function AmbassadorsPage({ searchParams }: PageProps<"/admin/ambassadors">) {
  return (
    <>
      <PageHeader
        helpTopic="ambassadors"
        title="Ambassadors"
        description="Community members who refer clients for a commission on paid cases."
        actions={
          <FormDialog triggerLabel="New ambassador" title="New ambassador" wide>
            <AmbassadorForm />
          </FormDialog>
        }
      />
      <Suspense fallback={<TableSkeleton />}>
        <Ambassadors searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Ambassadors({ searchParams }: { searchParams: PageProps<"/admin/ambassadors">["searchParams"] }) {
  await requirePermission("ambassadors.view");
  const archived = param(await searchParams, "archived") === "1";
  const rows = await listAmbassadors(archived);
  const toggle = (
    <div className="mb-3">
      <ShowArchivedToggle basePath="/admin/ambassadors" params={{}} on={archived} />
    </div>
  );
  if (rows.length === 0) {
    return (
      <>
        {toggle}
        <EmptyState title="No ambassadors yet" description="Plan: 3-5 community ambassadors from week 5." />
      </>
    );
  }
  return (
    <>
    {toggle}
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Code</TableHead>
            <TableHead className="hidden md:table-cell">Location</TableHead>
            <TableHead className="text-right">Cases</TableHead>
            <TableHead className="hidden sm:table-cell text-right">Revenue</TableHead>
            <TableHead className="hidden lg:table-cell text-right">Paid out</TableHead>
            <TableHead className="text-right">Due</TableHead>
            <TableHead className="hidden sm:table-cell">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(({ ambassador: a, referredCases, revenueUsd, due }) => (
            <TableRow key={a.id}>
              <TableCell>
                <Link href={`/admin/ambassadors/${a.id}`} className="font-medium hover:text-primary hover:underline">
                  {a.name}
                </Link>
                <ArchivedBadge archivedAt={a.archivedAt} />
                <span className="block text-xs text-muted-foreground">{a.commissionPct}% commission</span>
              </TableCell>
              <TableCell className="font-mono text-xs">{a.referralCode}</TableCell>
              <TableCell className="hidden md:table-cell">{[a.city, a.country].filter(Boolean).join(", ")}</TableCell>
              <TableCell className="text-right font-mono tabular-nums">{referredCases}</TableCell>
              <TableCell className="hidden text-right font-mono tabular-nums sm:table-cell">{formatUsd(revenueUsd)}</TableCell>
              <TableCell className="hidden text-right font-mono tabular-nums lg:table-cell">{formatUsd(a.totalPaidUsd)}</TableCell>
              <TableCell className={`text-right font-mono tabular-nums ${due > 0 ? "font-semibold text-highlight" : ""}`}>{formatUsd(due)}</TableCell>
              <TableCell className="hidden sm:table-cell">
                <ActiveBadge active={a.active} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
    </>
  );
}
