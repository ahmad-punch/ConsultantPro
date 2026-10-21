import Link from "next/link";

import { site } from "@/lib/site";

// Placeholder shell. The marketing-site agent replaces this file.
export default function MarketingLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <Link href="/" className="font-display text-xl font-semibold text-primary">
            {site.name}
          </Link>
          <nav aria-label="Main" className="hidden gap-6 text-sm md:flex">
            {site.nav.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-primary">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-muted-foreground">
          <p>{site.disclaimer}</p>
        </div>
      </footer>
    </div>
  );
}
