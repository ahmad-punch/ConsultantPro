import { ArrowLeftIcon, BanIcon, CopyIcon, FileDownIcon, PrinterIcon, SendIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ActionButton } from "@/components/admin/action-form";
import { DocumentPreview } from "@/components/admin/documents/document-preview";
import { InvoiceStatusBadge } from "@/components/admin/documents/invoice-status-badge";
import { MarkPaidForm } from "@/components/admin/documents/small-forms";
import { FormDialog } from "@/components/admin/form-dialog";
import { formatDate, formatUsd } from "@/components/admin/format";
import { PageHeader } from "@/components/admin/page-header";
import { DetailSkeleton } from "@/components/admin/skeletons";
import { Button } from "@/components/ui/button";
import {
  duplicateInvoiceAction,
  markInvoiceSentAction,
  voidInvoiceAction,
} from "@/lib/actions/invoices";
import { requirePermission } from "@/lib/rbac";
import { DOCUMENT_TYPE_LABELS } from "@/lib/db/enums";
import { buildInvoiceModel, getInvoice } from "@/lib/queries/invoices";
import { isUuid } from "@/lib/queries/params";

export const metadata = { title: "Invoice" };

export default function InvoicePage({ params }: PageProps<"/admin/invoices/[id]">) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <InvoiceDetail params={params} />
    </Suspense>
  );
}

async function InvoiceDetail({ params }: { params: PageProps<"/admin/invoices/[id]">["params"] }) {
  await requirePermission("invoices.view");
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const d = await getInvoice(id);
  if (!d) notFound();
  const i = d.invoice;
  const model = await buildInvoiceModel(d);
  return (
    <>
      <PageHeader
        helpTopic="invoices"
        eyebrow={
          <Link href="/admin/invoices" className="inline-flex items-center gap-1 hover:text-foreground">
            <ArrowLeftIcon className="size-3" /> Invoices
          </Link>
        }
        title={
          <span className="flex flex-wrap items-center gap-3">
            <span className="font-mono">{i.invoiceNumber}</span>
            <InvoiceStatusBadge status={i.status} />
          </span>
        }
        description={
          <span>
            {DOCUMENT_TYPE_LABELS[i.type]} · {d.clientName ?? "No client"}
            {d.caseNumber ? (
              <>
                {" · "}
                <Link href={`/admin/cases/${i.caseId}`} className="font-mono hover:underline">
                  {d.caseNumber}
                </Link>
              </>
            ) : null}{" "}
            · {formatUsd(i.totalUsd)} · issued {formatDate(i.issueDate)}
            {i.paidAt ? ` · paid ${formatDate(i.paidAt)}` : ""}
          </span>
        }
        actions={
          <>
            {i.status === "draft" ? (
              <ActionButton action={markInvoiceSentAction} fields={{ id: i.id }} icon={<SendIcon />}>
                Mark sent
              </ActionButton>
            ) : null}
            {i.status === "draft" || i.status === "sent" ? (
              <FormDialog triggerLabel="Mark paid" triggerSize="sm" title={`Mark ${i.invoiceNumber} paid`} description={`Records a payment of ${formatUsd(i.totalUsd)}${i.caseId ? " and sets the case to paid" : ""}.`}>
                <MarkPaidForm id={i.id} invoiceNumber={i.invoiceNumber} />
              </FormDialog>
            ) : null}
            <Button variant="outline" size="sm" asChild>
              <a href={`/admin/invoices/${i.id}/pdf`} target="_blank" rel="noopener">
                <FileDownIcon /> Download PDF
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href={`/admin/invoices/${i.id}/print`} target="_blank" rel="noopener">
                <PrinterIcon /> Print view
              </a>
            </Button>
            <ActionButton action={duplicateInvoiceAction} fields={{ id: i.id }} icon={<CopyIcon />} redirectTo="/admin/invoices/{id}">
              Duplicate
            </ActionButton>
            {i.status !== "void" && i.status !== "paid" ? (
              <ActionButton
                action={voidInvoiceAction}
                fields={{ id: i.id }}
                icon={<BanIcon />}
                confirm={`Void ${i.invoiceNumber}? The number stays used.`}
              >
                Void
              </ActionButton>
            ) : null}
          </>
        }
      />
      <div className="overflow-x-auto">
        <DocumentPreview model={model} />
      </div>
    </>
  );
}
