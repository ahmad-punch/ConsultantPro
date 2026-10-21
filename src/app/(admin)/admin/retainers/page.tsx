import Link from "next/link";
import { Suspense } from "react";

import { ActionButton } from "@/components/admin/action-form";
import { RetainerStatusBadge } from "@/components/admin/badges";
import { EmptyState } from "@/components/admin/empty-state";
import { formatDate, formatUsd } from "@/components/admin/format";
import { FormDialog } from "@/components/admin/form-dialog";
import { RetainerForm } from "@/components/admin/forms/retainer-form";
import { PageHeader } from "@/components/admin/page-header";
import { TableSkeleton } from "@/components/admin/skeletons";
import { StatCard } from "@/components/admin/stat-card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cancelRetainerAction } from "@/lib/actions/retainers";
import { requireAdmin } from "@/lib/auth";
import { RETAINER_TIER_LABELS } from "@/lib/db/enums";
import { getClientOptions } from "@/lib/queries/options";
import { listRetainers } from "@/lib/queries/retainers";

export const metadata = { title: "Retainers" };

export default function RetainersPage() {
  return (
    <Suspense
      fallback={
        <>
          <PageHeader title="Retainers" />
          <TableSkeleton />
        </>
      }
    >
      <Retainers />
    </Suspense>
  );
}

async function Retainers() {
  await requireAdmin();
  const [rows, clients] = await Promise.all([listRetainers(), getClientOptions()]);
  const active = rows.filter((r) => r.retainer.status === "active");
  const mrr = active.reduce((s, r) => s + r.retainer.monthlyUsd, 0);
  return (
    <>
      <PageHeader
        title="Retainers"
        description="Family Affairs retainers: the only recurring revenue line. Record each monthly payment under Payments."
        actions={
          <FormDialog triggerLabel="Start retainer" title="Start a retainer">
            <RetainerForm clients={clients} />
          </FormDialog>
        }
      />
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Active retainers" value={active.length} tone="success" />
        <StatCard label="Monthly recurring" value={formatUsd(mrr)} />
        <StatCard label="Sign-ups (all time)" value={rows.length} hint="Gate: at least 3" />
        <StatCard label="Cancelled" value={rows.length - active.length} tone="neutral" />
      </div>
      {rows.length === 0 ? (
        <EmptyState title="No retainers yet" description="Offer a retainer to every Case Assessment client." />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead className="text-right">Monthly</TableHead>
                <TableHead className="hidden sm:table-cell">Started</TableHead>
                <TableHead className="hidden md:table-cell text-right">Paid to date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(({ retainer: r, clientName, paidUsd }) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <Link href={`/admin/clients/${r.clientId}`} className="font-medium hover:text-primary hover:underline">
                      {clientName}
                    </Link>
                  </TableCell>
                  <TableCell>{RETAINER_TIER_LABELS[r.tier]}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums">{formatUsd(r.monthlyUsd)}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {formatDate(r.startedAt)}
                    {r.cancelledAt ? <span className="block text-xs text-muted-foreground">Cancelled {formatDate(r.cancelledAt)}</span> : null}
                  </TableCell>
                  <TableCell className="hidden text-right font-mono tabular-nums md:table-cell">{formatUsd(paidUsd)}</TableCell>
                  <TableCell>
                    <RetainerStatusBadge status={r.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    {r.status === "active" ? (
                      <ActionButton action={cancelRetainerAction} fields={{ id: r.id }} variant="ghost" confirm={`Cancel ${clientName}'s retainer?`}>
                        Cancel
                      </ActionButton>
                    ) : null}
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
