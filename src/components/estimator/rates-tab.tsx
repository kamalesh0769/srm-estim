"use client";

import { Trash2, ArrowDownToLine, Tags } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { inr, num, formatDate } from "@/lib/format";
import { processModeLabel, lamModeLabel } from "@/lib/calc";
import type { SavedRate } from "./types";

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
      {children}
    </span>
  );
}

function processShort(mode: string, cost: number): string {
  if (cost <= 0) return "—";
  const label = processModeLabel(mode as never);
  return `${inr(cost)} ${label.toLowerCase()}`;
}

export function RatesTab({
  rates,
  loading,
  onApply,
  onDelete,
}: {
  rates: SavedRate[];
  loading: boolean;
  onApply: (r: SavedRate) => void;
  onDelete: (r: SavedRate) => void;
}) {
  if (loading) {
    return (
      <div className="grid gap-3 md:grid-cols-2">
        {[0, 1].map((i) => (
          <Skeleton key={i} className="h-40 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (rates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
        <Tags className="size-10 text-muted-foreground/40" />
        <p className="mt-3 font-semibold">No saved rates yet</p>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          When you fill the estimator with a job&apos;s rates (pieces per sheet, printing,
          cutting, creasing, lamination), press <span className="font-semibold">“Save rates”</span>{" "}
          to store them here. Apply any preset to the form in one tap next time.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {rates.map((r) => (
        <div key={r.id} className="flex flex-col rounded-xl border bg-card p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate font-semibold">{r.name}</p>
              <p className="text-xs text-muted-foreground">Saved {formatDate(r.createdAt)}</p>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="size-8 shrink-0 text-destructive hover:text-destructive"
              onClick={() => onDelete(r)}
              aria-label={`Delete preset ${r.name}`}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <Chip>{num(r.piecesPerSheet)} pcs / sheet</Chip>
            <Chip>Single {inr(r.sheetCostSingle)}/sheet</Chip>
            {r.sheetCostDouble > 0 && <Chip>Double {inr(r.sheetCostDouble)}/sheet</Chip>}
            <Chip>Cut {processShort(r.cutMode, r.cutCost)}</Chip>
            <Chip>Crease {processShort(r.creaseMode, r.creaseCost)}</Chip>
            <Chip>
              {r.lamination
                ? `Lamination ${inr(r.lamCost)} ${lamModeLabel(r.lamMode).toLowerCase()}`
                : "No lamination"}
            </Chip>
          </div>
          <div className="mt-auto pt-3">
            <Button size="sm" className="w-full" onClick={() => onApply(r)}>
              <ArrowDownToLine className="size-4" />
              Apply to new estimate
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

export function RateDeleteDialog({
  pendingDelete,
  onOpenChange,
  onConfirm,
}: {
  pendingDelete: SavedRate | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog open={!!pendingDelete} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete “{pendingDelete?.name}”?</AlertDialogTitle>
          <AlertDialogDescription>
            This rate preset will be removed permanently. Quotations already saved keep their own
            rates.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-white hover:bg-destructive/90"
            onClick={onConfirm}
          >
            Delete preset
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
