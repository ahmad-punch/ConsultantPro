import { requireAdmin } from "@/lib/auth";
import { pdfResponse, renderDocumentPdf } from "@/lib/pdf/document";
import type { DocModel } from "@/lib/pdf/model";
import { getGeneratedDocument } from "@/lib/queries/documents";
import { isUuid } from "@/lib/queries/params";

export async function GET(_req: Request, { params }: RouteContext<"/admin/documents/[id]/pdf">) {
  await requireAdmin();
  const { id } = await params;
  if (!isUuid(id)) return new Response("Not found", { status: 404 });
  const doc = await getGeneratedDocument(id);
  if (!doc) return new Response("Not found", { status: 404 });
  const model = doc.payload as unknown as DocModel;
  return pdfResponse(await renderDocumentPdf(model), `${doc.documentNumber}.pdf`);
}
