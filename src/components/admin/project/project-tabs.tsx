"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface ProjectTab {
  value: string;
  label: string;
  count?: number;
  content: ReactNode;
}

/**
 * Tabs whose selection lives in `?tab=` so each tab is linkable. Switching
 * updates the URL with the History API (no server round trip; Next keeps
 * `useSearchParams` in sync). The server picks the initial tab from the URL.
 */
export function ProjectTabs({ tabs, initial }: { tabs: ProjectTab[]; initial: string }) {
  const [value, setValue] = useState(initial);
  const scroller = useRef<HTMLDivElement>(null);

  // On narrow screens the tab list scrolls sideways; keep the active tab visible.
  useEffect(() => {
    const box = scroller.current;
    const active = box?.querySelector<HTMLElement>('[role="tab"][data-state="active"]');
    if (!box || !active) return;
    const left = active.getBoundingClientRect().left - box.getBoundingClientRect().left + box.scrollLeft;
    if (left < box.scrollLeft || left + active.offsetWidth > box.scrollLeft + box.clientWidth) {
      box.scrollTo({ left: Math.max(0, left - 16) });
    }
  }, [value]);

  function onValueChange(next: string) {
    setValue(next);
    const url = new URL(window.location.href);
    if (next === tabs[0]?.value) url.searchParams.delete("tab");
    else url.searchParams.set("tab", next);
    window.history.replaceState(null, "", url);
  }

  return (
    <Tabs value={value} onValueChange={onValueChange} className="gap-4">
      <div ref={scroller} className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0">
        <TabsList className="h-9 w-max">
          {tabs.map((t) => (
            <TabsTrigger key={t.value} value={t.value} className="px-3">
              {t.label}
              {t.count != null ? (
                <span className="rounded-full bg-muted px-1.5 font-mono text-[11px] text-muted-foreground tabular-nums group-data-active:bg-secondary">
                  {t.count}
                </span>
              ) : null}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      {tabs.map((t) => (
        <TabsContent key={t.value} value={t.value}>
          {t.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
