import { z } from "zod";

import { retainerTierSchema } from "./common";
import { idField, requiredDate } from "./fields";

export const retainerSchema = z.object({
  clientId: idField(),
  tier: retainerTierSchema,
  monthlyUsd: z.coerce.number().int().min(0).max(100_000),
  startedAt: requiredDate(),
});

export const retainerIdSchema = z.object({ id: idField() });
