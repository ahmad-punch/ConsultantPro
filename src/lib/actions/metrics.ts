"use server";

import { z } from "zod";

import { requireAdmin } from "@/lib/auth";
import { saveMetricsSnapshot } from "@/lib/queries/metrics";
import { nullableText, requiredDate, type FormState } from "@/lib/validation/fields";

import { done, failed, parseForm, revalidateAdmin, unexpected } from "./helpers";

const DAY_MS = 86_400_000;

const snapshotSchema = z.object({
  from: requiredDate(),
  to: requiredDate(),
  note: nullableText(1000),
});

/**
 * "Save snapshot": recompute the six gate metrics for the range on screen and
 * store them in metrics_snapshots. `to` is the last day shown (inclusive).
 */
export async function saveMetricsSnapshotAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = parseForm(snapshotSchema, formData);
  if (!parsed.ok) return parsed.state;
  const from = startOfDay(parsed.data.from);
  const to = new Date(startOfDay(parsed.data.to).getTime() + DAY_MS);
  if (to <= from) return failed("The range must end on or after its start.");
  try {
    const id = await saveMetricsSnapshot({ from, to }, parsed.data.note);
    revalidateAdmin();
    return done("Snapshot saved.", id);
  } catch (error) {
    return unexpected(error, "save the snapshot");
  }
}

function startOfDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}
