"use client";

import { LanguagesIcon } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

/**
 * Wraps server-rendered guide cards. Toggling sets data-urdu on the wrapper;
 * cards reveal their Urdu summary with `group-data-[urdu=on]/urdu:block`.
 */
export function UrduToggle({ children }: { children: React.ReactNode }) {
  const [on, setOn] = useState(false);
  return (
    <div data-urdu={on ? "on" : "off"} className="group/urdu">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          aria-pressed={on}
          onClick={() => setOn((v) => !v)}
          className={cn(
            "inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
            on
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card text-foreground hover:border-primary/40",
          )}
        >
          <LanguagesIcon className="size-4" aria-hidden="true" />
          {on ? "Hide Urdu summaries" : "Show Urdu summaries"}
          <span lang="ur" className="font-urdu text-sm leading-none">
            اردو
          </span>
        </button>
      </div>
      {children}
    </div>
  );
}
