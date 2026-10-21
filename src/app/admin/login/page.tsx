import type { Metadata } from "next";
import { Suspense } from "react";

import { site } from "@/lib/site";

import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

// Placeholder login page. The admin-panel agent may restyle it.
export default function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-muted/40 px-4">
      <div className="w-full max-w-sm space-y-6 rounded-xl border bg-card p-6 shadow-sm">
        <div>
          <p className="font-display text-2xl font-semibold text-primary">{site.name}</p>
          <p className="text-sm text-muted-foreground">Control panel sign in</p>
        </div>
        <Suspense fallback={<LoginForm next="/admin" />}>
          <LoginFormWithNext searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}

async function LoginFormWithNext({
  searchParams,
}: {
  searchParams: PageProps<"/admin/login">["searchParams"];
}) {
  const { next } = await searchParams;
  return <LoginForm next={typeof next === "string" ? next : "/admin"} />;
}
