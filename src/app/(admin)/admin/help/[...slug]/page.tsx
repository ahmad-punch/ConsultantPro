import { ArrowLeftIcon, ArrowRightIcon, ChevronDownIcon, FileTextIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { EmptyState } from "@/components/admin/empty-state";
import { HelpMarkdown } from "@/components/admin/help/help-markdown";
import { AudienceBadge, HelpNav } from "@/components/admin/help/help-nav";
import { ScrollToHash } from "@/components/admin/help/scroll-to-hash";
import { PageHeader } from "@/components/admin/page-header";
import { DetailSkeleton } from "@/components/admin/skeletons";
import { requireAdmin } from "@/lib/auth";
import {
  getHelpDoc,
  getHelpHeadings,
  getHelpNav,
  getHelpNeighbours,
  helpRepoPath,
  type HelpHeading,
  type HelpNavGroup,
} from "@/lib/help";

export const metadata: Metadata = { title: "Help" };

type Params = PageProps<"/admin/help/[...slug]">["params"];

export default function HelpDocPage({ params }: PageProps<"/admin/help/[...slug]">) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <HelpDocView params={params} />
    </Suspense>
  );
}

async function HelpDocView({ params }: { params: Params }) {
  await requireAdmin();
  const { slug } = await params;
  const path = slug.map((s) => decodeURIComponent(s)).join("/");
  const doc = getHelpDoc(path);
  const groups = getHelpNav();

  if (!doc) {
    // Screen docs are linked from every HelpButton; say what to add rather than 404.
    if (slug[0] !== "screens" || slug.length !== 2) notFound();
    const file = helpRepoPath(`screens/${slug[1]}.md`);
    return (
      <HelpLayout groups={groups}>
        <PageHeader eyebrow={<HelpCrumb />} title="Not written yet" />
        <EmptyState
          icon={<FileTextIcon className="size-5" />}
          title="Help for this screen is not written yet."
          description={
            <>
              Add <code className="font-mono text-xs">{file}</code>. The headings to use are listed in ARCHITECTURE.md under
              &ldquo;Documentation and help system&rdquo;.
            </>
          }
        />
      </HelpLayout>
    );
  }

  const headings = getHelpHeadings(doc.content);
  const { prev, next } = getHelpNeighbours(doc.slug);
  const file = helpRepoPath(doc.file);

  return (
    <HelpLayout groups={groups} activeSlug={doc.slug} headings={headings}>
      <PageHeader
        eyebrow={<HelpCrumb />}
        title={doc.title}
        description={doc.summary || undefined}
        className="mb-3"
      />
      <div className="mb-6 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <AudienceBadge audience={doc.audience} />
        <span className="font-mono">{file}</span>
      </div>

      {headings.length > 1 ? (
        <details className="group mb-6 rounded-xl border bg-card xl:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-2.5 text-sm font-medium [&::-webkit-details-marker]:hidden">
            On this page
            <ChevronDownIcon className="size-4 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden />
          </summary>
          <div className="border-t px-4 py-3">
            <Toc headings={headings} />
          </div>
        </details>
      ) : null}

      <article className="max-w-3xl">
        {doc.content.trim() ? (
          <HelpMarkdown source={doc.content} file={doc.file} />
        ) : (
          <p className="text-sm text-muted-foreground">This page has no text yet.</p>
        )}
      </article>
      <ScrollToHash />

      {prev || next ? (
        <nav aria-label="Previous and next help page" className="mt-12 grid max-w-3xl gap-3 sm:grid-cols-2">
          {prev ? (
            <Link href={`/admin/help/${prev.slug}`} className="rounded-xl border bg-card p-3 hover:border-primary/40">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <ArrowLeftIcon className="size-3" aria-hidden /> Previous
              </span>
              <span className="mt-0.5 block text-sm font-medium">{prev.title}</span>
            </Link>
          ) : (
            <span className="hidden sm:block" />
          )}
          {next ? (
            <Link href={`/admin/help/${next.slug}`} className="rounded-xl border bg-card p-3 text-right hover:border-primary/40">
              <span className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                Next <ArrowRightIcon className="size-3" aria-hidden />
              </span>
              <span className="mt-0.5 block text-sm font-medium">{next.title}</span>
            </Link>
          ) : null}
        </nav>
      ) : null}

      <footer className="mt-8 max-w-3xl space-y-1 border-t pt-4 text-xs text-muted-foreground">
        <p>
          Edit this file: <code className="font-mono text-foreground">{file}</code>
        </p>
        <p>
          This markdown file is the source of truth. The panel renders it as-is, and agents working on the repo read the
          same file, so fix mistakes there rather than in the code.
        </p>
      </footer>
    </HelpLayout>
  );
}

function HelpCrumb() {
  return (
    <Link href="/admin/help" className="inline-flex items-center gap-1 hover:text-foreground">
      <ArrowLeftIcon className="size-3" /> Help
    </Link>
  );
}

function HelpLayout({
  groups,
  activeSlug,
  headings = [],
  children,
}: {
  groups: HelpNavGroup[];
  activeSlug?: string;
  headings?: HelpHeading[];
  children: React.ReactNode;
}) {
  return (
    <div className="gap-8 lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] xl:grid-cols-[13rem_minmax(0,1fr)_13rem]">
      <aside className="hidden lg:block">
        <div className="sticky top-20 max-h-[calc(100dvh-6rem)] overflow-y-auto pb-6">
          <HelpNav groups={groups} activeSlug={activeSlug} />
        </div>
      </aside>

      <div className="min-w-0">
        <details className="group mb-5 rounded-xl border bg-card lg:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-2.5 text-sm font-medium [&::-webkit-details-marker]:hidden">
            All help pages
            <ChevronDownIcon className="size-4 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden />
          </summary>
          <div className="border-t p-3">
            <HelpNav groups={groups} activeSlug={activeSlug} />
          </div>
        </details>
        {children}
      </div>

      <aside className="hidden xl:block">
        {headings.length > 1 ? (
          <div className="sticky top-20 max-h-[calc(100dvh-6rem)] overflow-y-auto pb-6">
            <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">On this page</p>
            <Toc headings={headings} />
          </div>
        ) : null}
      </aside>
    </div>
  );
}

function Toc({ headings }: { headings: HelpHeading[] }) {
  return (
    <ul className="grid gap-1 text-sm">
      {headings.map((h, i) => (
        <li key={`${h.id}-${i}`} className={h.level === 3 ? "pl-3" : undefined}>
          <a
            href={`#${h.id}`}
            className={
              h.level === 3
                ? "block text-xs text-muted-foreground hover:text-foreground"
                : "block text-foreground/80 hover:text-foreground"
            }
          >
            {h.text}
          </a>
        </li>
      ))}
    </ul>
  );
}
