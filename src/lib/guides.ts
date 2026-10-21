/**
 * Pathway guide loader. Reads `content/guides/*.mdx` with gray-matter.
 * Server only: uses the file system. Reads are synchronous and memoised per
 * process so they never count as uncached I/O during prerendering.
 */
import "server-only";

import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";

import { CASE_CATEGORIES, type CaseCategory } from "@/lib/db/enums";

const GUIDES_DIR = path.join(process.cwd(), "content", "guides");

export interface GuideFrontmatter {
  title: string;
  slug: string;
  category: CaseCategory;
  summary: string;
  summaryUrdu?: string;
  /** ISO date, e.g. "2026-10-21". */
  updated: string;
  readingMinutes: number;
}

export interface Guide extends GuideFrontmatter {
  /** Raw MDX body without frontmatter. */
  content: string;
}

export interface GuideHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

function asString(value: unknown, field: string, file: string): string {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  throw new Error(`Guide ${file}: frontmatter "${field}" is missing or not text.`);
}

function parseGuide(file: string): Guide {
  const raw = fs.readFileSync(path.join(GUIDES_DIR, file), "utf8");
  const { data, content } = matter(raw);
  const category = asString(data.category, "category", file);
  if (!(CASE_CATEGORIES as readonly string[]).includes(category)) {
    throw new Error(`Guide ${file}: unknown category "${category}".`);
  }
  const minutes = Number(data.readingMinutes);
  return {
    title: asString(data.title, "title", file),
    slug: typeof data.slug === "string" && data.slug ? data.slug : file.replace(/\.mdx?$/, ""),
    category: category as CaseCategory,
    summary: asString(data.summary, "summary", file),
    summaryUrdu: typeof data.summaryUrdu === "string" ? data.summaryUrdu.trim() : undefined,
    updated: asString(data.updated, "updated", file),
    readingMinutes: Number.isFinite(minutes) && minutes > 0 ? minutes : 5,
    content,
  };
}

let cache: Guide[] | null = null;

function loadAll(): Guide[] {
  if (cache && process.env.NODE_ENV === "production") return cache;
  const files = fs.existsSync(GUIDES_DIR)
    ? fs.readdirSync(GUIDES_DIR).filter((f) => /\.mdx?$/.test(f))
    : [];
  cache = files
    .map(parseGuide)
    .toSorted((a, b) => b.updated.localeCompare(a.updated) || a.title.localeCompare(b.title));
  return cache;
}

/** All guides, newest `updated` first, then by title. */
export function getAllGuides(): Guide[] {
  return loadAll();
}

/** One guide by slug, or undefined. */
export function getGuideBySlug(slug: string): Guide | undefined {
  return loadAll().find((g) => g.slug === slug);
}

/** Guides grouped by category, in the enum order, skipping empty categories. */
export function getGuidesByCategory(): { category: CaseCategory; guides: Guide[] }[] {
  const all = loadAll();
  return CASE_CATEGORIES.map((category) => ({
    category,
    guides: all.filter((g) => g.category === category),
  })).filter((group) => group.guides.length > 0);
}

/** Up to `limit` other guides: same category first, then the newest others. */
export function getRelatedGuides(guide: GuideFrontmatter, limit = 3): Guide[] {
  const others = loadAll().filter((g) => g.slug !== guide.slug);
  const same = others.filter((g) => g.category === guide.category);
  const rest = others.filter((g) => g.category !== guide.category);
  return [...same, ...rest].slice(0, limit);
}

/** URL-safe id for a heading. Shared by the table of contents and the MDX renderer. */
export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[`*_~[\]()]/g, "")
    .replace(/&[a-z]+;/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/** h2 and h3 headings from the MDX body, for the table of contents. */
export function getGuideHeadings(content: string): GuideHeading[] {
  const headings: GuideHeading[] = [];
  let inFence = false;
  for (const line of content.split("\n")) {
    if (line.trim().startsWith("```")) inFence = !inFence;
    if (inFence) continue;
    const match = /^(##|###)\s+(.+?)\s*#*\s*$/.exec(line);
    if (!match) continue;
    const text = match[2].replace(/[*_`]/g, "");
    headings.push({ id: slugifyHeading(text), text, level: match[1] === "##" ? 2 : 3 });
  }
  return headings;
}
