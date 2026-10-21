"use client";

import {
  BarChart3Icon,
  BriefcaseIcon,
  CalendarDaysIcon,
  CreditCardIcon,
  HandshakeIcon,
  InboxIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  MegaphoneIcon,
  MenuIcon,
  RepeatIcon,
  SettingsIcon,
  UserRoundIcon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { logoutAction } from "@/lib/auth-actions";
import { cn } from "@/lib/utils";

export const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "/admin/leads", label: "Leads", icon: InboxIcon },
  { href: "/admin/cases", label: "Cases", icon: BriefcaseIcon },
  { href: "/admin/clients", label: "Clients", icon: UserRoundIcon },
  { href: "/admin/partners", label: "Partners", icon: HandshakeIcon },
  { href: "/admin/ambassadors", label: "Ambassadors", icon: UsersIcon },
  { href: "/admin/channels", label: "Channels", icon: MegaphoneIcon },
  { href: "/admin/content", label: "Content", icon: CalendarDaysIcon },
  { href: "/admin/payments", label: "Payments", icon: CreditCardIcon },
  { href: "/admin/retainers", label: "Retainers", icon: RepeatIcon },
  { href: "/admin/metrics", label: "Metrics", icon: BarChart3Icon },
  { href: "/admin/settings", label: "Settings", icon: SettingsIcon },
] as const;

function activeItem(pathname: string | null) {
  if (!pathname) return null;
  return (
    [...NAV_ITEMS]
      .sort((a, b) => b.href.length - a.href.length)
      .find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`)) ?? null
  );
}

/** Presentational nav list. `activeHref` null renders nothing highlighted. */
export function NavList({
  activeHref,
  onNavigate,
}: {
  activeHref: string | null;
  onNavigate?: () => void;
}) {
  return (
    <nav aria-label="Control panel" className="grid gap-0.5">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = href === activeHref;
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground",
              active && "bg-sidebar-primary font-medium text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function ActiveNavList() {
  const pathname = usePathname();
  return <NavList activeHref={activeItem(pathname)?.href ?? null} />;
}

export function TopTitle() {
  const pathname = usePathname();
  return <span className="truncate text-sm font-semibold">{activeItem(pathname)?.label ?? "Control"}</span>;
}

export function LogoutButton({ className }: { className?: string }) {
  return (
    <form action={logoutAction} className={className}>
      <Button type="submit" variant="ghost" size="sm" className="w-full justify-start text-muted-foreground">
        <LogOutIcon />
        Sign out
      </Button>
    </form>
  );
}

export function MobileNav({ brand }: { brand: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open navigation">
          <MenuIcon />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 bg-sidebar p-0">
        <SheetHeader className="border-b px-4 py-3">
          <SheetTitle className="text-left">{brand}</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-3">
          <NavList activeHref={activeItem(pathname)?.href ?? null} onNavigate={() => setOpen(false)} />
        </div>
        <div className="border-t p-3">
          <LogoutButton />
        </div>
      </SheetContent>
    </Sheet>
  );
}
