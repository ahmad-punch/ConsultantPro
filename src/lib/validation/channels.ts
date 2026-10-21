import { z } from "zod";

import { channelPlatformSchema, channelStatusSchema, requiredText } from "./common";
import { idField, nullableDate, nullableInt, nullableText, nullableUuid } from "./fields";

export const channelSchema = z.object({
  name: requiredText("Name", 200),
  platform: channelPlatformSchema,
  country: nullableText(100),
  memberCount: nullableInt(0, 10_000_000),
  adminContact: nullableText(200),
  status: channelStatusSchema,
  lastPostedAt: nullableDate(),
  cadenceDays: nullableInt(1, 365),
  ambassadorId: nullableUuid(),
  notes: nullableText(5000),
});

export const channelUpdateSchema = channelSchema.extend({ id: idField() });
