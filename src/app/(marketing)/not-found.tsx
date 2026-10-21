import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";

import { Container, Eyebrow, PathMotif } from "@/components/marketing/primitives";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/site";

export default function MarketingNotFound() {
  return (
    <section className="relative overflow-hidden bg-card">
      <PathMotif className="pointer-events-none absolute -top-10 right-0 hidden h-[130%] text-primary/[0.06] md:block" />
      <Container className="relative py-24 sm:py-32">
        <Eyebrow>Page not found</Eyebrow>
        <h1 className="mt-3 max-w-2xl font-display text-4xl font-medium tracking-tight text-primary sm:text-5xl">
          This path does not lead anywhere.
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
          The page may have moved. Try the guides, or tell us what you were looking for.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild className="h-11 px-5">
            <Link href="/guides">
              Browse the guides
              <ArrowRightIcon data-icon="inline-end" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-11 px-5">
            <Link href={site.cta.href}>{site.cta.label}</Link>
          </Button>
        </div>
      </Container>
    </section>
  );
}
