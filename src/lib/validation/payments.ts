import { z } from "zod";

import { paymentMethodSchema, paymentStatusSchema } from "./common";
import { nullableDate, nullableText, nullableUuid } from "./fields";

export const paymentSchema = z
  .object({
    caseId: nullableUuid(),
    retainerId: nullableUuid(),
    amountUsd: z.coerce.number().int().min(0).max(1_000_000),
    method: paymentMethodSchema,
    status: paymentStatusSchema,
    reference: nullableText(200),
    paidAt: nullableDate(),
  })
  .superRefine((v, ctx) => {
    if (!v.caseId && !v.retainerId) {
      ctx.addIssue({
        code: "custom",
        path: ["caseId"],
        message: "Link the payment to a case or a retainer.",
      });
    }
  });
