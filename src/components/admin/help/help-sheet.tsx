"use client";

import { CircleHelpIcon } from "lucide-react";
import type { ReactNode } from "react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

/**
 * Client half of HelpButton: the trigger icon and the right-hand sheet. The
 * sheet body is rendered on the server and passed in as children.
 */
export function HelpSheet({
  label,
  title,
  subtitle,
  className,
  children,
}: {
  /** Accessible name of the trigger, e.g. "Help: Record payment". */
  label: string;
  title: string;
  subtitle?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label={label}
          title={label}
          className={cn(
            "inline-flex size-6 shrink-0 items-center justify-center rounded-full align-middle text-muted-foreground/70 transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
            className,
          )}
        >
          <CircleHelpIcon className="size-4" aria-hidden />
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="gap-0 data-[side=right]:w-full data-[side=right]:sm:max-w-md">
        <SheetHeader className="border-b pr-12">
          <SheetDescription className="text-xs font-medium tracking-wide uppercase">Help</SheetDescription>
          <SheetTitle className="text-lg font-semibold tracking-tight">{title}</SheetTitle>
          {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-4 py-4">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
