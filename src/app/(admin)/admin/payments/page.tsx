import Link from "next/link";
import { Suspense } from "react";

import { PaymentBadge } from "@/components/admin/badges";
import { EmptyState } from "@/components/admin/empty-state";
import { FilterBar } from "@/components/admin/filter-bar";
import { enumOptions, formatDate, formatUsd } from "@/components/admin/format";
import { FormDialog } from "@/components/admin/form-dialog";
import { PaymentForm } from "@/components/admin/forms/payment-form";
import { PageHeader } from "@/components/admin/page-header";
import { TableSkeleton } from "@/components/admin/skeletons";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requirePermission } from "@/lib/rbac";
import {
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUSES,
  PAYMENT_STATUS_LABELS,
  PRODUCT_LABELS,
  RETAINER_TIER_LABELS,
} from "@/lib/db/enums";
import { getCaseOptions, getRetainerOptions } from "@/lib/queries/options";
import { listPayments, readPaymentFilters } from "@/lib/queries/payments";

export const metadata = { title: "Payments" };

export default function PaymentsPage({ searchParams }: PageProps<"/admin/payments">) {
  return (
    <Suspense
      fallback={
        <>
          <PageHeader title="Payments" />
          <TableSkeleton />
        </>
      }
    >
      <Payments searchParams={searchParams} />
    </Suspense>
  );
}

async function Payments({ searchParams }: { searchParams: PageProps<"/admin/payments">["searchParams"] }) {
  await requirePermission("payments.view");
  const f = readPaymentFilters(await searchParams);
  const [rows, cases, retainers] = await Promise.all([listPayments(f), getCaseOptions(), getRetainerOptions()]);
  const paidTotal = rows.filter((r) => r.payment.status === "paid").reduce((s, r) => s + r.payment.amountUsd, 0);

  return (
    <>
      <PageHeader
        helpTopic="payments"
        title="Payments"
        description="Money received for cases and retainers. Recording a case payment also updates the case's payment status."
        actions={
          <FormDialog triggerLabel="Record payment" title="Record a payment" wide>
            <PaymentForm cases={cases} retainers={retainers} />
          </FormDialog>
        }
      />
      <FilterBar
        basePath="/admin/payments"
        values={f}
        search={false}
        filters={[
          { name: "status", label: "Statuses", options: enumOptions(PAYMENT_STATUSES, PAYMENT_STATUS_LABELS) },
          { name: "method", label: "Methods", options: enumOptions(PAYMENT_METHODS, PAYMENT_METHOD_LABELS) },
        ]}
      />
      {rows.length === 0 ? (
        <EmptyState title="No payments" description="Record a payment from a case page or with the button above." />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>For</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="hidden sm:table-cell">Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Reference</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.payment.id}>
                  <TableCell>{formatDate(r.payment.paidAt ?? r.payment.createdAt)}</TableCell>
                  <TableCell className="max-w-64">
                    {r.payment.caseId ? (
                      <>
                        <Link href={`/admin/cases/${r.payment.caseId}`} className="font-mono text-primary hover:underline">
                          {r.caseNumber}
                        </Link>
                        <span className="block truncate text-xs text-muted-foreground">
                          {r.caseClientName} · {r.caseProduct ? PRODUCT_LABELS[r.caseProduct] : ""}
                        </span>
                      </>
                    ) : r.payment.retainerId ? (
                      <>
                        <Link href="/admin/retainers" className="hover:text-primary hover:underline">
                          {r.retainerTier ? `${RETAINER_TIER_LABELS[r.retainerTier]} retainer` : "Retainer"}
                        </Link>
                        <span className="block truncate text-xs text-muted-foreground">{r.retainerClientName}</span>
                      </>
                    ) : (
                      <span className="text-muted-foreground">Unlinked</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums">{formatUsd(r.payment.amountUsd)}</TableCell>
                  <TableCell className="hidden sm:table-cell">{PAYMENT_METHOD_LABELS[r.payment.method]}</TableCell>
                  <TableCell>
                    <PaymentBadge status={r.payment.status} />
                  </TableCell>
                  <TableCell className="hidden font-mono text-xs md:table-cell">{r.payment.reference ?? "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={2}>Paid total (shown rows)</TableCell>
                <TableCell className="text-right font-mono tabular-nums">{formatUsd(paidTotal)}</TableCell>
                <TableCell colSpan={3} className="hidden sm:table-cell" />
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      )}
    </>
  );
}
