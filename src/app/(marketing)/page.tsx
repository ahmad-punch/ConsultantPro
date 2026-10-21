import Link from "next/link";

import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/pricing";
import { site } from "@/lib/site";

// Placeholder home page. The marketing-site agent replaces this file.
export default function HomePage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-24">
      <p className="font-urdu text-2xl text-highlight" lang="ur" dir="rtl">
        {site.urduName}
      </p>
      <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-primary sm:text-5xl">
        {site.tagline}
      </h1>
      <p className="mt-6 text-lg text-muted-foreground">{site.description}</p>
      <div className="mt-8 flex flex-wrap items-center gap-4">
        <Button asChild size="lg">
          <Link href={site.cta.href}>{site.cta.label}</Link>
        </Button>
        <span className="text-sm text-muted-foreground">
          Case Assessment {formatPrice("assessment")}
        </span>
      </div>
    </section>
  );
}
