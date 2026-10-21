import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Markdown rendering for the project docs page. Bodies go through
 * next-mdx-remote in plain-markdown mode (`format: "md"`), so `<` and `{` in
 * the docs are text, not JSX. Single-line list items use `InlineMarkdown`,
 * which avoids compiling dozens of tiny MDX documents per request.
 */

function DocLink({ href = "", className, children }: ComponentProps<"a">) {
  const cls = cn(
    "font-medium text-primary underline decoration-primary/30 underline-offset-4 hover:decoration-primary",
    className,
  );
  if (href.startsWith("/") || href.startsWith("#")) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  if (/^https?:\/\//.test(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {children}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    );
  }
  // Repo-relative links (../research/x.md) have no page in the panel.
  return (
    <span className="font-medium" title={href}>
      {children}
    </span>
  );
}

const Code = ({ className, ...props }: ComponentProps<"code">) => (
  <code
    className={cn("rounded bg-muted px-1 py-0.5 font-mono text-[0.85em] break-words", className)}
    {...props}
  />
);

const proseComponents = {
  h1: ({ className, ...props }: ComponentProps<"h1">) => (
    <h3 className={cn("mt-5 text-sm font-semibold first:mt-0", className)} {...props} />
  ),
  h2: ({ className, ...props }: ComponentProps<"h2">) => (
    <h4 className={cn("mt-5 text-sm font-semibold first:mt-0", className)} {...props} />
  ),
  h3: ({ className, ...props }: ComponentProps<"h3">) => (
    <h5 className={cn("mt-4 text-sm font-medium first:mt-0", className)} {...props} />
  ),
  p: ({ className, ...props }: ComponentProps<"p">) => (
    <p className={cn("mt-2 leading-relaxed text-foreground/85 first:mt-0", className)} {...props} />
  ),
  ul: ({ className, ...props }: ComponentProps<"ul">) => (
    <ul className={cn("mt-2 list-disc space-y-1 pl-5 text-foreground/85 marker:text-muted-foreground", className)} {...props} />
  ),
  ol: ({ className, ...props }: ComponentProps<"ol">) => (
    <ol className={cn("mt-2 list-decimal space-y-1 pl-5 text-foreground/85", className)} {...props} />
  ),
  li: ({ className, ...props }: ComponentProps<"li">) => <li className={cn("pl-1 leading-relaxed", className)} {...props} />,
  strong: ({ className, ...props }: ComponentProps<"strong">) => (
    <strong className={cn("font-semibold text-foreground", className)} {...props} />
  ),
  a: DocLink,
  code: Code,
  pre: ({ className, ...props }: ComponentProps<"pre">) => (
    <pre className={cn("mt-2 overflow-x-auto rounded-lg bg-muted p-3 text-xs [&_code]:bg-transparent [&_code]:p-0", className)} {...props} />
  ),
  blockquote: ({ className, ...props }: ComponentProps<"blockquote">) => (
    <blockquote className={cn("mt-2 border-l-2 border-highlight pl-3 text-foreground/80", className)} {...props} />
  ),
  hr: () => <hr className="my-4 border-border" />,
  table: ({ className, ...props }: ComponentProps<"table">) => (
    <div className="mt-2 overflow-x-auto rounded-lg border">
      <table className={cn("w-full border-collapse text-left text-xs", className)} {...props} />
    </div>
  ),
  th: ({ className, ...props }: ComponentProps<"th">) => (
    <th className={cn("border-b bg-muted/60 p-2 font-semibold", className)} {...props} />
  ),
  td: ({ className, ...props }: ComponentProps<"td">) => <td className={cn("border-b p-2 align-top", className)} {...props} />,
};

export function Markdown({ source, className }: { source: string; className?: string }) {
  return (
    <div className={cn("text-sm", className)}>
      <MDXRemote source={source} components={proseComponents} options={{ mdxOptions: { format: "md" } }} />
    </div>
  );
}

// `code`, **bold**, *em* / _em_, [text](href). Code spans win, so markers
// inside backticks stay literal.
const INLINE = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*\s][^*]*\*|\b_[^_]+_\b)|(\[[^\]]+\]\([^)\s]+\))/g;

function renderInline(text: string, keyPrefix = ""): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let i = 0;
  for (const m of text.matchAll(INLINE)) {
    const start = m.index ?? 0;
    if (start > last) out.push(text.slice(last, start));
    const key = `${keyPrefix}${i++}`;
    const [tok] = m;
    if (m[1]) out.push(<Code key={key}>{tok.slice(1, -1)}</Code>);
    else if (m[2])
      out.push(
        <strong key={key} className="font-semibold text-foreground">
          {renderInline(tok.slice(2, -2), `${key}-`)}
        </strong>,
      );
    else if (m[3]) out.push(<em key={key}>{renderInline(tok.slice(1, -1), `${key}-`)}</em>);
    else {
      const lm = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(tok)!;
      out.push(
        <DocLink key={key} href={lm[2]}>
          {renderInline(lm[1], `${key}-`)}
        </DocLink>,
      );
    }
    last = start + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function InlineMarkdown({ text }: { text: string }) {
  return <>{renderInline(text)}</>;
}
