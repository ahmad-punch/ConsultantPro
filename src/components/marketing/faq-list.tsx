import { ArrowRightIcon, PlusIcon } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

import type { Faq } from "./data/faqs";
import { Todo } from "./primitives";

/** Accessible disclosure list built on <details>/<summary>. */
export function FaqList({ items, className }: { items: Faq[]; className?: string }) {
  return (
    <div className={cn("divide-y divide-border border-y border-border", className)}>
      {items.map((item) => (
        <details key={item.id} id={`faq-${item.id}`} className="group scroll-mt-24">
          <summary className="flex cursor-pointer list-none items-start justify-between gap-6 rounded-sm py-5 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden">
            <span className="font-display text-lg leading-snug font-medium text-foreground transition-colors group-hover:text-primary sm:text-xl">
              {item.question}
            </span>
            <span
              aria-hidden="true"
              className="mt-1 grid size-7 shrink-0 place-items-center rounded-full border border-border text-primary transition-transform duration-200 group-open:rotate-45 group-open:border-primary/40 group-open:bg-secondary"
            >
              <PlusIcon className="size-4" />
            </span>
          </summary>
          <div className="max-w-3xl pr-10 pb-6 text-base leading-relaxed text-muted-foreground">
            <p>{item.answer}</p>
            {item.todo ? (
              <p className="mt-3">
                <Todo>{item.todo}</Todo>
              </p>
            ) : null}
            {item.link ? (
              <Link
                href={item.link.href}
                className="mt-3 inline-flex items-center gap-1.5 rounded-sm font-medium text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {item.link.label}
                <ArrowRightIcon className="size-4" aria-hidden="true" />
              </Link>
            ) : null}
          </div>
        </details>
      ))}
    </div>
  );
}
