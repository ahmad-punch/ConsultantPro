import Link from "next/link";
import { isValidElement, type ComponentProps, type ReactNode } from "react";

import { slugifyHeading } from "@/lib/guides";
import { cn } from "@/lib/utils";

/** Plain text of a React node tree (for heading ids). */
function textOf(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) return textOf(node.props.children);
  return "";
}

/**
 * Prose styling for guide MDX. There is no typography plugin in this repo,
 * so every element is styled here.
 */
export const guideMdxComponents = {
  h2: ({ children, className, ...props }: ComponentProps<"h2">) => (
    <h2
      id={slugifyHeading(textOf(children))}
      className={cn(
        "mt-14 scroll-mt-24 font-display text-2xl font-medium tracking-tight text-primary first:mt-0 sm:text-3xl",
        className,
      )}
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, className, ...props }: ComponentProps<"h3">) => (
    <h3
      id={slugifyHeading(textOf(children))}
      className={cn("mt-10 scroll-mt-24 font-display text-xl font-medium text-primary", className)}
      {...props}
    >
      {children}
    </h3>
  ),
  h4: ({ className, ...props }: ComponentProps<"h4">) => (
    <h4 className={cn("mt-8 font-semibold text-foreground", className)} {...props} />
  ),
  p: ({ className, ...props }: ComponentProps<"p">) => (
    <p className={cn("mt-5 text-[1.0625rem] leading-[1.8] text-foreground/85", className)} {...props} />
  ),
  ul: ({ className, ...props }: ComponentProps<"ul">) => (
    <ul
      className={cn(
        "mt-5 list-disc space-y-2.5 pl-6 text-[1.0625rem] leading-[1.75] text-foreground/85 marker:text-highlight",
        className,
      )}
      {...props}
    />
  ),
  ol: ({ className, ...props }: ComponentProps<"ol">) => (
    <ol
      className={cn(
        "mt-5 list-decimal space-y-3 pl-6 text-[1.0625rem] leading-[1.75] text-foreground/85 marker:font-mono marker:text-sm marker:text-highlight",
        className,
      )}
      {...props}
    />
  ),
  li: ({ className, ...props }: ComponentProps<"li">) => <li className={cn("pl-1.5", className)} {...props} />,
  strong: ({ className, ...props }: ComponentProps<"strong">) => (
    <strong className={cn("font-semibold text-foreground", className)} {...props} />
  ),
  em: ({ className, ...props }: ComponentProps<"em">) => <em className={cn("italic", className)} {...props} />,
  a: ({ href = "", className, children, ...props }: ComponentProps<"a">) => {
    const cls = cn(
      "font-medium text-primary underline decoration-primary/30 underline-offset-4 transition-colors hover:decoration-primary",
      className,
    );
    if (href.startsWith("/") || href.startsWith("#")) {
      return (
        <Link href={href} className={cls}>
          {children}
        </Link>
      );
    }
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls} {...props}>
        {children}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    );
  },
  blockquote: ({ className, ...props }: ComponentProps<"blockquote">) => (
    <blockquote
      className={cn("mt-6 border-l-2 border-highlight pl-5 text-foreground/80 italic", className)}
      {...props}
    />
  ),
  hr: () => <hr className="my-12 border-border" />,
  code: ({ className, ...props }: ComponentProps<"code">) => (
    <code className={cn("rounded bg-muted px-1.5 py-0.5 font-mono text-[0.9em]", className)} {...props} />
  ),
  table: ({ className, ...props }: ComponentProps<"table">) => (
    <div className="mt-6 overflow-x-auto rounded-xl border">
      <table className={cn("w-full border-collapse text-left text-sm", className)} {...props} />
    </div>
  ),
  th: ({ className, ...props }: ComponentProps<"th">) => (
    <th className={cn("border-b bg-muted/60 p-3 font-semibold", className)} {...props} />
  ),
  td: ({ className, ...props }: ComponentProps<"td">) => <td className={cn("border-b p-3 align-top", className)} {...props} />,
};
