"use server";

import { eq } from "drizzle-orm";

import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  CASE_CATEGORY_LABELS,
  CASE_STAGE_LABELS,
  PRODUCT_LABELS,
  type CaseStage,
} from "@/lib/db/enums";
import { caseNotes, cases, clients, leads, type Case } from "@/lib/db/schema";
import {
  caseCloseSchema,
  caseCreateSchema,
  caseIdSchema,
  caseNoteSchema,
  caseSetStageSchema,
  caseUpdateSchema,
  nextStage,
  stagePath,
} from "@/lib/validation/cases";
import type { FormState } from "@/lib/validation/fields";

import {
  done,
  failed,
  getActorName,
  insertCaseWithNumber,
  parseForm,
  revalidateAdmin,
  unexpected,
} from "./helpers";

async function loadCase(id: string): Promise<Case | undefined> {
  return db.query.cases.findFirst({ where: (c, { eq }) => eq(c.id, id) });
}

async function addNote(caseId: string, body: string) {
  await db.insert(caseNotes).values({ caseId, authorName: await getActorName(), body });
}

/** Move a case to `stage`, keeping memo and close dates consistent, and log it. */
async function applyStage(row: Case, stage: CaseStage, extra?: string | null) {
  const now = new Date();
  const set: Partial<typeof cases.$inferInsert> = { stage };
  if (stage === "memo_delivered" && !row.memoDeliveredAt) set.memoDeliveredAt = now;
  if ((stage === "closed" || stage === "declined") && !row.closedAt) set.closedAt = now;
  if (stage !== "closed" && stage !== "declined" && row.closedAt) set.closedAt = null;
  await db.update(cases).set(set).where(eq(cases.id, row.id));
  await addNote(
    row.id,
    `Stage changed: ${CASE_STAGE_LABELS[row.stage]} -> ${CASE_STAGE_LABELS[stage]}.${extra ? ` ${extra}` : ""}`,
  );
}

export async function createCaseAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = parseForm(caseCreateSchema, formData);
  if (!parsed.ok) return parsed.state;
  const v = parsed.data;
  try {
    let clientId = v.clientId;
    if (!clientId) {
      const [client] = await db
        .insert(clients)
        .values({
          name: v.newClientName!,
          whatsapp: v.newClientWhatsapp,
          email: v.newClientEmail,
          country: v.newClientCountry,
          city: v.newClientCity,
          ambassadorId: v.ambassadorId,
        })
        .returning({ id: clients.id });
      clientId = client.id;
    }
    const id = await insertCaseWithNumber({
      clientId,
      category: v.category,
      product: v.product,
      priceUsd: v.priceUsd,
      summary: v.summary,
      caseManagerId: v.caseManagerId,
      partnerId: v.partnerId,
      ambassadorId: v.ambassadorId,
      referredByCaseId: v.referredByCaseId,
      nextAction: v.nextAction,
      nextActionDue: v.nextActionDue,
      paymentLink: v.paymentLink,
    });
    await addNote(id, `Case opened: ${PRODUCT_LABELS[v.product]}, ${CASE_CATEGORY_LABELS[v.category]}.`);
    if (v.leadId) {
      await db
        .update(leads)
        .set({ status: "converted", convertedCaseId: id })
        .where(eq(leads.id, v.leadId));
    }
    revalidateAdmin();
    return done("Case opened.", id);
  } catch (error) {
    return unexpected(error, "open the case");
  }
}

const TRACKED_FIELDS: { key: keyof Case; label: string }[] = [
  { key: "category", label: "category" },
  { key: "product", label: "product" },
  { key: "priceUsd", label: "price" },
  { key: "caseManagerId", label: "case manager" },
  { key: "partnerId", label: "partner" },
  { key: "nextAction", label: "next action" },
  { key: "nextActionDue", label: "next action date" },
  { key: "memoDocUrl", label: "memo link" },
  { key: "driveFolderUrl", label: "Drive folder" },
  { key: "paymentLink", label: "payment link" },
  { key: "ambassadorId", label: "ambassador" },
  { key: "referredByCaseId", label: "referring case" },
];

/** Equal for change-logging. Dates compare by UTC day (date inputs drop the time). */
const same = (a: unknown, b: unknown) =>
  a instanceof Date || b instanceof Date
    ? (a as Date | null)?.toISOString().slice(0, 10) === (b as Date | null)?.toISOString().slice(0, 10)
    : (a ?? null) === (b ?? null);

