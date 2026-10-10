"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// For destructive or tenant-affecting actions (guide 2.3): shows exactly
// what will change, no autosave, explicit confirm. `children` is the
// "what changes" detail — a diff, a list, a plain sentence.
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  confirmLabel = "Confirm",
  destructive = false,
  pending = false,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  confirmLabel?: string;
  destructive?: boolean;
  pending?: boolean;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children && <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm">{children}</div>}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" variant={destructive ? "destructive" : "default"} disabled={pending} onClick={onConfirm}>
            {pending ? "Working..." : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// A small hook for the common "open with a value, confirm, clear" shape —
// most ConfirmDialog call sites need exactly this and nothing more.
export function useConfirm<T>() {
  const [target, setTarget] = useState<T | null>(null);
  return { target, open: (t: T) => setTarget(t), close: () => setTarget(null) };
}
