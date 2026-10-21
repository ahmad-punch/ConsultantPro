/**
 * Help centre loader. Reads `docs/help/**\/*.md` at request time (the markdown
 * in the repo is the source of truth; the panel only renders it).
 * Server only: uses the file system. Reads are synchronous; in production the
 * parsed docs are memoised per process, in development they are re-read on
 * every call so edits show up without a restart.
 */
import "server-only";

import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";

import { slugifyHeading } from "@/lib/guides";

export { slugifyHeading };

const HELP_DIR = path.join(process.cwd(), "docs", "help");

export const HELP_AUDIENCES = ["everyone", "staff", "agents"] as const;
export type HelpAudience = (typeof HELP_AUDIENCES)[number];

export type HelpGroupId = "guide" | "screens" | "agents";

export const HELP_GROUP_LABELS: Record<HelpGroupId, string> = {
  guide: "Start here",
  screens: "Screens",
  agents: "For agents",
};

const GROUP_ORDER: HelpGroupId[] = ["guide", "screens", "agents"];

export interface HelpDoc {
  title: string;
  /** Path-like slug, e.g. "screens/cases". Used in /admin/help/<slug>. */
  slug: string;
  summary: string;
  audience: HelpAudience;
  order: number;
  group: HelpGroupId;
  /** Repo path relative to docs/help, e.g. "screens/cases.md". */
  file: string;
  /** Markdown body without frontmatter and without a leading H1. */
  content: string;
}

export interface HelpHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

export interface HelpNavGroup {
  id: HelpGroupId;
  label: string;
  docs: HelpDoc[];
}

/** Repo path of a help file, for "Edit this file" lines and messages. */
export function helpRepoPath(file: string): string {
  return `docs/help/${file}`;
}

function listMarkdownFiles(dir: string, prefix = ""): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) out.push(...listMarkdownFiles(path.join(dir, entry.name), rel));
    else if (/\.md$/i.test(entry.name)) out.push(rel);
  }
  return out;
}

function text(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number") return String(value);
  return undefined;
}

