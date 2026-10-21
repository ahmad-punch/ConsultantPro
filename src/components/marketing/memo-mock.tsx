import { cn } from "@/lib/utils";

import { LogoMark } from "./logo";

/** The sections every Pathway Memo follows. Shared with /how-it-works. */
export const memoSections = [
  { title: "Your situation in one paragraph", body: "What you told us, what the documents show, and what we still do not know." },
  { title: "Who owns the problem", body: "The office, court or forum that can actually act, and where it sits." },
  { title: "Your options", body: "Each lawful remedy, with what it needs from you and what it usually achieves." },
  { title: "Realistic timelines", body: "Ranges, not promises, and what tends to slow each route down." },
  { title: "Costs", body: "Our fee, the advocate's likely fee, and government fees, kept separate." },
  { title: "Traps to avoid", body: "The mistakes that most often cost families money or time in this kind of case." },
  { title: "Next steps", body: "Who does what, in what order, and what you need to send us." },
] as const;

function Lines({ widths }: { widths: string[] }) {
  return (
    <div className="mt-2 space-y-1.5" aria-hidden="true">
      {widths.map((w, i) => (
        <div key={i} className="h-1.5 rounded-full bg-foreground/[0.08]" style={{ width: w }} />
      ))}
    </div>
  );
}

const lineSets = [
  ["100%", "94%", "62%"],
  ["88%", "70%"],
  ["100%", "96%", "82%", "54%"],
  ["92%", "66%"],
  ["100%", "74%"],
  ["96%", "88%", "40%"],
  ["100%", "58%"],
];

/**
 * A styled HTML mock of a Pathway Memo: the real headings, with grey lines
 * standing in for content. Labelled as a sample layout, not a real case.
 */
export function MemoMock({ className }: { className?: string }) {
  return (
    <figure className={cn("relative pr-3 pb-3", className)}>
      <div
        aria-hidden="true"
        className="absolute inset-0 top-3 left-3 rotate-[1.5deg] rounded-lg border bg-muted"
      />
      <div className="relative rounded-lg border bg-card p-6 shadow-[0_30px_60px_-30px_rgb(23_32_28/0.35)] sm:p-8">
        <div className="flex items-start justify-between gap-4 border-b border-dashed pb-5">
          <div>
            <p className="text-[0.65rem] font-semibold tracking-[0.2em] text-highlight uppercase">Pathway Memo</p>
            <p className="mt-1 font-display text-xl font-medium text-primary">Inherited plot, Punjab</p>
            <p className="mt-1 font-mono text-xs text-muted-foreground">Ref RS-0000 · Sample layout</p>
          </div>
          <LogoMark className="size-9 shrink-0" />
        </div>
        <ol className="mt-5 space-y-4">
          {memoSections.map((section, i) => (
            <li key={section.title} className="grid grid-cols-[1.75rem_1fr] gap-x-2">
              <span className="font-mono text-xs leading-5 text-highlight">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <p className="text-sm leading-5 font-semibold text-foreground">{section.title}</p>
                <Lines widths={lineSets[i] ?? ["90%"]} />
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-dashed pt-4 text-[0.7rem] leading-relaxed text-muted-foreground">
          <span>Legal content reviewed by an independent partner advocate.</span>
          <span className="italic">General information, not legal advice.</span>
        </div>
      </div>
      <figcaption className="sr-only">
        Sample layout of a Pathway Memo, showing its seven sections. Not a real case.
      </figcaption>
    </figure>
  );
}
