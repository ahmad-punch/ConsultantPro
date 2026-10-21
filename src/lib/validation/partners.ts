import { z } from "zod";

import { partnerTypeSchema, requiredText } from "./common";
import { checkbox, idField, nullableEmail, nullableInt, nullableText } from "./fields";

export const partnerSchema = z.object({
  name: requiredText("Name", 200),
  type: partnerTypeSchema,
  city: nullableText(100),
  whatsapp: nullableText(40),
  email: nullableEmail(),
  ownLetterhead: checkbox(),
  feeTerms: nullableText(2000),
  slaDays: nullableInt(0, 365),
  rating: nullableInt(1, 5),
  active: checkbox(),
});

export const partnerUpdateSchema = partnerSchema.extend({ id: idField() });
