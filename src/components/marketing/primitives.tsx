import { cn } from "@/lib/utils";

/** Page-width wrapper with the standard side gutters. */
export function Container({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8", className)} {...props} />;
}

type Tone = "default" | "card" | "muted" | "primary";

const toneClass: Record<Tone, string> = {
  default: "bg-background",
  card: "bg-card",
  muted: "bg-muted/60",
  primary: "bg-primary text-primary-foreground",
};

/** A full-width page band. */
export function Section({
  tone = "default",
  className,
  children,
  ...props
}: React.ComponentProps<"section"> & { tone?: Tone }) {
  return (
    <section className={cn("py-16 sm:py-24", toneClass[tone], className)} {...props}>
      <Container>{children}</Container>
    </section>
  );
}

/** Small uppercase label above a heading. */
export function Eyebrow({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      className={cn(
        "text-xs font-semibold tracking-[0.18em] text-highlight uppercase",
        className,
      )}
      {...props}
    />
  );
}

/** Eyebrow + heading + lede, used at the top of every section. */
export function SectionHeading({
  eyebrow,
  title,
  lede,
  id,
  align = "left",
  invert = false,
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  id?: string;
  align?: "left" | "center";
  invert?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow ? (
        <Eyebrow className={cn(invert && "text-highlight-soft")}>{eyebrow}</Eyebrow>
      ) : null}
      <h2
        id={id}
        className={cn(
          "mt-3 font-display text-3xl font-medium tracking-tight text-balance sm:text-4xl",
          invert ? "text-primary-foreground" : "text-primary",
        )}
      >
        {title}
      </h2>
      {lede ? (
        <p
          className={cn(
            "mt-4 text-lg leading-relaxed text-pretty",
            invert ? "text-primary-foreground/80" : "text-muted-foreground",
          )}
        >
          {lede}
        </p>
      ) : null}
    </div>
  );
}

/** Top-of-page header for inner pages. */
export function PageHeader({
  eyebrow,
  title,
  lede,
  children,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <header className="relative overflow-hidden border-b bg-card">
      <PathMotif className="pointer-events-none absolute -top-10 right-0 hidden h-[130%] text-primary/[0.06] md:block" />
      <Container className="relative py-14 sm:py-20">
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <h1 className="mt-3 max-w-3xl font-display text-4xl font-medium tracking-tight text-balance text-primary sm:text-5xl">
          {title}
        </h1>
        {lede ? (
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-pretty text-muted-foreground">
            {lede}
          </p>
        ) : null}
        {children ? <div className="mt-8">{children}</div> : null}
      </Container>
    </header>
  );
}

/**
 * Visible placeholder for a value that is not decided yet (CLAUDE.md:
 * placeholders are TODO-prefixed and visibly marked).
 */
export function Todo({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-baseline gap-1 rounded-md border border-dashed border-warning/60 bg-warning-soft px-1.5 py-0.5 text-[0.8em] font-medium text-warning",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Decorative winding path (the "rasta"). Purely visual. */
export function PathMotif({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 600"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path
        d="M330 -10C330 90 70 110 70 220s260 120 260 230-180 120-180 170"
        stroke="currentColor"
        strokeWidth="56"
        strokeLinecap="round"
      />
      <path
        d="M330 -10C330 90 70 110 70 220s260 120 260 230-180 120-180 170"
        stroke="var(--paper)"
        strokeOpacity="0.7"
        strokeWidth="3"
        strokeDasharray="14 18"
        strokeLinecap="round"
      />
    </svg>
  );
}
