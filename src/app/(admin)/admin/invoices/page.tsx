import { DownloadIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import { InvoiceStatusBadge } from "@/components/admin/documents/invoice-status-badge";
import { EmptyState } from "@/components/admin/empty-state";
import { FilterBar } from "@/components/admin/filter-bar";
import { enumOptions, formatDate, formatUsd } from "@/components/admin/format";
import { PageHeader } from "@/components/admin/page-header";
import { TableSkeleton } from "@/components/admin/skeletons";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requirePermission } from "@/lib/rbac";
import { DOCUMENT_TYPE_LABELS, INVOICE_STATUSES, INVOICE_STATUS_LABELS } from "@/lib/db/enums";
import { listInvoices, readInvoiceFilters } from "@/lib/queries/invoices";
import { INVOICE_DOC_TYPES } from "@/lib/validation/invoices";

export const metadata = { title: "Invoices" };

export default function InvoicesPage({ searchParams }: PageProps<"/admin/invoices">) {
  return (
    <Suspense
      fallback={
        <>
          <PageHeader title="Invoices" />
          <TableSkeleton />
        </>
      }
    >
      <Invoices searchParams={searchParams} />
    </Suspense>
  );
}

async function Invoices({ searchParams }: { searchParams: PageProps<"/admin/invoices">["searchParams"] }) {
  await requirePermission("invoices.view");
  const f = readInvoiceFilters(await searchParams);
  const rows = await listInvoices(f);
  const live = rows.filter((r) => r.invoice.status !== "void" && r.invoice.type !== "quote");
  const billed = live.reduce((s, r) => s + r.invoice.totalUsd, 0);
  const paid = live.filter((r) => r.invoice.status === "paid").reduce((s, r) => s + r.invoice.totalUsd, 0);

  return (
    <>
      <PageHeader
        helpTopic="invoices"
        title="Invoices"
        description="Invoices, receipts and quotes. Marking an invoice paid records the payment and updates the case."
        actions={
          <>
            <Button variant="outline" asChild>
              {/* A route handler download, not a page: plain <a> on purpose. */}
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a href="/admin/export/invoices">
                <DownloadIcon /> Export CSV
              </a>
            </Button>
            <Button asChild>
              <Link href="/admin/invoices/new">
                <PlusIcon /> New invoice
              </Link>
            </Button>
          </>
        }
      />
      <FilterBar
        basePath="/admin/invoices"
        values={f}
        search={false}
        filters={[
          { name: "status", label: "Statuses", options: enumOptions(INVOICE_STATUSES, INVOICE_STATUS_LABELS) },
          { name: "type", label: "Types", options: enumOptions(INVOICE_DOC_TYPES, DOCUMENT_TYPE_LABELS) },
        ]}
      />
      {rows.length === 0 ? (
        <EmptyState title="No invoices" description="Create one with New invoice, or from a case page." />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Number</TableHead>
                <TableHead>Client</TableHead>
                <TableHead className="hidden sm:table-cell">Issued</TableHead>
                <TableHead className="hidden md:table-cell">Due</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.invoice.id}>
                  <TableCell>
                    <Link href={`/admin/invoices/${r.invoice.id}`} className="font-mono text-primary hover:underline">
                      {r.invoice.invoiceNumber}
                    </Link>
                    <span className="block text-xs text-muted-foreground">{DOCUMENT_TYPE_LABELS[r.invoice.type]}</span>
                  </TableCell>
                  <TableCell className="max-w-56">
                    <span className="block truncate">{r.clientName ?? "-"}</span>
                    {r.caseNumber ? (
                      <Link href={`/admin/cases/${r.invoice.caseId}`} className="font-mono text-xs text-muted-foreground hover:underline">
                        {r.caseNumber}
                      </Link>
                    ) : null}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{formatDate(r.invoice.issueDate)}</TableCell>
                  <TableCell className="hidden md:table-cell">{formatDate(r.invoice.dueDate)}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums">{formatUsd(r.invoice.totalUsd)}</TableCell>
                  <TableCell>
                    <InvoiceStatusBadge status={r.invoice.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={2}>Billed (shown, excluding quotes and void) · paid</TableCell>
                <TableCell colSpan={2} className="hidden sm:table-cell" />
                <TableCell className="text-right font-mono tabular-nums">
                  {formatUsd(billed)}
                  <span className="block text-xs text-muted-foreground">{formatUsd(paid)} paid</span>
                </TableCell>
                <TableCell />
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      )}
    </>
  );
}