function normaliseSlug(value: string): string {
  return value
    .trim()
    .replace(/^\/+|\/+$/g, "")
    .replace(/^admin\/help\//, "")
    .replace(/\.md$/i, "")
    .toLowerCase();
}

/** Strip a leading "# Title" line; the page renders the title itself. */
function stripLeadingH1(body: string): { body: string; h1?: string } {
  const match = /^\s*#\s+(.+?)\s*#*\s*(?:\n|$)/.exec(body);
  if (!match) return { body };
  return { body: body.slice(match[0].length), h1: match[1].replace(/[*_`]/g, "") };
}

function groupFor(slug: string, audience: HelpAudience, file: string): HelpGroupId {
  if (slug.startsWith("screens/")) return "screens";
  if (audience === "agents" || slug === "for-agents" || /^readme\.md$/i.test(file)) return "agents";
  return "guide";
}

function parseDoc(file: string): HelpDoc | null {
  let raw: string;
  try {
    raw = fs.readFileSync(path.join(HELP_DIR, file), "utf8");
  } catch {
    return null;
  }
  // An empty file (e.g. one being written right now) is not a page yet.
  if (!raw.trim()) return null;
  let data: Record<string, unknown> = {};
  let content = raw;
  try {
    const parsed = matter(raw);
    data = parsed.data;
    content = parsed.content;
  } catch {
    // Broken frontmatter must not take the help centre down; render the file as-is.
  }
  const { body, h1 } = stripLeadingH1(content);
  const fileSlug = normaliseSlug(file);
  const slug = text(data.slug) ? normaliseSlug(text(data.slug)!) : fileSlug;
  const audienceRaw = text(data.audience)?.toLowerCase();
  const audience: HelpAudience = (HELP_AUDIENCES as readonly string[]).includes(audienceRaw ?? "")
    ? (audienceRaw as HelpAudience)
    : "everyone";
  const order = Number(data.order);
  const base = path.basename(file, path.extname(file));
  return {
    title: text(data.title) ?? h1 ?? base.replace(/[-_]/g, " "),
    slug,
    summary: text(data.summary) ?? "",
    audience,
    order: Number.isFinite(order) ? order : 999,
    group: groupFor(slug, audience, file),
    file,
    content: body,
  };
}

let cache: HelpDoc[] | null = null;

function loadAll(): HelpDoc[] {
  if (cache && process.env.NODE_ENV === "production") return cache;
  const docs = listMarkdownFiles(HELP_DIR)
    .map(parseDoc)
    .filter((d): d is HelpDoc => d !== null);
  // First file wins if two files claim the same slug.
  const seen = new Set<string>();
  const unique = docs.filter((d) => (seen.has(d.slug) ? false : (seen.add(d.slug), true)));
  cache = unique.toSorted(
    (a, b) =>
      GROUP_ORDER.indexOf(a.group) - GROUP_ORDER.indexOf(b.group) ||
      a.order - b.order ||
      a.title.localeCompare(b.title),
  );
  return cache;
}

/** Every help doc, in navigation order (Start here, Screens, For agents). */
export function getAllHelpDocs(): HelpDoc[] {
  return loadAll();
}

/** One doc by slug ("screens/cases") or by file path ("screens/cases.md"). */
export function getHelpDoc(slug: string): HelpDoc | undefined {
  const s = normaliseSlug(slug);
  return loadAll().find((d) => d.slug === s || normaliseSlug(d.file) === s);
}

/** The doc for an admin screen, e.g. topic "cases" -> docs/help/screens/cases.md. */
export function getScreenDoc(topic: string): HelpDoc | undefined {
  return getHelpDoc(`screens/${topic}`);
}

/** Docs grouped for the left nav; empty groups are skipped. */
export function getHelpNav(): HelpNavGroup[] {
  const all = loadAll();
  return GROUP_ORDER.map((id) => ({
    id,
    label: HELP_GROUP_LABELS[id],
    docs: all.filter((d) => d.group === id),
  })).filter((g) => g.docs.length > 0);
}

/** Previous and next doc in navigation order. */
export function getHelpNeighbours(slug: string): { prev?: HelpDoc; next?: HelpDoc } {
  const all = loadAll();
  const i = all.findIndex((d) => d.slug === slug);
  if (i === -1) return {};
  return { prev: all[i - 1], next: all[i + 1] };
}

/** Resolve a relative markdown link ("../glossary.md#case") from one doc to a help URL. */
export function resolveHelpLink(fromFile: string, href: string): string | null {
  const [target, hash] = href.split("#");
  if (!/\.md$/i.test(target)) return null;
  const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(fromFile), target));
  const doc = loadAll().find((d) => d.file.toLowerCase() === resolved.toLowerCase());
  if (!doc) return null;
  return `/admin/help/${doc.slug}${hash ? `#${hash}` : ""}`;
}

interface HeadingLine {
  line: number;
  level: number;
  text: string;
  id: string;
}

function headingLines(content: string): { lines: string[]; headings: HeadingLine[] } {
  const lines = content.split("\n");
  const headings: HeadingLine[] = [];
  let inFence = false;
  lines.forEach((line, i) => {
    if (/^\s*(```|~~~)/.test(line)) inFence = !inFence;
    if (inFence) return;
    const match = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!match) return;
    const t = match[2].replace(/[*_`]/g, "");
    headings.push({ line: i, level: match[1].length, text: t, id: slugifyHeading(t) });
  });
  return { lines, headings };
}

/** H2 and H3 headings of a doc body, for the table of contents. */
export function getHelpHeadings(content: string): HelpHeading[] {
  return headingLines(content)
    .headings.filter((h) => h.level === 2 || h.level === 3)
    .map((h) => ({ id: h.id, text: h.text, level: h.level as 2 | 3 }));
}

export interface HelpSection {
  id: string;
  title: string;
  level: number;
  /** Markdown of the section body, without its heading line. */
  markdown: string;
}

const BUTTONS_SECTION = "buttons-and-actions";

/**
 * Extract one section of a doc by the kebab-case slug of its heading.
 * Looks first for an H3 under "Buttons and actions", then any H2, then any
 * other H3 (for example a metric under "What you see").
 */
export function extractHelpSection(content: string, sectionSlug: string): HelpSection | null {
  const want = slugifyHeading(sectionSlug.replace(/-/g, " "));
  const { lines, headings } = headingLines(content);
  const parentH2 = (h: HeadingLine) => headings.filter((x) => x.level === 2 && x.line < h.line).at(-1);
  const target =
    headings.find((h) => h.level === 3 && h.id === want && parentH2(h)?.id === BUTTONS_SECTION) ??
    headings.find((h) => h.level === 2 && h.id === want) ??
    headings.find((h) => h.level === 3 && h.id === want);
  if (!target) return null;
  const end = headings.find((h) => h.line > target.line && h.level <= target.level);
  const markdown = lines
    .slice(target.line + 1, end ? end.line : undefined)
    .join("\n")
    .trim();
  return { id: target.id, title: target.text, level: target.level, markdown };
}

export interface ScreenHelp {
  topic: string;
  /** Path the doc should live at, e.g. "docs/help/screens/cases.md". */
  expectedFile: string;
  doc?: HelpDoc;
  /** The requested section, if one was asked for and found. */
  section: HelpSection | null;
  /** True when a section was asked for but the doc has no matching heading. */
  sectionMissing: boolean;
  /** "How it connects to other screens", if the doc has it. */
  related: HelpSection | null;
  /** Fallback intro ("Why this screen exists") when the section is missing. */
  intro: HelpSection | null;
  /** Link to the full help page, anchored at the section. */
  href: string;
}

/**
 * Everything the contextual HelpButton needs for one screen and section.
 * `sectionSlug` may be a list of candidates; the first heading found wins
 * (e.g. a per-metric H3, falling back to the H2 that lists all metrics).
 */
export function getHelpSection(topic: string, sectionSlug?: string | string[]): ScreenHelp {
  const candidates = (Array.isArray(sectionSlug) ? sectionSlug : sectionSlug ? [sectionSlug] : []).filter(Boolean);
  const doc = getScreenDoc(topic);
  const expectedFile = helpRepoPath(`screens/${topic}.md`);
  const baseHref = `/admin/help/${doc?.slug ?? `screens/${topic}`}`;
  if (!doc) {
    return {
      topic,
      expectedFile,
      section: null,
      sectionMissing: false,
      related: null,
      intro: null,
      href: baseHref,
    };
  }
  let section: HelpSection | null = null;
  for (const slug of candidates) {
    section = extractHelpSection(doc.content, slug);
    if (section) break;
  }
  const related = extractHelpSection(doc.content, "how-it-connects-to-other-screens");
  return {
    topic,
    expectedFile: helpRepoPath(doc.file),
    doc,
    section,
    sectionMissing: candidates.length > 0 && !section,
    // With no section the whole doc is shown, which already contains "Related".
    related: candidates.length === 0 || section?.id === related?.id ? null : related,
    intro: candidates.length > 0 && !section ? extractHelpSection(doc.content, "why-this-screen-exists") : null,
    href: section ? `${baseHref}#${section.id}` : baseHref,
  };
}

export interface HelpSearchResult {
  doc: HelpDoc;
  snippet: string;
  score: number;
}

/** Markdown to plain text, good enough for search snippets. */
function plain(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/^\s*\|?[-:| ]+\|?\s*$/gm, " ")
    .replace(/[|*_`>]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function snippetAround(body: string, terms: string[], radius = 90): string {
  const lower = body.toLowerCase();
  const hits = terms.map((t) => lower.indexOf(t)).filter((i) => i >= 0);
  if (hits.length === 0) return body.slice(0, radius * 2) + (body.length > radius * 2 ? "…" : "");
  const at = Math.min(...hits);
  const start = Math.max(0, at - radius);
  const end = Math.min(body.length, at + radius);
  return `${start > 0 ? "…" : ""}${body.slice(start, end).trim()}${end < body.length ? "…" : ""}`;
}

/**
 * Case-insensitive search over title, summary and body. Every word of the
 * query must appear somewhere in the doc. Title hits rank above summary hits,
 * which rank above body hits.
 */
export function searchHelp(query: string, limit = 30): HelpSearchResult[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];
  const phrase = terms.join(" ");
  const results: HelpSearchResult[] = [];
  for (const doc of loadAll()) {
    const title = doc.title.toLowerCase();
    const summary = doc.summary.toLowerCase();
    const bodyText = plain(doc.content);
    const body = bodyText.toLowerCase();
    if (!terms.every((t) => title.includes(t) || summary.includes(t) || body.includes(t))) continue;
    let score = 0;
    for (const t of terms) {
      if (title.includes(t)) score += 10;
      if (summary.includes(t)) score += 4;
      score += Math.min(body.split(t).length - 1, 10);
    }
    if (title.includes(phrase)) score += 20;
    if (body.includes(phrase)) score += 5;
    const snippet = body.includes(phrase) || terms.some((t) => body.includes(t))
      ? snippetAround(bodyText, body.includes(phrase) ? [phrase] : terms)
      : doc.summary;
    results.push({ doc, snippet, score });
  }
  return results.toSorted((a, b) => b.score - a.score || a.doc.title.localeCompare(b.doc.title)).slice(0, limit);
}
