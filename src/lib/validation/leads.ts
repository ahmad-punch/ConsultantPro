import { z } from "zod";

import {
  caseCategorySchema,
  leadStatusSchema,
  leadUrgencySchema,
  productSchema,
  requiredText,
  usdSchema,
  whatsappSchema,
} from "./common";
import { idField, nullableEmail, nullableText, nullableUuid } from "./fields";

/** Lead entered by hand in the control panel (WhatsApp, phone, event). */
export const leadSchema = z.object({
  name: requiredText("Name", 200),
  whatsapp: whatsappSchema,
  email: nullableEmail(),
  country: requiredText("Country", 100),
  category: caseCategorySchema,
  urgency: leadUrgencySchema,
  description: requiredText("Description", 5000),
  referralCode: nullableText(40),
  source: requiredText("Source", 60),
});

export const leadUpdateSchema = leadSchema.extend({
  id: idField(),
  status: leadStatusSchema,
});

export const leadConvertSchema = z.object({
  id: idField(),
  product: productSchema,
  priceUsd: usdSchema,
  caseManagerId: nullableUuid(),
  summary: nullableText(5000),
});

export type LeadInput = z.infer<typeof leadSchema>;
