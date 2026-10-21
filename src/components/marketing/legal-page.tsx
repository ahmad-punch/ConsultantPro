import { FileWarningIcon } from "lucide-react";

import { Container, Eyebrow } from "./primitives";

/** Shell for legal drafts: a visible "draft" banner, then plain prose. */
export function LegalPage({
  title,
  lede,
  updated,
  children,
}: {
  title: string;
  lede: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="border-b bg-card">
        <Container className="py-12 sm:py-16">
          <div
            role="note"
            className="flex items-start gap-3 rounded-xl border border-dashed border-warning/60 bg-warning-soft px-4 py-3 text-sm text-warning"
          >
            <FileWarningIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <p>
              <span className="font-semibold">Draft, to be reviewed by counsel.</span> This page is a plain
              working draft and may change before launch.
            </p>
          </div>
          <Eyebrow className="mt-8">Legal</Eyebrow>
          <h1 className="mt-3 font-display text-4xl font-medium tracking-tight text-primary sm:text-5xl">{title}</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">{lede}</p>
          <p className="mt-4 text-sm text-muted-foreground">Last updated {updated}</p>
        </Container>
      </header>
      <Container className="py-12 sm:py-16">
        <div className="max-w-3xl space-y-5 text-[1.0625rem] leading-[1.8] text-foreground/85 [&_h2]:mt-12 [&_h2]:scroll-mt-24 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-medium [&_h2]:text-primary [&_li]:pl-1 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6 [&_ul]:marker:text-highlight [&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4">
          {children}
        </div>
      </Container>
    </>
  );
}
