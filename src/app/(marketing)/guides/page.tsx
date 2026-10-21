import type { Metadata } from "next";
import Link from "next/link";

import { CtaBand } from "@/components/marketing/cta-band";
import { GuideCard } from "@/components/marketing/guide-card";
import { Container, PageHeader } from "@/components/marketing/primitives";
import { UrduToggle } from "@/components/marketing/urdu-toggle";
import { CASE_CATEGORY_LABELS } from "@/lib/db/enums";
import { getAllGuides, getGuidesByCategory } from "@/lib/guides";

export const metadata: Metadata = {
  title: "Pathway guides",
  description:
    "Free plain-English guides for overseas Pakistanis: inheritance, power of attorney, illegal occupation, FBR filer status, NICOP, attestation, company registration and courts. Urdu summary on each.",
  alternates: { canonical: "/guides" },
};

export default function GuidesPage() {
  const groups = getGuidesByCategory();
  const total = getAllGuides().length;

  return (
    <>
      <PageHeader
        eyebrow="Pathway guides"
        title="Read the route before you spend anything."
        lede="Plain-English guides to the problems overseas families face most often: who owns the problem, the steps, realistic timelines and the traps. General information, not legal advice."
      >
        <nav aria-label="Guide categories" className="flex flex-wrap gap-2 text-sm">
          {groups.map(({ category, guides }) => (
            <a
              key={category}
              href={`#${category}`}
              className="rounded-full border bg-background px-3.5 py-1.5 font-medium text-foreground/80 transition-colors outline-none hover:border-primary/40 hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {CASE_CATEGORY_LABELS[category]}
              <span className="ml-1.5 text-muted-foreground">{guides.length}</span>
            </a>
          ))}
        </nav>
      </PageHeader>

      <Container className="py-14 sm:py-20">
        <UrduToggle>
          <p className="mt-4 text-sm text-muted-foreground">
            {total} guides. Each has a short summary in Urdu.
          </p>
          <div className="mt-12 space-y-16">
            {groups.map(({ category, guides }) => (
              <section key={category} id={category} aria-labelledby={`${category}-title`} className="scroll-mt-24">
                <div className="flex items-baseline justify-between gap-4 border-b pb-4">
                  <h2 id={`${category}-title`} className="font-display text-2xl font-medium text-primary sm:text-3xl">
                    {CASE_CATEGORY_LABELS[category]}
                  </h2>
                  <Link
                    href={`/start?category=${category}`}
                    className="shrink-0 rounded-sm text-sm font-medium text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    Get help with this
                  </Link>
                </div>
                <ul className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {guides.map((guide) => (
                    <li key={guide.slug}>
                      <GuideCard guide={guide} showUrdu />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </UrduToggle>
      </Container>

      <CtaBand title="Your situation is not in a guide?" />
    </>
  );
}
