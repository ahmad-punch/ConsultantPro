"use client";

import { Loader2Icon, UploadIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { ToneBadge } from "@/components/admin/badges";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import type { ImportPreview, ImportResult } from "@/lib/validation/imports";

/**
 * Paste or choose a CSV, preview it (validated on the server, per-row errors
 * and duplicates flagged), then import the valid rows. The file is read in the
 * browser and sent to the action as text.
 */
export function CsvImportDialog({
  noun,
  columns,
  preview,
  run,
}: {
  noun: string;
  columns: readonly string[];
  preview: (text: string) => Promise<ImportPreview>;
  run: (text: string) => Promise<ImportResult>;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [result, setResult] = useState<ImportPreview | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const reset = () => {
    setText("");
    setResult(null);
  };

  const onPreview = () =>
    startTransition(async () => {
      try {
        setResult(await preview(text));
      } catch {
        toast.error("Could not read the CSV. Try again.");
      }
    });

  const onImport = () =>
    startTransition(async () => {
      try {
        const r = await run(text);
        if (!r.ok) {
          toast.error(r.error ?? "Import failed.");
          return;
        }
        toast.success(r.message ?? "Imported.");
        reset();
        setOpen(false);
        router.refresh();
      } catch {
        toast.error("Could not import. Try again.");
      }
    });

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">
          <UploadIcon />
          Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Import {noun} from CSV</DialogTitle>
          <DialogDescription>
            First row is the header. Columns: <code className="text-xs">{columns.join(",")}</code>
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor={`csv-file-${noun}`}>CSV file</Label>
            <input
              id={`csv-file-${noun}`}
              type="file"
              accept=".csv,text/csv,text/plain"
              className="text-sm file:mr-3 file:rounded-md file:border file:bg-card file:px-2.5 file:py-1 file:text-sm"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                if (file.size > 1_000_000) {
                  toast.error("That file is over 1 MB. Split it and import in parts.");
                  return;
                }
                setText(await file.text());
                setResult(null);
              }}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor={`csv-text-${noun}`}>Or paste CSV</Label>
            <Textarea
              id={`csv-text-${noun}`}
              rows={6}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setResult(null);
              }}
              placeholder={columns.join(",")}
              className="font-mono text-xs"
            />
          </div>
          {result && !result.ok ? <p className="text-sm text-destructive">{result.error}</p> : null}
          {result && result.ok ? (
            <>
              <p className="text-sm">
                {result.validCount} of {result.rows.length} rows will be imported.
                {result.rows.length - result.validCount > 0
                  ? ` ${result.rows.length - result.validCount} will be skipped (errors or duplicates).`
                  : ""}
              </p>
              <div className="max-h-72 overflow-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Line</TableHead>
                      <TableHead>{columns[0]}</TableHead>
                      <TableHead>{columns[1]}</TableHead>
                      <TableHead>Result</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.rows.map((r) => (
                      <TableRow key={r.line}>
                        <TableCell className="font-mono text-xs">{r.line}</TableCell>
                        <TableCell className="max-w-48 truncate">{r.values[columns[0]]}</TableCell>
                        <TableCell className="max-w-32 truncate">{r.values[columns[1]]}</TableCell>
                        <TableCell className="text-xs">
                          {r.errors.length ? (
                            <span className="text-destructive">{r.errors.join("; ")}</span>
                          ) : r.duplicate ? (
                            <ToneBadge tone="warning">Duplicate, skipped</ToneBadge>
                          ) : (
                            <ToneBadge tone="success">OK</ToneBadge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          ) : null}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onPreview} disabled={pending || !text.trim()}>
            {pending ? <Loader2Icon className="animate-spin" aria-hidden /> : null}
            Preview
          </Button>
          <Button onClick={onImport} disabled={pending || !result?.ok || result.validCount === 0}>
            Import {result?.ok ? result.validCount : ""} {noun}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
