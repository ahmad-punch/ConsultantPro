"use client";

import { MenuIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

/** Menu button and slide-in panel for small screens. */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon-lg" className="md:hidden" aria-label="Open menu">
          <MenuIcon className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[85%] bg-background p-0">
        <SheetHeader className="border-b px-6 py-5">
          <SheetTitle className="font-display text-xl text-primary">{site.name}</SheetTitle>
          <SheetDescription>{site.tagline}</SheetDescription>
        </SheetHeader>
        <nav aria-label="Mobile" className="px-3">
          <ul className="flex flex-col">
            {site.nav.map((link) => {
              const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "block rounded-md px-3 py-3 text-base font-medium outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50",
                      active ? "text-primary" : "text-foreground/80",
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="mt-auto border-t p-6">
          <Button asChild className="h-11 w-full text-base">
            <Link href={site.cta.href} onClick={() => setOpen(false)}>
              {site.cta.label}
            </Link>
          </Button>
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">{site.disclaimer}</p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
