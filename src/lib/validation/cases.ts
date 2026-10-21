import { z } from "zod";

import type { CaseStage, ProductType } from "@/lib/db/enums";

import {
  caseCategorySchema,
  caseStageSchema,
  productSchema,
  requiredText,
  usdSchema,
} from "./common";
import {
  idField,
  nullableBoolean,
  nullableDate,
  nullableEmail,
  nullableInt,
  nullableText,
  nullableUrl,
  nullableUuid,
  requiredDate,
} from "./fields";

/**
 * The normal path through the stages for each product. `declined` is a side
 * exit available from any stage. Used by "Advance stage" and the stepper.
 */
export function stagePath(product: ProductType): CaseStage[] {
  switch (product) {
    case "errand":
      return ["intake", "triage", "errand_in_progress", "closed"];
    case "managed":
      return ["intake", "triage", "memo_drafting", "memo_delivered", "managed", "closed"];
    default:
      return ["intake", "triage", "memo_drafting", "memo_delivered", "closed"];
  }
}

/** The stage after `stage` on the product's path, or null at the end. */
export function nextStage(product: ProductType, stage: CaseStage): CaseStage | null {
  const path = stagePath(product);
  const i = path.indexOf(stage);
  if (i === -1) return stage === "declined" ? null : path[path.length - 1] ?? null;
  return path[i + 1] ?? null;
}

export const OPEN_STAGES: CaseStage[] = [
  "intake",
  "triage",
  "memo_drafting",
  "memo_delivered",
  "managed",
  "errand_in_progress",
];

export const caseCreateSchema = z
  .object({
    clientId: nullableUuid(),
    newClientName: nullableText(200),
    newClientWhatsapp: nullableText(40),
    newClientEmail: nullableEmail(),
    newClientCountry: nullableText(100),
    newClientCity: nullableText(100),
    category: caseCategorySchema,
    product: productSchema,
    priceUsd: usdSchema,
    summary: requiredText("Summary", 5000),
    caseManagerId: nullableUuid(),
    partnerId: nullableUuid(),
    ambassadorId: nullableUuid(),
    referredByCaseId: nullableUuid(),
    nextAction: nullableText(500),
    nextActionDue: nullableDate(),
    paymentLink: nullableUrl(),
    leadId: nullableUuid(),
  })
  .superRefine((v, ctx) => {
    if (!v.clientId && !v.newClientName) {
      ctx.addIssue({
        code: "custom",
        path: ["newClientName"],
        message: "Pick an existing client or enter a new client's name.",
      });
    }
  });

export const caseUpdateSchema = z.object({
  id: idField(),
  category: caseCategorySchema,
  product: productSchema,
  priceUsd: usdSchema,
  summary: requiredText("Summary", 5000),
  nextAction: nullableText(500),
  nextActionDue: nullableDate(),
  partnerId: nullableUuid(),
  caseManagerId: nullableUuid(),
  ambassadorId: nullableUuid(),
  referredByCaseId: nullableUuid(),
  driveFolderUrl: nullableUrl(),
  memoDocUrl: nullableUrl(),
  paymentLink: nullableUrl(),
});

export const caseSetStageSchema = z.object({
  id: idField(),
  stage: caseStageSchema,
  note: nullableText(2000),
});

export const caseCloseSchema = z.object({
  id: idField(),
  nps: nullableInt(0, 10),
  wouldRecommend: nullableBoolean(),
  closedAt: requiredDate(),
  note: nullableText(2000),
});

export const caseNoteSchema = z.object({
  caseId: idField(),
  body: requiredText("Note", 5000),
});

export const caseIdSchema = z.object({ id: idField() });
