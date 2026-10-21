"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const TABS = [
  { href: "/admin/network", label: "Applications", match: (p: string) => p === "/admin/network" || p.startsWith("/admin/network/applications") },
  { href: "/admin/network/providers", label: "Providers", match: (p: string) => p.startsWith("/admin/network/providers") },
  { href: "/admin/network/engagements", label: "Engagements", match: (p: string) => p.startsWith("/admin/network/engagements") },
  { href: "/admin/network/dispatch", label: "Dispatch", match: (p: string) => p.startsWith("/admin/network/dispatch") },
];

export function NetworkTabs() {
  const pathname = usePathname() ?? "";
  return (
    <nav aria-label="Network sections" className="mb-6 flex gap-1 overflow-x-auto border-b">
      {TABS.map((t) => {
        const active = t.match(pathname);
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "-mb-px shrink-0 border-b-2 px-3 py-2 text-sm font-medium",
              active ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
