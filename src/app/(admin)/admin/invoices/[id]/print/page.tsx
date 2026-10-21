import { notFound } from "next/navigation";
import { Suspense } from "react";

import { DocumentPreview } from "@/components/admin/documents/document-preview";
import { PrintButton } from "@/components/admin/documents/print-button";
import { requireAdmin } from "@/lib/auth";
import { buildInvoiceModel, getInvoice } from "@/lib/queries/invoices";
import { isUuid } from "@/lib/queries/params";

export const metadata = { title: "Print invoice" };

/** Fallback when PDF rendering is unavailable: print this page and save as PDF. */
export default function PrintInvoicePage({ params }: PageProps<"/admin/invoices/[id]/print">) {
  return (
    <Suspense fallback={null}>
      <PrintInvoice params={params} />
    </Suspense>
  );
}

async function PrintInvoice({ params }: { params: PageProps<"/admin/invoices/[id]/print">["params"] }) {
  await requireAdmin();
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const d = await getInvoice(id);
  if (!d) notFound();
  const model = await buildInvoiceModel(d);
  return (
    <div className="space-y-4">
      <style>{`@media print { @page { size: A4; margin: 16mm; } body * { visibility: hidden; } .doc-preview, .doc-preview * { visibility: visible; } .doc-preview { position: absolute; inset: 0; } }`}</style>
      <div className="flex justify-end print:hidden">
        <PrintButton />
      </div>
      <DocumentPreview model={model} />
    </div>
  );
}