export async function updateCaseAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = parseForm(caseUpdateSchema, formData);
  if (!parsed.ok) return parsed.state;
  const { id, ...values } = parsed.data;
  if (values.referredByCaseId === id) return failed("A case cannot refer itself.");
  try {
    const row = await loadCase(id);
    if (!row) return failed("That case no longer exists.");
    await db.update(cases).set(values).where(eq(cases.id, id));
    const changed = TRACKED_FIELDS.filter((f) => !same(row[f.key], values[f.key as keyof typeof values]));
    if (changed.length) await addNote(id, `Updated ${changed.map((f) => f.label).join(", ")}.`);
    revalidateAdmin();
    return done("Case saved.", id);
  } catch (error) {
    return unexpected(error, "save the case");
  }
}

export async function advanceStageAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = parseForm(caseIdSchema, formData);
  if (!parsed.ok) return parsed.state;
  try {
    const row = await loadCase(parsed.data.id);
    if (!row) return failed("That case no longer exists.");
    const next = nextStage(row.product, row.stage);
    if (!next) return failed("This case is already at the end of its path.");
    await applyStage(row, next);
    revalidateAdmin();
    return done(`Moved to ${CASE_STAGE_LABELS[next]}.`, row.id);
  } catch (error) {
    return unexpected(error, "advance the stage");
  }
}

export async function setStageAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = parseForm(caseSetStageSchema, formData);
  if (!parsed.ok) return parsed.state;
  try {
    const row = await loadCase(parsed.data.id);
    if (!row) return failed("That case no longer exists.");
    if (row.stage === parsed.data.stage) return failed("The case is already at that stage.");
    await applyStage(row, parsed.data.stage, parsed.data.note);
    revalidateAdmin();
    return done(`Stage set to ${CASE_STAGE_LABELS[parsed.data.stage]}.`, row.id);
  } catch (error) {
    return unexpected(error, "set the stage");
  }
}

export async function markMemoDeliveredAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = parseForm(caseIdSchema, formData);
  if (!parsed.ok) return parsed.state;
  try {
    const row = await loadCase(parsed.data.id);
    if (!row) return failed("That case no longer exists.");
    if (row.memoDeliveredAt) return failed("The memo is already marked delivered.");
    const path = stagePath(row.product);
    const before = path.indexOf(row.stage) !== -1 && path.indexOf(row.stage) < path.indexOf("memo_delivered");
    if (before) {
      await applyStage(row, "memo_delivered", "Memo delivered to the client.");
    } else {
      await db.update(cases).set({ memoDeliveredAt: new Date() }).where(eq(cases.id, row.id));
      await addNote(row.id, "Memo delivered to the client.");
    }
    revalidateAdmin();
    return done("Memo marked delivered.", row.id);
  } catch (error) {
    return unexpected(error, "mark the memo delivered");
  }
}

export async function closeCaseAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = parseForm(caseCloseSchema, formData);
  if (!parsed.ok) return parsed.state;
  const v = parsed.data;
  try {
    const row = await loadCase(v.id);
    if (!row) return failed("That case no longer exists.");
    await db
      .update(cases)
      .set({ stage: "closed", closedAt: v.closedAt, nps: v.nps, wouldRecommend: v.wouldRecommend })
      .where(eq(cases.id, v.id));
    const feedback = [
      v.nps !== null ? `NPS ${v.nps}/10` : null,
      v.wouldRecommend === null ? null : v.wouldRecommend ? "would recommend" : "would not recommend",
    ]
      .filter(Boolean)
      .join(", ");
    await addNote(
      v.id,
      `${row.stage === "closed" ? "Close-out updated" : `Case closed (was ${CASE_STAGE_LABELS[row.stage]})`}.${
        feedback ? ` Feedback: ${feedback}.` : ""
      }${v.note ? ` ${v.note}` : ""}`,
    );
    revalidateAdmin();
    return done("Case closed.", v.id);
  } catch (error) {
    return unexpected(error, "close the case");
  }
}

export async function addCaseNoteAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = parseForm(caseNoteSchema, formData);
  if (!parsed.ok) return parsed.state;
  try {
    await addNote(parsed.data.caseId, parsed.data.body);
    revalidateAdmin();
    return done("Note added.", parsed.data.caseId);
  } catch (error) {
    return unexpected(error, "add the note");
  }
}
