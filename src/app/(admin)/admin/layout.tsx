import Link from "next/link";

import { Button } from "@/components/ui/button";
import { logoutAction } from "@/lib/auth-actions";
import { site } from "@/lib/site";

// Placeholder shell. The admin-panel agent replaces this file.
// Access is enforced by src/proxy.ts; pages and actions call requireAdmin().
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="flex min-h-dvh flex-col bg-muted/40">
      <header className="border-b bg-background">
        <div className="flex items-center justify-between gap-4 px-4 py-3">
          <Link href="/admin" className="font-semibold text-primary">
            {site.name} control panel
          </Link>
          <form action={logoutAction}>
            <Button type="submit" variant="ghost" size="sm">
              Sign out
            </Button>
          </form>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6">{children}</main>
    </div>
  );
}
