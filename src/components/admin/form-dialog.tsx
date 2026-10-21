"use client";

import { useState, type ComponentProps, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

import { DialogCloseContext } from "./action-form";

/** A button that opens a dialog holding an ActionForm; closes on success. */
export function FormDialog({
  triggerLabel,
  triggerIcon,
  triggerVariant = "default",
  triggerSize = "default",
  title,
  description,
  children,
  wide,
}: {
  triggerLabel: ReactNode;
  triggerIcon?: ReactNode;
  triggerVariant?: ComponentProps<typeof Button>["variant"];
  triggerSize?: ComponentProps<typeof Button>["size"];
  title: string;
  description?: ReactNode;
  children: ReactNode;
  wide?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={triggerVariant} size={triggerSize}>
          {triggerIcon}
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className={cn("max-h-[90dvh] overflow-y-auto", wide ? "sm:max-w-2xl" : "sm:max-w-lg")}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        <DialogCloseContext.Provider value={() => setOpen(false)}>{children}</DialogCloseContext.Provider>
      </DialogContent>
    </Dialog>
  );
}
