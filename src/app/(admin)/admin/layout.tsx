import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import {
  ActiveNavList,
  LogoutButton,
  MobileNav,
  NavList,
  TopTitle,
} from "@/components/admin/admin-nav";
import { NewMenu } from "@/components/admin/new-menu";
import { requireAdmin } from "@/lib/auth";
import { getActorLabel } from "@/lib/queries/actor";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: { default: `${site.name} Control`, template: `%s | ${site.name} Control` },
  robots: { index: false, follow: false },
};

// Access is enforced by src/proxy.ts; every data component and action also
// calls requireAdmin(). Request-time reads stay inside <Suspense>.
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  const brand = `${site.name} Control`;
  return (
    <div className="min-h-dvh bg-muted/30">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r bg-sidebar md:flex">
        <Link href="/admin" className="flex h-14 items-center gap-2 border-b px-4">
          <span className="flex size-7 items-center justify-center rounded-md bg-primary font-display text-sm font-semibold text-primary-foreground">
            {site.name.charAt(0)}
          </span>
          <span className="font-semibold">
            {site.name} <span className="font-normal text-muted-foreground">Control</span>
          </span>
        </Link>
        <div className="flex-1 overflow-y-auto px-3 py-3">
          <Suspense fallback={<NavList activeHref={null} />}>
            <ActiveNavList />
          </Suspense>
        </div>
        <div className="space-y-1 border-t p-3">
          <Suspense fallback={null}>
            <ActorLine />
          </Suspense>
          <LogoutButton />
        </div>
      </aside>

      <div className="flex min-h-dvh min-w-0 flex-col md:pl-60">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background/95 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:px-4">
          <Suspense fallback={null}>
            <MobileNav brand={brand} />
          </Suspense>
          <div className="min-w-0 flex-1">
            <Suspense fallback={<span className="text-sm font-semibold">Control</span>}>
              <TopTitle />
            </Suspense>
          </div>
          <NewMenu />
        </header>
        <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-5 sm:px-6 sm:py-6">{children}</main>
      </div>
    </div>
  );
}

async function ActorLine() {
  await requireAdmin();
  const actor = await getActorLabel();
  return (
    <Link
      href="/admin/settings"
      className="block truncate rounded-md px-2.5 py-1 text-xs text-muted-foreground hover:bg-sidebar-accent"
      title="Change who signs case notes"
    >
      Acting as <span className="font-medium text-foreground">{actor ?? "not set"}</span>
    </Link>
  );
}
