import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/pricing";
import { site } from "@/lib/site";

import { Container, PathMotif } from "./primitives";

/** Closing call to action on a deep green band. */
export function CtaBand({
  title = "Tell us what is happening. We will tell you, in writing, what to do next.",
  lede,
}: {
  title?: string;
  lede?: string;
}) {
  return (
    <section aria-labelledby="cta-title" className="relative overflow-hidden bg-primary text-primary-foreground">
      <PathMotif className="pointer-events-none absolute -right-10 -bottom-24 h-[140%] text-primary-foreground/[0.06]" />
      <Container className="relative py-20 sm:py-24">
        <div className="max-w-2xl">
          <h2 id="cta-title" className="font-display text-3xl font-medium tracking-tight text-balance sm:text-4xl">
            {title}
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-primary-foreground/80">
            {lede ??
              `Start with the intake form. It takes about five minutes and costs nothing. If you only need one answer, a written Pathway Question is ${formatPrice("question")}.`}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              className="h-12 bg-highlight px-6 text-base text-highlight-foreground hover:bg-highlight/90"
            >
              <Link href={site.cta.href}>
                {site.cta.label}
                <ArrowRightIcon data-icon="inline-end" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-12 border-primary-foreground/30 bg-transparent px-6 text-base text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <Link href="/pricing">See prices</Link>
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
