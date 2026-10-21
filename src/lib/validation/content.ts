import { z } from "zod";

import {
  contentFormatSchema,
  contentLanguageSchema,
  contentStatusSchema,
  requiredText,
} from "./common";
import { idField, nullableDate, nullableText, nullableUrl } from "./fields";

export const contentSchema = z.object({
  title: requiredText("Title", 300),
  format: contentFormatSchema,
  language: contentLanguageSchema,
  targetPlatform: nullableText(100),
  status: contentStatusSchema,
  scheduledFor: nullableDate(),
  url: nullableUrl(),
  body: nullableText(20000),
  notes: nullableText(5000),
});

export const contentUpdateSchema = contentSchema.extend({ id: idField() });

export const contentStatusChangeSchema = z.object({
  id: idField(),
  status: contentStatusSchema,
});

export const contentPostedSchema = z.object({
  id: idField(),
  url: nullableUrl(),
  postedAt: nullableDate(),
});
