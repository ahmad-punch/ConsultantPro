"use client";

import { SearchIcon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import { buildHref, type Opt } from "./format";

const ALL = "__all";

export type FilterDef = { name: string; label: string; options: Opt[] };

/**
 * Search box plus select filters that write to the URL (searchParams), so
 * filtered views are shareable and server-rendered.
 */
export function FilterBar({
  basePath,
  values,
  filters,
  searchPlaceholder = "Search...",
  search = true,
}: {
  basePath: string;
  values: Record<string, string | undefined>;
  filters: FilterDef[];
  searchPlaceholder?: string;
  search?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(values.q ?? "");
  const first = useRef(true);

  const go = (patch: Record<string, string | undefined>) => {
    startTransition(() => router.replace(buildHref(basePath, values, patch), { scroll: false }));
  };

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if ((values.q ?? "") === q) return;
    const t = setTimeout(() => {
      startTransition(() =>
        router.replace(buildHref(basePath, values, { q: q || undefined }), { scroll: false }),
      );
    }, 300);
    return () => clearTimeout(t);
  }, [q, basePath, values, router]);

  const active = filters.some((f) => values[f.name]) || !!values.q;

  return (
    <div className={cn("mb-4 flex flex-wrap items-center gap-2", pending && "opacity-70")}>
      {search ? (
        <div className="relative w-full sm:w-64">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            aria-label="Search"
            placeholder={searchPlaceholder}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-8"
          />
        </div>
      ) : null}
      {filters.map((f) => (
        <Select
          key={f.name}
          value={values[f.name] ?? ALL}
          onValueChange={(v) => go({ [f.name]: v === ALL ? undefined : v })}
        >
          <SelectTrigger size="default" aria-label={f.label} className="min-w-36">
            {/* Explicit label so the server render shows it before hydration. */}
            <SelectValue>
              {f.options.find((o) => o.value === values[f.name])?.label ?? `All ${f.label.toLowerCase()}`}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All {f.label.toLowerCase()}</SelectItem>
            {f.options.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}
      {active ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setQ("");
            const keep = Object.fromEntries(
              Object.entries(values).filter(([k]) => k === "view"),
            );
            startTransition(() => router.replace(buildHref(basePath, keep), { scroll: false }));
          }}
        >
          <XIcon />
          Clear
        </Button>
      ) : null}
    </div>
  );
}
