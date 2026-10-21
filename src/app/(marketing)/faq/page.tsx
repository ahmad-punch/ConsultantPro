import type { Metadata } from "next";
import Link from "next/link";

import { CtaBand } from "@/components/marketing/cta-band";
import { allFaqs, faqGroups } from "@/components/marketing/data/faqs";
import { FaqList } from "@/components/marketing/faq-list";
import { faqPageJsonLd, JsonLd } from "@/components/marketing/json-ld";
import { Container, PageHeader } from "@/components/marketing/primitives";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Questions and answers",
  description: `Straight answers about ${site.name}: what we do and do not do, prices and payment from abroad, timelines, refunds, property and inheritance, and how we handle your documents.`,
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  return (
    <>
      <PageHeader
        eyebrow="FAQ"
        title="Straight answers to the questions people ask first."
        lede="If your question is not here, send it through the intake form. A written answer to one specific question is a fixed, small fee."
      >
        <nav aria-label="FAQ topics" className="flex flex-wrap gap-2 text-sm">
          {faqGroups.map((group) => (
            <a
              key={group.id}
              href={`#${group.id}`}
              className="rounded-full border bg-background px-3.5 py-1.5 font-medium text-foreground/80 transition-colors outline-none hover:border-primary/40 hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {group.title}
            </a>
          ))}
        </nav>
      </PageHeader>

      <Container className="py-14 sm:py-20">
        <div className="space-y-16">
          {faqGroups.map((group) => (
            <section
              key={group.id}
              id={group.id}
              aria-labelledby={`${group.id}-title`}
              className="grid scroll-mt-24 gap-6 lg:grid-cols-[16rem_1fr] lg:gap-12"
            >
              <h2 id={`${group.id}-title`} className="font-display text-2xl font-medium text-primary lg:pt-5">
                {group.title}
              </h2>
              <FaqList items={group.items} />
            </section>
          ))}
        </div>
        <p className="mt-16 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {site.disclaimer} See the{" "}
          <Link href="/legal/disclaimer" className="font-medium text-primary underline underline-offset-4">
            full disclaimer
          </Link>
          .
        </p>
      </Container>

      <CtaBand />
      <JsonLd data={faqPageJsonLd(allFaqs)} />
    </>
  );
}
