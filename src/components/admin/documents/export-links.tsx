"use client";

import { DownloadIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ENTITIES = [
  ["cases", "Cases"],
  ["leads", "Leads"],
  ["clients", "Clients"],
  ["payments", "Payments"],
  ["invoices", "Invoices"],
  ["retainers", "Retainers"],
  ["ambassadors", "Ambassadors"],
  ["channels", "Channels"],
  ["partners", "Partners"],
] as const;

/** Links to /admin/export/<entity>, with an optional created-date range. */
export function ExportLinks() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const qs = new URLSearchParams();
  if (from) qs.set("from", from);
  if (to) qs.set("to", to);
  const suffix = qs.size ? `?${qs}` : "";
  return (
    <div className="space-y-4 rounded-xl border bg-card p-4">
      <p className="text-sm text-muted-foreground">
        CSV files open in Excel and Google Sheets. Dates filter on when the record was created; leave them empty for everything.
      </p>
      <div className="flex flex-wrap gap-4">
        <div className="grid gap-1.5">
          <Label htmlFor="export-from">From</Label>
          <Input id="export-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="export-to">To</Label>
          <Input id="export-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {ENTITIES.map(([id, label]) => (
          <Button key={id} variant="outline" asChild>
            <a href={`/admin/export/${id}${suffix}`}>
              <DownloadIcon /> {label}
            </a>
          </Button>
        ))}
      </div>
    </div>
  );
}
