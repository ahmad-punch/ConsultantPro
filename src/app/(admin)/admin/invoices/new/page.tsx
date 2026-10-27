import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import { InvoiceForm } from "@/components/admin/documents/invoice-form";
import { PageHeader } from "@/components/admin/page-header";
import { DetailSkeleton } from "@/components/admin/skeletons";
import { requirePermission } from "@/lib/rbac";
import { DOCUMENT_TYPE_LABELS } from "@/lib/db/enums";
import { listTemplates } from "@/lib/queries/documents";
import { getCaseBillingOptions } from "@/lib/queries/invoices";
import { getClientOptions } from "@/lib/queries/options";
import { uuidParam } from "@/lib/queries/params";

export const metadata = { title: "New invoice" };

export default function NewInvoicePage({ searchParams }: PageProps<"/admin/invoices/new">) {
  return (
    <>
      <PageHeader
        helpTopic="invoices"
        helpSection="new-invoice"
        eyebrow={
          <Link href="/admin/invoices" className="inline-flex items-center gap-1 hover:text-foreground">
            <ArrowLeftIcon className="size-3" /> Invoices
          </Link>
        }
        title="New invoice"
        description="Pick a case to prefill the client and the case fee. Totals are whole US dollars."
      />
      <Suspense fallback={<DetailSkeleton />}>
        <NewInvoice searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function NewInvoice({ searchParams }: { searchParams: PageProps<"/admin/invoices/new">["searchParams"] }) {
  await requirePermission("records.edit");
  const caseId = uuidParam(await searchParams, "caseId");
  const [clients, cases, templates] = await Promise.all([getClientOptions(), getCaseBillingOptions(), listTemplates()]);
  return (
    <div className="max-w-3xl rounded-xl border bg-card p-4 sm:p-6">
      <InvoiceForm
        clients={clients}
        cases={cases}
        initialCaseId={caseId}
        templates={templates.map((t) => ({
          value: t.id,
          label: `${t.name}${t.isDefault ? " (default)" : ""}`,
          type: t.type,
          isDefault: t.isDefault,
        }))}
      />
      <p className="mt-4 text-xs text-muted-foreground">
        Types available here: {DOCUMENT_TYPE_LABELS.invoice}, {DOCUMENT_TYPE_LABELS.receipt}, {DOCUMENT_TYPE_LABELS.quote}.
      </p>
    </div>
  );
}
