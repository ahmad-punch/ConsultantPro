import { SearchIcon } from "lucide-react";
import Form from "next/form";
import Link from "next/link";
import { Suspense } from "react";

import { EmptyState } from "@/components/admin/empty-state";
import { AudienceBadge } from "@/components/admin/help/help-nav";
import { PageHeader } from "@/components/admin/page-header";
import { CardsSkeleton } from "@/components/admin/skeletons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requireAdmin } from "@/lib/auth";
import { getHelpNav, helpRepoPath, searchHelp } from "@/lib/help";
import { param } from "@/lib/queries/params";

export const metadata = { title: "Help" };

export default function HelpIndexPage({ searchParams }: PageProps<"/admin/help">) {
  return (
    <>
      <PageHeader
        title="Help"
        description="How Rasta works and what every screen in this panel does. Rendered from docs/help/ in the repo, the same files agents read."
        helpTopic="help"
      />
      <Suspense fallback={<CardsSkeleton count={8} />}>
        <HelpIndex searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function HelpIndex({ searchParams }: { searchParams: PageProps<"/admin/help">["searchParams"] }) {
  await requireAdmin();
  const q = (param(await searchParams, "q") ?? "").trim();
  const groups = getHelpNav();

  return (
    <div className="space-y-8">
      <Form action="/admin/help" className="flex max-w-xl gap-2" role="search">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            name="q"
            type="search"
            defaultValue={q}
            placeholder="Search help, e.g. memo, refund, referral"
            aria-label="Search help"
            className="pl-8"
          />
        </div>
        <Button type="submit" variant="outline">
          Search
        </Button>
      </Form>

      {q ? <SearchResults q={q} /> : null}

      {groups.length === 0 ? (
        <EmptyState
          title="No help pages yet"
          description={<>Add markdown files under <code className="font-mono text-xs">docs/help/</code>. See ARCHITECTURE.md, &ldquo;Documentation and help system&rdquo;.</>}
        />
      ) : q ? null : (
        groups.map((g) => (
          <section key={g.id} aria-labelledby={`help-group-${g.id}`}>
            <h2 id={`help-group-${g.id}`} className="mb-3 text-sm font-semibold">
              {g.label} <span className="font-normal text-muted-foreground">· {g.docs.length}</span>
            </h2>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {g.docs.map((d) => (
                <li key={d.slug}>
                  <Link
                    href={`/admin/help/${d.slug}`}
                    className="flex h-full flex-col gap-2 rounded-xl border bg-card p-4 shadow-xs transition-colors hover:border-primary/40"
                  >
                    <span className="flex items-start justify-between gap-2">
                      <span className="font-medium">{d.title}</span>
                      <AudienceBadge audience={d.audience} />
                    </span>
                    {d.summary ? <span className="text-sm text-muted-foreground">{d.summary}</span> : null}
                    <span className="mt-auto font-mono text-[0.7rem] text-muted-foreground/80">{helpRepoPath(d.file)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}

function SearchResults({ q }: { q: string }) {
  const results = searchHelp(q);
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  return (
    <section aria-label="Search results" className="space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold">
          {results.length} {results.length === 1 ? "result" : "results"} for &ldquo;{q}&rdquo;
        </h2>
        <Link href="/admin/help" className="text-sm text-primary hover:underline">
          Clear search
        </Link>
      </div>
      {results.length === 0 ? (
        <EmptyState title="Nothing matched" description="Try a shorter word, or browse the pages below the search box after clearing it." />
      ) : (
        <ul className="divide-y overflow-hidden rounded-xl border bg-card">
          {results.map(({ doc, snippet }) => (
            <li key={doc.slug}>
              <Link href={`/admin/help/${doc.slug}`} className="block p-4 hover:bg-muted/50">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-primary">{doc.title}</span>
                  <AudienceBadge audience={doc.audience} />
                </span>
                {doc.summary ? <span className="mt-0.5 block text-sm text-muted-foreground">{doc.summary}</span> : null}
                <span className="mt-1.5 block text-sm text-foreground/80">
                  <Highlight text={snippet} terms={terms} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Highlight({ text, terms }: { text: string; terms: string[] }) {
  if (terms.length === 0) return <>{text}</>;
  const escaped = terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const parts = text.split(new RegExp(`(${escaped.join("|")})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <mark key={i} className="rounded-sm bg-highlight-soft px-0.5 text-foreground">
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  );
}
