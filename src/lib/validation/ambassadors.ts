import { z } from "zod";

import { requiredText } from "./common";
import { checkbox, idField, nullableText } from "./fields";

export const ambassadorSchema = z.object({
  name: requiredText("Name", 200),
  country: requiredText("Country", 100),
  city: nullableText(100),
  whatsapp: nullableText(40),
  referralCode: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9-]{3,20}$/, "3-20 letters, digits or dashes, e.g. UK-BHAM1."),
  commissionPct: z.coerce.number().int().min(0).max(100),
  active: checkbox(),
  notes: nullableText(5000),
});

export const ambassadorUpdateSchema = ambassadorSchema.extend({ id: idField() });

export const ambassadorPayoutSchema = z.object({
  id: idField(),
  amountUsd: z.coerce.number().int().min(1, "Enter an amount of at least $1.").max(1_000_000),
});
