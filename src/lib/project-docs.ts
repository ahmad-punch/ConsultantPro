/**
 * Project docs loader for `/admin/project`. Reads `docs/STATUS.md`,
 * `docs/CHANGELOG.md`, `docs/LEARNINGS.md` and `docs/decisions/*.md` at
 * request time (no memoising), so editing a file in the repo updates the page.
 * Server only: uses the file system. On Vercel the files ship through
 * `outputFileTracingIncludes` in `next.config.ts`.
 */
import "server-only";

import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";

const DOCS_DIR = path.join(process.cwd(), "docs");

export const PROJECT_DOC_PATHS = {
  status: "docs/STATUS.md",
  changelog: "docs/CHANGELOG.md",
  learnings: "docs/LEARNINGS.md",
  decisions: "docs/decisions/",
} as const;

function readDoc(rel: string): string | null {
  try {
    return fs.readFileSync(path.join(DOCS_DIR, rel), "utf8");
  } catch {
    return null;
  }
}

/** Strips frontmatter if a file has any; the docs here normally do not. */
function body(raw: string): string {
  return matter(raw).content.replace(/\r\n/g, "\n");
}

/**
 * Collects top-level "- " bullets. Indented or wrapped lines that follow a
 * bullet are joined onto it, so an item can span several lines in the file.
 */
function bullets(lines: string[]): string[] {
  const items: string[] = [];
  let open = false;
  for (const line of lines) {
    const m = /^[-*]\s+(.*)$/.exec(line);
    if (m) {
      items.push(m[1].trim());
      open = true;
    } else if (!line.trim() || /^#/.test(line)) {
      open = false;
    } else if (items.length && (open || /^\s+/.test(line))) {
      items[items.length - 1] += ` ${line.trim()}`;
      open = true;
    }
  }
  return items;
}

/** Splits markdown into blocks by a heading level ("## " or "### "). */
function splitByHeading(text: string, marker: "## " | "### "): { heading: string | null; lines: string[] }[] {
  const blocks: { heading: string | null; lines: string[] }[] = [{ heading: null, lines: [] }];
  for (const line of text.split("\n")) {
    if (line.startsWith(marker)) blocks.push({ heading: line.slice(marker.length).trim(), lines: [] });
    else blocks[blocks.length - 1].lines.push(line);
  }
  return blocks;
}

/* ------------------------------------------------------------------ Status */

export const STATUS_SECTIONS = ["Done", "In progress", "Next", "Open decisions", "Blocked"] as const;
export type StatusSection = (typeof STATUS_SECTIONS)[number];

export interface StatusDoc {
  updated: string | null;
  sections: Record<StatusSection, string[]>;
  /** Any other "## " sections, kept so nothing in the file is hidden. */
  extra: { title: string; items: string[] }[];
}

/** "Nothing in progress." style lines are placeholders, not items. */
export function isPlaceholderItem(item: string): boolean {
  return /^(nothing|none)\b/i.test(item);
}

export function getStatus(): StatusDoc | null {
  const raw = readDoc("STATUS.md");
  if (raw == null) return null;
  const text = body(raw);
  const updated = /^Updated:\s*([^.\n]+?)\.?(?:\s|$)/m.exec(text)?.[1]?.trim() ?? null;
  const sections = Object.fromEntries(STATUS_SECTIONS.map((s) => [s, [] as string[]])) as Record<
    StatusSection,
    string[]
  >;
  const extra: StatusDoc["extra"] = [];
  for (const block of splitByHeading(text, "## ")) {
    if (!block.heading) continue;
    const match = STATUS_SECTIONS.find((s) => s.toLowerCase() === block.heading!.toLowerCase());
    const items = bullets(block.lines);
    if (match) sections[match] = items;
    else extra.push({ title: block.heading, items });
  }
  return { updated, sections, extra };
}

/* --------------------------------------------------------------- Changelog */

export interface ChangelogGroup {
  /** "Added", "Changed", "Fixed", "Removed", "Docs", ... */
  title: string;
  items: string[];
}

export interface ChangelogRelease {
  /** "Unreleased" or a version such as "0.2.0". */
  version: string;
  date: string | null;
  unreleased: boolean;
  groups: ChangelogGroup[];
}

