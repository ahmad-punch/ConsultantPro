/** Turn pasted CSV into validated rows for a preview table. Client and server safe. */
import { z } from "zod";

import type { ImportPreview } from "@/lib/validation/imports";

import { csvToRecords } from "./csv-parse";

export const MAX_IMPORT_ROWS = 500;

export function validateCsv<S extends z.ZodType>(
  text: string,
  columns: readonly string[],
  required: readonly string[],
  schema: S,
  dedupeKey: (row: z.output<S>) => string,
  existing: Set<string>,
): ImportPreview & { parsed: (z.output<S> | null)[] } {
  const { headers, records } = csvToRecords(text);
  const empty = { missingColumns: [], rows: [], validCount: 0, parsed: [] };
  if (!headers.length) return { ok: false, error: "Paste a CSV with a header row.", ...empty };
  const missingColumns = required.filter((c) => !headers.includes(c));
  if (missingColumns.length) {
    return {
      ok: false,
      error: `Missing column${missingColumns.length > 1 ? "s" : ""}: ${missingColumns.join(", ")}. Expected: ${columns.join(",")}`,
      ...empty,
      missingColumns,
    };
  }
  if (records.length > MAX_IMPORT_ROWS) {
    return { ok: false, error: `Import at most ${MAX_IMPORT_ROWS} rows at a time.`, ...empty };
  }
  const seen = new Set(existing);
  const parsed: (z.output<S> | null)[] = [];
  const rows = records.map((rec, i) => {
    const values = Object.fromEntries(columns.map((c) => [c, rec[c] ?? ""]));
    const result = schema.safeParse(values);
    if (!result.success) {
      parsed.push(null);
      const errors = result.error.issues.map((iss) => `${iss.path.join(".") || "row"}: ${iss.message}`);
      return { line: i + 2, values, errors, duplicate: false };
    }
    const key = dedupeKey(result.data);
    const duplicate = seen.has(key);
    seen.add(key);
    parsed.push(duplicate ? null : result.data);
    return { line: i + 2, values, errors: [], duplicate };
  });
  const validCount = parsed.filter(Boolean).length;
  return { ok: true, missingColumns: [], rows, validCount, parsed };
}

/** Drop the parsed values before sending a preview to the browser. */
export function toPreview(r: ImportPreview): ImportPreview {
  return { ok: r.ok, error: r.error, missingColumns: r.missingColumns, rows: r.rows, validCount: r.validCount };
}
