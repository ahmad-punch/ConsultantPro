import { requirePermission } from "@/lib/rbac";
import { pdfResponse, renderDocumentPdf } from "@/lib/pdf/document";
import { buildInvoiceModel, getInvoice } from "@/lib/queries/invoices";
import { isUuid } from "@/lib/queries/params";

export async function GET(_req: Request, { params }: RouteContext<"/admin/invoices/[id]/pdf">) {
  await requirePermission("invoices.view");
  const { id } = await params;
  if (!isUuid(id)) return new Response("Not found", { status: 404 });
  const d = await getInvoice(id);
  if (!d) return new Response("Not found", { status: 404 });
  const model = await buildInvoiceModel(d);
  return pdfResponse(await renderDocumentPdf(model), `${model.number}.pdf`);
}
