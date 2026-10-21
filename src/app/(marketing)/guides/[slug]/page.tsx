import { ArrowLeftIcon, ArrowRightIcon, CalendarIcon, ClockIcon } from "lucide-react";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { CtaBand } from "@/components/marketing/cta-band";
import { formatGuideDate, GuideCard } from "@/components/marketing/guide-card";
import { JsonLd } from "@/components/marketing/json-ld";
import { guideMdxComponents } from "@/components/marketing/mdx-components";
import { Container, Eyebrow } from "@/components/marketing/primitives";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CASE_CATEGORY_LABELS } from "@/lib/db/enums";
import { getAllGuides, getGuideBySlug, getGuideHeadings, getRelatedGuides } from "@/lib/guides";
import { formatPrice } from "@/lib/pricing";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return getAllGuides().map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: PageProps<"/guides/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) return { title: "Guide not found" };
  return {
    title: guide.title,
    description: guide.summary,
    alternates: { canonical: `/guides/${guide.slug}` },
    openGraph: {
      type: "article",
      title: guide.title,
      description: guide.summary,
      modifiedTime: guide.updated,
    },
  };
}

export default function GuidePage({ params }: PageProps<"/guides/[slug]">) {
  return (
    <Suspense fallback={<GuideSkeleton />}>
      <GuideContent params={params} />
    </Suspense>
  );
}

function GuideSkeleton() {
  return (
    <Container className="py-16">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="mt-6 h-12 w-3/4" />
      <Skeleton className="mt-4 h-5 w-2/3" />
      <div className="mt-12 space-y-3">
        {Array.from({ length: 8 }, (_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
    </Container>
  );
}

async function GuideBody({ source }: { source: string }) {
  "use cache";
  return <MDXRemote source={source} components={guideMdxComponents} />;
}

async function GuideContent({ params }: { params: PageProps<"/guides/[slug]">["params"] }) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) notFound();

  const headings = getGuideHeadings(guide.content);
  const related = getRelatedGuides(guide);
  const categoryLabel = CASE_CATEGORY_LABELS[guide.category];
  const helpHref = `${site.cta.href}?category=${guide.category}`;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.summary,
    dateModified: guide.updated,
    inLanguage: "en",
    publisher: { "@type": "Organization", name: site.name, url: site.url },
    mainEntityOfPage: new URL(`/guides/${guide.slug}`, site.url).toString(),
  };

  return (
    <>
      <header className="border-b bg-card">
        <Container className="py-12 sm:py-16">
          <Link
            href="/guides"
            className="inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-muted-foreground outline-none hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <ArrowLeftIcon className="size-4" aria-hidden="true" />
            All guides
          </Link>
          <Eyebrow className="mt-8">{categoryLabel}</Eyebrow>
          <h1 className="mt-3 max-w-4xl font-display text-4xl leading-[1.1] font-medium tracking-tight text-balance text-primary sm:text-5xl">
            {guide.title}
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-pretty text-muted-foreground">{guide.summary}</p>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CalendarIcon className="size-4" aria-hidden="true" />
              Updated <time dateTime={guide.updated}>{formatGuideDate(guide.updated)}</time>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ClockIcon className="size-4" aria-hidden="true" />
              {guide.readingMinutes} min read
            </span>
          </div>
        </Container>
      </header>

      <Container className="grid gap-12 py-12 sm:py-16 lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-16">
        <article className="min-w-0 max-w-[44rem]">
          {guide.summaryUrdu ? (
            <aside
              aria-label="Urdu summary"
              className="mb-12 rounded-2xl border border-highlight/20 bg-highlight-soft/50 p-6 sm:p-7"
            >
              <p className="text-xs font-semibold tracking-[0.18em] text-highlight uppercase">
                Summary in Urdu
              </p>
              <p lang="ur" dir="rtl" className="mt-3 font-urdu text-lg leading-[2.3] text-foreground">
                {guide.summaryUrdu}
              </p>
            </aside>
          ) : null}

          <GuideBody source={guide.content} />

          <div className="mt-14 rounded-2xl border bg-card p-6 sm:p-8">
            <p className="text-xs font-semibold tracking-[0.18em] text-highlight uppercase">Get help with this</p>
            <p className="mt-3 font-display text-2xl font-medium text-primary">
              Want a written plan for your own situation?
            </p>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              Tell us what is happening. Start with a written answer for {formatPrice("question")}, or a full
              Pathway Memo for {formatPrice("assessment")}.
            </p>
            <Button asChild className="mt-6 h-11 px-5">
              <Link href={helpHref}>
                Get help with {categoryLabel.toLowerCase()}
                <ArrowRightIcon data-icon="inline-end" />
              </Link>
            </Button>
          </div>
        </article>

        <aside className="order-first lg:order-none">
          <div className="space-y-8 lg:sticky lg:top-24">
            {headings.length > 0 ? (
              <nav aria-label="On this page" className="rounded-2xl border bg-card p-5">
                <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">On this page</p>
                <ol className="mt-4 space-y-2.5 text-sm">
                  {headings.map((h) => (
                    <li key={h.id} className={h.level === 3 ? "pl-4" : undefined}>
                      <a
                        href={`#${h.id}`}
                        className="block rounded-sm leading-snug text-foreground/75 outline-none hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50"
                      >
                        {h.text}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            ) : null}
            <div className="hidden rounded-2xl bg-primary p-5 text-primary-foreground lg:block">
              <p className="font-display text-lg leading-snug">Need this handled for you?</p>
              <Button
                asChild
                className="mt-4 h-10 w-full bg-highlight text-highlight-foreground hover:bg-highlight/90"
              >
                <Link href={helpHref}>{site.cta.label}</Link>
              </Button>
              <p className="mt-4 text-xs leading-relaxed text-primary-foreground/70">
                General information, not legal advice.
              </p>
            </div>
          </div>
        </aside>
      </Container>

      {related.length > 0 ? (
        <section aria-labelledby="related-title" className="border-t bg-muted/60 py-16 sm:py-20">
          <Container>
            <h2 id="related-title" className="font-display text-3xl font-medium text-primary">
              Related guides
            </h2>
            <ul className="mt-8 grid gap-6 md:grid-cols-3">
              {related.map((g) => (
                <li key={g.slug}>
                  <GuideCard guide={g} />
                </li>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}

      <CtaBand />
      <JsonLd data={articleJsonLd} />
    </>
  );
}