export function getChangelog(): ChangelogRelease[] | null {
  const raw = readDoc("CHANGELOG.md");
  if (raw == null) return null;
  const releases: ChangelogRelease[] = [];
  for (const block of splitByHeading(body(raw), "## ")) {
    if (!block.heading) continue;
    // "[Unreleased]", "[0.2.0] - 2026-11-01", "0.2.0 (2026-11-01)"
    const m = /^\[?([^\]\s(]+)\]?\s*(?:[-–(]\s*([\d-]{8,10})\)?)?/.exec(block.heading);
    const version = m?.[1] ?? block.heading;
    const groups = splitByHeading(block.lines.join("\n"), "### ")
      .map((g) => ({ title: g.heading ?? "Notes", items: bullets(g.lines) }))
      .filter((g) => g.items.length > 0);
    releases.push({
      version,
      date: m?.[2] ?? null,
      unreleased: version.toLowerCase() === "unreleased",
      groups,
    });
  }
  // Unreleased first, then the file's own (newest first) order.
  return releases.toSorted((a, b) => Number(b.unreleased) - Number(a.unreleased));
}

/* --------------------------------------------------------------- Learnings */

export interface Learning {
  date: string | null;
  title: string;
  /** Markdown text after the bold lead-in. */
  body: string;
}

export function getLearnings(): Learning[] | null {
  const raw = readDoc("LEARNINGS.md");
  if (raw == null) return null;
  return bullets(body(raw).split("\n")).map((item) => {
    // "**2026-10-21, title.** body"
    const m = /^\*\*(.+?)\*\*\s*(.*)$/.exec(item);
    if (!m) return { date: null, title: "", body: item };
    const lead = m[1].trim();
    const d = /^(\d{4}-\d{2}-\d{2}),?\s*(.*)$/.exec(lead);
    const title = (d ? d[2] : lead).replace(/[.:]\s*$/, "");
    return { date: d?.[1] ?? null, title, body: m[2].trim() };
  });
}

/* --------------------------------------------------------------- Decisions */

export type DecisionStatus = "proposed" | "accepted" | "superseded" | "rejected" | "deprecated" | "unknown";

export interface Decision {
  /** "0001" */
  number: string;
  slug: string;
  file: string;
  title: string;
  status: DecisionStatus;
  /** The full status line text, e.g. "superseded by 0004". */
  statusText: string;
  date: string | null;
  /** Markdown body after the title and status lines. */
  body: string;
}

function parseDecision(file: string, raw: string): Decision {
  const { data, content } = matter(raw);
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const titleIdx = lines.findIndex((l) => /^#\s+/.test(l));
  const heading = titleIdx >= 0 ? lines[titleIdx].replace(/^#\s+/, "").trim() : "";
  const fileNum = /^(\d+)/.exec(file)?.[1] ?? "";
  // "# 0001. Title" or "# 0001 Title"
  const hm = /^(\d+)[.:)]?\s+(.*)$/.exec(heading);
  const number = hm?.[1] ?? fileNum;
  const title =
    (typeof data.title === "string" && data.title) ||
    hm?.[2] ||
    heading ||
    file.replace(/^\d+-/, "").replace(/\.md$/, "").replace(/-/g, " ");

  const statusIdx = lines.findIndex((l) => /^\**status\**:/i.test(l.trim()));
  const statusLine =
    statusIdx >= 0
      ? lines[statusIdx].trim().replace(/^\**status\**:\s*/i, "").replace(/\.$/, "")
      : typeof data.status === "string"
        ? data.status
        : "";
  const word = /^(proposed|accepted|superseded|rejected|deprecated)/i.exec(statusLine)?.[1]?.toLowerCase();
  const date =
    /(\d{4}-\d{2}-\d{2})/.exec(statusLine)?.[1] ??
    (data.date instanceof Date ? data.date.toISOString().slice(0, 10) : typeof data.date === "string" ? data.date : null);
  const statusText = statusLine.replace(/,?\s*\d{4}-\d{2}-\d{2}\s*$/, "").trim();

  const bodyLines = lines.filter((_, i) => i !== titleIdx && i !== statusIdx);
  return {
    number,
    slug: file.replace(/\.md$/, ""),
    file,
    title,
    status: (word as DecisionStatus | undefined) ?? "unknown",
    statusText: statusText || "unknown",
    date,
    body: bodyLines.join("\n").trim(),
  };
}

export function getDecisions(): Decision[] | null {
  const dir = path.join(DOCS_DIR, "decisions");
  let files: string[];
  try {
    files = fs.readdirSync(dir).filter((f) => /^\d+.*\.md$/.test(f));
  } catch {
    return null;
  }
  return files
    .map((f) => parseDecision(f, fs.readFileSync(path.join(dir, f), "utf8")))
    .toSorted((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true }));
}
