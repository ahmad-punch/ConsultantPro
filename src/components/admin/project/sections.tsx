import { FileTextIcon } from "lucide-react";
import Link from "next/link";

import { ToneBadge, type Tone } from "@/components/admin/badges";
import { EmptyState } from "@/components/admin/empty-state";
import { formatDate } from "@/components/admin/format";
import { StatCard } from "@/components/admin/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  isPlaceholderItem,
  STATUS_SECTIONS,
  type ChangelogRelease,
  type Decision,
  type DecisionStatus,
  type Learning,
  type StatusDoc,
  type StatusSection,
} from "@/lib/project-docs";
import { cn } from "@/lib/utils";

import { InlineMarkdown, Markdown } from "./markdown";

/** One line under each tab saying where the content comes from. */
export function SourceNote({ path, children }: { path: string; children?: React.ReactNode }) {
  return (
    <p className="mb-4 flex items-start gap-1.5 text-xs text-muted-foreground">
      <FileTextIcon className="mt-px size-3.5 shrink-0" aria-hidden />
      <span>
        Rendered from <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.95em]">{path}</code> in the
        repo. Edit that file to update this tab.{children ? <> {children}</> : null}
      </span>
    </p>
  );
}

export function MissingDoc({ path }: { path: string }) {
  return (
    <EmptyState
      title={`${path} was not found`}
      description="The file is read from the repo when the page loads. Restore it, or check that next.config.ts ships docs/** with the build."
    />
  );
}

/** ISO dates render like the rest of the panel; anything else as written. */
export function docDate(value: string | null): string | null {
  if (!value) return null;
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? formatDate(`${value}T12:00:00Z`) : value;
}

/* ------------------------------------------------------------------ Status */

const SECTION_TONE: Record<StatusSection, Tone> = {
  Done: "success",
  "In progress": "info",
  Next: "primary",
  "Open decisions": "warning",
  Blocked: "danger",
};

export function realItems(items: string[]) {
  return items.filter((i) => !isPlaceholderItem(i));
}

