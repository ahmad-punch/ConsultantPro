import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";
import { isValidElement, type ComponentProps, type ReactNode } from "react";

import { resolveHelpLink, slugifyHeading } from "@/lib/help";
import { cn } from "@/lib/utils";

import { remarkPipeTables } from "./remark-tables";

/** Plain text of a React node tree (for heading ids). */
function textOf(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) return textOf(node.props.children);
  return "";
}

/**
 * Prose for help markdown, sized for the control panel (smaller than the
 * public guides). `compact` is the side-sheet variant: smaller headings and
 * no heading ids (the full page owns the anchors).
 */
function helpComponents(file: string, compact: boolean) {
  const headingId = (children: ReactNode) => (compact ? undefined : slugifyHeading(textOf(children)));
  return {
    h1: ({ children, className, ...props }: ComponentProps<"h1">) => (
      <h2
        id={headingId(children)}
        className={cn("mt-8 scroll-mt-20 text-xl font-semibold tracking-tight first:mt-0", className)}
        {...props}
      >
        {children}
      </h2>
    ),
    h2: ({ children, className, ...props }: ComponentProps<"h2">) => (
      <h2
        id={headingId(children)}
        className={cn(
          "scroll-mt-20 font-semibold tracking-tight first:mt-0 target:text-primary",
          compact ? "mt-5 text-sm" : "mt-10 border-b pb-2 text-lg",
          className,
        )}
        {...props}
      >
        {children}
      </h2>
    ),
    h3: ({ children, className, ...props }: ComponentProps<"h3">) => (
      <h3
        id={headingId(children)}
        className={cn("scroll-mt-20 font-semibold first:mt-0 target:text-primary", compact ? "mt-4 text-sm" : "mt-7 text-base", className)}
        {...props}
      >
        {children}
      </h3>
    ),
    h4: ({ className, ...props }: ComponentProps<"h4">) => (
      <h4 className={cn("mt-5 text-sm font-semibold first:mt-0", className)} {...props} />
    ),
    p: ({ className, ...props }: ComponentProps<"p">) => (
      <p className={cn("mt-3 leading-relaxed text-foreground/85 first:mt-0", compact ? "text-sm" : "text-[0.9375rem]", className)} {...props} />
    ),
    ul: ({ className, ...props }: ComponentProps<"ul">) => (
      <ul
        className={cn(
          "mt-3 list-disc space-y-1.5 pl-5 leading-relaxed text-foreground/85 marker:text-muted-foreground first:mt-0",
          compact ? "text-sm" : "text-[0.9375rem]",
          className,
        )}
        {...props}
      />
    ),
    ol: ({ className, ...props }: ComponentProps<"ol">) => (
      <ol
        className={cn(
          "mt-3 list-decimal space-y-1.5 pl-5 leading-relaxed text-foreground/85 marker:text-muted-foreground first:mt-0",
          compact ? "text-sm" : "text-[0.9375rem]",
          className,
        )}
        {...props}
      />
    ),
    li: ({ className, ...props }: ComponentProps<"li">) => (
      <li className={cn("pl-1 [&>ol]:mt-1.5 [&>p]:mt-1 [&>ul]:mt-1.5", className)} {...props} />
    ),
    strong: ({ className, ...props }: ComponentProps<"strong">) => (
      <strong className={cn("font-semibold text-foreground", className)} {...props} />
    ),
    em: ({ className, ...props }: ComponentProps<"em">) => <em className={cn("italic", className)} {...props} />,
    a: ({ href = "", className, children, ...props }: ComponentProps<"a">) => {
      const cls = cn("font-medium text-primary underline decoration-primary/30 underline-offset-4 hover:decoration-primary", className);
      if (/^https?:\/\//.test(href) || href.startsWith("mailto:")) {
        return (
          <a href={href} target="_blank" rel="noopener noreferrer" className={cls} {...props}>
            {children}
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        );
      }
      if (href.startsWith("/") || href.startsWith("#")) {
        return (
          <Link href={href} className={cls}>
            {children}
          </Link>
        );
      }
      const helpHref = resolveHelpLink(file, href);
      if (helpHref) {
        return (
          <Link href={helpHref} className={cls}>
            {children}
          </Link>
        );
      }
      // A repo path (e.g. src/lib/pricing.ts): not a page, show it as a path.
      return (
        <span className="font-medium" title={href}>
          {children}
        </span>
      );
    },
    blockquote: ({ className, ...props }: ComponentProps<"blockquote">) => (
      <blockquote
        className={cn("mt-4 rounded-r-lg border-l-2 border-highlight bg-highlight-soft/40 py-2 pr-3 pl-4 text-foreground/85 first:mt-0 [&>p]:mt-1 [&>p:first-child]:mt-0", className)}
        {...props}
      />
    ),
    hr: () => <hr className="my-8 border-border" />,
    pre: ({ className, ...props }: ComponentProps<"pre">) => (
      <pre
        className={cn("mt-4 overflow-x-auto rounded-lg border bg-muted/60 p-3 font-mono text-xs leading-relaxed first:mt-0 [&>code]:bg-transparent [&>code]:p-0", className)}
        {...props}
      />
    ),
    code: ({ className, ...props }: ComponentProps<"code">) => (
      <code className={cn("rounded bg-muted px-1 py-0.5 font-mono text-[0.85em] break-words", className)} {...props} />
    ),
    table: ({ className, ...props }: ComponentProps<"table">) => (
      <div className="mt-4 overflow-x-auto rounded-lg border first:mt-0">
        <table className={cn("w-full border-collapse text-left text-sm", className)} {...props} />
      </div>
    ),
    th: ({ className, ...props }: ComponentProps<"th">) => (
      <th className={cn("border-b bg-muted/60 px-3 py-2 font-semibold", className)} {...props} />
    ),
    td: ({ className, ...props }: ComponentProps<"td">) => (
      <td className={cn("border-b px-3 py-2 align-top", className)} {...props} />
    ),
  };
}

/**
 * Renders help markdown (CommonMark plus pipe tables). Cached by its
 * arguments so repeated HelpButtons and prerendered shells do not recompile.
 * `file` is the doc's path under docs/help, used to resolve relative links.
 */
export async function HelpMarkdown({
  source,
  file,
  compact = false,
}: {
  source: string;
  file: string;
  compact?: boolean;
}) {
  "use cache";
  return (
    <MDXRemote
      source={source}
      components={helpComponents(file, compact)}
      options={{ mdxOptions: { format: "md", remarkPlugins: [remarkPipeTables] } }}
    />
  );
}
