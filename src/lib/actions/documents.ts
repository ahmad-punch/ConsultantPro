"use server";

import { and, eq, ne } from "drizzle-orm";

import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { DOCUMENT_TYPE_LABELS, CASE_STAGE_LABELS, PRODUCT_LABELS, CASE_CATEGORY_LABELS } from "@/lib/db/enums";
import { cases, clients, documentTemplates, generatedDocuments } from "@/lib/db/schema";
import type { DocModel } from "@/lib/pdf/model";
import { getBranding, getTemplate, toTemplateData } from "@/lib/queries/documents";
import { caseLineDescription } from "@/lib/queries/invoices";
import { generateDocumentSchema, idOnlySchema, templateSchema } from "@/lib/validation/documents";
import type { FormState } from "@/lib/validation/fields";

import { done, failed, parseForm, revalidateAdmin, unexpected } from "./helpers";

async function clearOtherDefaults(type: (typeof documentTemplates.$inferSelect)["type"], keepId: string) {
  await db
    .update(documentTemplates)
    .set({ isDefault: false })
    .where(and(eq(documentTemplates.type, type), ne(documentTemplates.id, keepId)));
}

/** Create or update a template. Marking it default unsets the others of its type. */
export async function saveTemplateAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = parseForm(templateSchema, formData);
  if (!parsed.ok) return parsed.state;
  const { id, showBankDetails, showSignature, showTaxLine, showCaseReference, ...v } = parsed.data;
  const values = { ...v, options: { showBankDetails, showSignature, showTaxLine, showCaseReference } };
  try {
    let savedId = id;
    if (id) {
      await db.update(documentTemplates).set(values).where(eq(documentTemplates.id, id));
    } else {
      const [row] = await db.insert(documentTemplates).values(values).returning({ id: documentTemplates.id });
      savedId = row.id;
    }
    if (values.isDefault && savedId) await clearOtherDefaults(values.type, savedId);
    revalidateAdmin();
    return done(id ? "Template saved." : "Template created.", savedId ?? undefined);
  } catch (error) {
    return unexpected(error, "save the template");
  }
}

export async function duplicateTemplateAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = parseForm(idOnlySchema, formData);
  if (!parsed.ok) return parsed.state;
  try {
    const t = await getTemplate(parsed.data.id);
    if (!t) return failed("Template not found.");
    const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = t;
    void _id;
    void _c;
    void _u;
    const [row] = await db
      .insert(documentTemplates)
      .values({ ...rest, name: `${t.name} (copy)`, isDefault: false })
      .returning({ id: documentTemplates.id });
    revalidateAdmin();
    return done("Template duplicated.", row.id);
  } catch (error) {
    return unexpected(error, "duplicate the template");
  }
}

export async function setDefaultTemplateAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = parseForm(idOnlySchema, formData);
  if (!parsed.ok) return parsed.state;
  try {
    const t = await getTemplate(parsed.data.id);
    if (!t) return failed("Template not found.");
    await db.update(documentTemplates).set({ isDefault: true }).where(eq(documentTemplates.id, t.id));
    await clearOtherDefaults(t.type, t.id);
    revalidateAdmin();
    return done(`Default ${DOCUMENT_TYPE_LABELS[t.type].toLowerCase()} template set.`);
  } catch (error) {
    return unexpected(error, "set the default template");
  }
}

/**
 * Generate an engagement letter, case summary (or any template type) for a
 * case. The full render model is stored in `payload` so the PDF never changes.
 */
export async function generateDocumentAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = parseForm(generateDocumentSchema, formData);
  if (!parsed.ok) return parsed.state;
  const { caseId, templateId, note } = parsed.data;
  try {
    const [c] = await db
      .select({ case: cases, client: clients })
      .from(cases)
      .innerJoin(clients, eq(cases.clientId, clients.id))
      .where(eq(cases.id, caseId))
      .limit(1);
    if (!c) return failed("Case not found.");
    const t = await getTemplate(templateId);
    if (!t) return failed("Template not found.");
    const template = toTemplateData(t, t.type);
    if (t.type === "case_summary") {
      template.sections = [
        {
          heading: "Case",
          body: [
            `Product: ${PRODUCT_LABELS[c.case.product]}`,
            `Category: ${CASE_CATEGORY_LABELS[c.case.category]}`,
            `Stage: ${CASE_STAGE_LABELS[c.case.stage]}`,
            `Opened: ${c.case.createdAt.toISOString().slice(0, 10)}`,
          ].join("\n"),
        },
        { heading: "Summary", body: c.case.summary },
        ...template.sections,
      ];
    }
    const withFee = t.type !== "case_summary" && c.case.priceUsd > 0;
    const items = withFee
      ? [
          {
            description: caseLineDescription(c.case.product, c.case.caseNumber),
            quantity: 1,
            unitUsd: c.case.priceUsd,
            amountUsd: c.case.priceUsd,
          },
        ]
      : [];
    const count = await db.$count(generatedDocuments);
    const number = `DOC-${String(count + 1).padStart(4, "0")}`;
    const model: DocModel = {
      type: t.type,
      number,
      issueDate: new Date().toISOString(),
      caseNumber: c.case.caseNumber,
      branding: await getBranding(),
      template,
      billTo: {
        name: c.client.name,
        email: c.client.email,
        whatsapp: c.client.whatsapp,
        city: c.client.city,
        country: c.client.country,
      },
      items,
      subtotalUsd: c.case.priceUsd,
      taxUsd: 0,
      totalUsd: withFee ? c.case.priceUsd : 0,
      notes: note,
    };
    const [row] = await db
      .insert(generatedDocuments)
      .values({
        type: t.type,
        documentNumber: number,
        caseId,
        clientId: c.client.id,
        templateId,
        title: `${template.title || DOCUMENT_TYPE_LABELS[t.type]} · ${c.case.caseNumber}`,
        payload: model as unknown as Record<string, unknown>,
      })
      .returning({ id: generatedDocuments.id });
    revalidateAdmin();
    return done(`${DOCUMENT_TYPE_LABELS[t.type]} generated.`, row.id);
  } catch (error) {
    return unexpected(error, "generate the document");
  }
}