export function StatusTab({ status }: { status: StatusDoc }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {STATUS_SECTIONS.map((s) => (
          <StatCard
            key={s}
            label={s}
            value={realItems(status.sections[s]).length}
            tone={SECTION_TONE[s]}
            href={s === "Open decisions" ? "/admin/project?tab=open-decisions" : undefined}
          />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {STATUS_SECTIONS.map((s) => (
          <StatusList key={s} title={s} items={status.sections[s]} tone={SECTION_TONE[s]} />
        ))}
        {status.extra.map((x) => (
          <StatusList key={x.title} title={x.title} items={x.items} tone="neutral" />
        ))}
      </div>
    </div>
  );
}

function StatusList({ title, items, tone }: { title: string; items: string[]; tone: Tone }) {
  const real = realItems(items);
  return (
    <Card size="sm" className={cn(title === "Done" && "lg:row-span-2")}>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-sm">{title}</CardTitle>
        <ToneBadge tone={real.length ? tone : "neutral"}>{real.length}</ToneBadge>
      </CardHeader>
      <CardContent>
        {real.length === 0 ? (
          <p className="text-sm text-muted-foreground">{items[0] ?? "Nothing listed."}</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {real.map((item, i) => (
              <li key={i} className="flex gap-2 leading-relaxed">
                <span className={cn("mt-2 size-1.5 shrink-0 rounded-full", toneDot(tone))} aria-hidden />
                <span className="min-w-0 break-words">
                  <InlineMarkdown text={item} />
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function toneDot(tone: Tone) {
  return {
    success: "bg-success",
    info: "bg-info",
    primary: "bg-primary/60",
    warning: "bg-warning",
    danger: "bg-destructive",
    neutral: "bg-muted-foreground/50",
    highlight: "bg-highlight",
    solid: "bg-primary",
  }[tone];
}

/* ---------------------------------------------------------- Open decisions */

/** Turns "decision 0002" in an item into a link to that record. */
function DecisionRefs({ text, decisions }: { text: string; decisions: Decision[] }) {
  const refs = [...text.matchAll(/\bdecision\s+(\d{4})\b/gi)]
    .map((m) => decisions.find((d) => d.number === m[1]))
    .filter((d): d is Decision => Boolean(d));
  if (refs.length === 0) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {refs.map((d) => (
        <Link
          key={d.number}
          href={`/admin/project?tab=decisions#decision-${d.number}`}
          className="inline-flex items-center gap-1.5 rounded-full border bg-background px-2.5 py-0.5 text-xs hover:border-primary/40"
        >
          <span className="font-mono text-muted-foreground">{d.number}</span>
          {d.title}
          <DecisionBadge status={d.status} label={d.statusText} />
        </Link>
      ))}
    </div>
  );
}

export function OpenDecisionsTab({ items, decisions }: { items: string[]; decisions: Decision[] }) {
  const real = realItems(items);
  if (real.length === 0) {
    return <EmptyState title="No open decisions" description="Nothing is waiting on a decision right now." />;
  }
  return (
    <ol className="grid gap-3">
      {real.map((item, i) => (
        <li key={i} className="flex gap-3 rounded-xl border border-warning/25 bg-warning-soft/40 p-4">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-warning-soft font-mono text-xs font-semibold text-warning">
            {i + 1}
          </span>
          <div className="min-w-0 pt-0.5">
            <p className="text-[0.9375rem] leading-relaxed font-medium break-words">
              <InlineMarkdown text={item} />
            </p>
            <DecisionRefs text={item} decisions={decisions} />
          </div>
        </li>
      ))}
    </ol>
  );
}

/* --------------------------------------------------------------- Decisions */

const DECISION_TONE: Record<DecisionStatus, Tone> = {
  accepted: "success",
  proposed: "warning",
  superseded: "neutral",
  deprecated: "neutral",
  rejected: "danger",
  unknown: "neutral",
};

function DecisionBadge({ status, label }: { status: DecisionStatus; label: string }) {
  return (
    <ToneBadge tone={DECISION_TONE[status]} className="capitalize">
      {label}
    </ToneBadge>
  );
}

export function DecisionsTab({ decisions }: { decisions: Decision[] }) {
  if (decisions.length === 0) {
    return <EmptyState title="No decision records yet" description="Add docs/decisions/NNNN-title.md to record one." />;
  }
  return (
    <div className="grid gap-3">
      {decisions.map((d) => (
        <details
          key={d.number}
          id={`decision-${d.number}`}
          className="group scroll-mt-20 rounded-xl border bg-card shadow-xs open:shadow-sm"
        >
          <summary className="flex cursor-pointer list-none items-start gap-3 p-4 [&::-webkit-details-marker]:hidden">
            <span className="rounded-md bg-muted px-2 py-1 font-mono text-xs font-semibold tabular-nums">
              {d.number}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-medium leading-snug text-balance">{d.title}</p>
              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <DecisionBadge status={d.status} label={d.statusText} />
                {d.date ? <span>{docDate(d.date)}</span> : null}
                <span className="font-mono">{d.file}</span>
              </div>
            </div>
            <span className="mt-1 shrink-0 text-xs text-muted-foreground">
              <span className="group-open:hidden">Show</span>
              <span className="hidden group-open:inline">Hide</span>
            </span>
          </summary>
          <div className="border-t px-4 py-4">
            <Markdown source={d.body} />
          </div>
        </details>
      ))}
    </div>
  );
}

/* --------------------------------------------------------------- Changelog */

export function ChangelogTab({ releases }: { releases: ChangelogRelease[] }) {
  if (releases.length === 0) return <EmptyState title="The changelog has no releases yet" />;
  return (
    <div className="grid gap-4">
      {releases.map((r) => (
        <Card key={r.version}>
          <CardHeader className="flex flex-row flex-wrap items-center gap-2">
            <CardTitle className="text-base">{r.unreleased ? "Unreleased" : r.version}</CardTitle>
            {r.unreleased ? <ToneBadge tone="info">Not yet released</ToneBadge> : null}
            {r.date ? <span className="text-xs text-muted-foreground">{docDate(r.date)}</span> : null}
          </CardHeader>
          <CardContent className="space-y-5">
            {r.groups.length === 0 ? <p className="text-sm text-muted-foreground">No entries.</p> : null}
            {r.groups.map((g) => (
              <section key={g.title}>
                <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  {g.title}
                  <span className="font-mono font-normal tabular-nums">{g.items.length}</span>
                </h3>
                <ul className="space-y-2 text-sm">
                  {g.items.map((item, i) => (
                    <li key={i} className="flex gap-2 leading-relaxed">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary/40" aria-hidden />
                      <span className="min-w-0 break-words">
                        <InlineMarkdown text={item} />
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/* --------------------------------------------------------------- Learnings */

export function LearningsTab({ learnings }: { learnings: Learning[] }) {
  if (learnings.length === 0) return <EmptyState title="No learnings recorded yet" />;
  return (
    <ol className="divide-y overflow-hidden rounded-xl border bg-card shadow-xs">
      {learnings.map((l, i) => (
        <li key={i} className="grid gap-1 p-4 sm:grid-cols-[7.5rem_1fr] sm:gap-4">
          <span className="font-mono text-xs text-muted-foreground sm:pt-0.5">{docDate(l.date) ?? ""}</span>
          <div className="min-w-0">
            {l.title ? (
              <p className="font-medium leading-snug first-letter:uppercase">
                <InlineMarkdown text={l.title} />
              </p>
            ) : null}
            <p className="mt-1 text-sm leading-relaxed break-words text-foreground/85">
              <InlineMarkdown text={l.body} />
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
