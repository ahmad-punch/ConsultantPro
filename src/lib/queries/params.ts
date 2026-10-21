/** Helpers for reading list filters from `searchParams`. */
export type SearchParams = Record<string, string | string[] | undefined>;

export function param(sp: SearchParams, key: string): string | undefined {
  const v = sp[key];
  const s = Array.isArray(v) ? v[0] : v;
  return s && s.trim() !== "" ? s.trim() : undefined;
}

/** The param when it is one of `allowed`, otherwise undefined. */
export function enumParam<T extends string>(
  sp: SearchParams,
  key: string,
  allowed: readonly T[],
): T | undefined {
  const v = param(sp, key);
  return v && (allowed as readonly string[]).includes(v) ? (v as T) : undefined;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(v: string | undefined): v is string {
  return !!v && UUID_RE.test(v);
}

export function uuidParam(sp: SearchParams, key: string): string | undefined {
  const v = param(sp, key);
  return isUuid(v) ? v : undefined;
}

export function sortDir(sp: SearchParams): "asc" | "desc" {
  return param(sp, "dir") === "asc" ? "asc" : "desc";
}

/** Escape % and _ for ILIKE. */
export function likePattern(q: string): string {
  return `%${q.replace(/[\\%_]/g, (m) => `\\${m}`)}%`;
}
