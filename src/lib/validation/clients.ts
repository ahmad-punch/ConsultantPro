import { z } from "zod";

import { requiredText } from "./common";
import { idField, nullableEmail, nullableText, nullableUuid } from "./fields";

export const clientSchema = z.object({
  name: requiredText("Name", 200),
  whatsapp: nullableText(40),
  email: nullableEmail(),
  country: nullableText(100),
  city: nullableText(100),
  ambassadorId: nullableUuid(),
  notes: nullableText(5000),
});

export const clientUpdateSchema = clientSchema.extend({ id: idField() });
