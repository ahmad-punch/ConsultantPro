import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import { Button } from "@/components/ui/button";
import { site } from "@/lib/site";

import { Logo } from "./logo";
import { MobileNav } from "./mobile-nav";
import { NavLinks } from "./nav-links";
import { Container } from "./primitives";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur supports-backdrop-filter:bg-background/75">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Logo />
        <nav aria-label="Main" className="hidden md:block">
          <Suspense fallback={null}>
            <NavLinks links={site.nav} />
          </Suspense>
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild className="hidden h-10 px-4 text-sm sm:inline-flex">
            <Link href={site.cta.href}>
              {site.cta.label}
              <ArrowRightIcon data-icon="inline-end" />
            </Link>
          </Button>
          <Suspense fallback={null}>
            <MobileNav />
          </Suspense>
        </div>
      </Container>
    </header>
  );
}
