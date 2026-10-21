import Link from "next/link";

import { isDemoMode } from "@/lib/db/demo";
import { emailLink, hasWhatsapp, isPlaceholder, site, whatsappLink } from "@/lib/site";

import { Logo } from "./logo";
import { Container, Todo } from "./primitives";

const footerLink =
  "rounded-sm text-primary-foreground/85 underline-offset-4 outline-none transition-colors hover:text-primary-foreground hover:underline focus-visible:ring-3 focus-visible:ring-highlight-soft/60";

export function SiteFooter() {
  const emailSet = !isPlaceholder(site.email);
  return (
    <footer className="bg-primary text-primary-foreground">
      <Container className="py-14 sm:py-16">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <Logo invert />
            <p className="mt-4 max-w-sm font-display text-lg leading-snug text-primary-foreground/90">
              {site.tagline}
            </p>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-primary-foreground/70">
              We are not a law firm. We do not sell access, shortcuts or outcomes. We follow
              the official process, publish our prices and put everything in writing.
            </p>
          </div>

          <nav aria-label="Footer" className="md:col-span-3">
            <h2 className="text-xs font-semibold tracking-[0.18em] text-primary-foreground/60 uppercase">
              Explore
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {site.nav.map((link) => (
                <li key={link.href}>
                  <Link className={footerLink} href={link.href}>
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link className={footerLink} href={site.cta.href}>
                  {site.cta.label}
                </Link>
              </li>
            </ul>
          </nav>

          <div className="md:col-span-4">
            <h2 className="text-xs font-semibold tracking-[0.18em] text-primary-foreground/60 uppercase">
              Contact
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                {hasWhatsapp ? (
                  <a className={footerLink} href={whatsappLink("Hi, I have a question about Rasta.")}>
                    WhatsApp us
                  </a>
                ) : (
                  <Link className={footerLink} href={site.cta.href}>
                    Send us your case through the intake form
                  </Link>
                )}
              </li>
              <li>
                {emailSet ? (
                  <a className={footerLink} href={emailLink()}>
                    {site.email}
                  </a>
                ) : (
                  <Todo className="border-highlight-soft/50 bg-transparent text-highlight-soft">
                    TODO: contact email
                  </Todo>
                )}
              </li>
            </ul>
            <h2 className="mt-8 text-xs font-semibold tracking-[0.18em] text-primary-foreground/60 uppercase">
              Legal
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {site.footerNav.map((link) => (
                <li key={link.href}>
                  <Link className={footerLink} href={link.href}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 space-y-3 border-t border-primary-foreground/15 pt-8 text-xs leading-relaxed text-primary-foreground/65">
          <p className="max-w-3xl">{site.disclaimer}</p>
          <p>
            {isPlaceholder(site.legalEntity) ? (
              <Todo className="border-highlight-soft/50 bg-transparent text-highlight-soft">
                {site.legalEntity}
              </Todo>
            ) : (
              site.legalEntity
            )}
          </p>
          <p>&copy; {site.name}. All rights reserved.</p>
          {isDemoMode() ? <p>Demo site: sample data only, reset regularly.</p> : null}
        </div>
      </Container>
    </footer>
  );
}
