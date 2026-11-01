"use client";

import { useState } from "react";
import {
  Eye,
  Pencil,
  Copy,
  Trash2,
  History,
  ReceiptText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { inr, num, formatDate, formatDateTime, quoteNumber } from "@/lib/format";
import type { Quotation } from "./types";

export function HistoryTab({
  quotations,
  loading,
  onView,
  onEdit,
  onDuplicate,
  onDelete,
}: {
  quotations: Quotation[];
  loading: boolean;
  onView: (q: Quotation) => void;
  onEdit: (q: Quotation) => void;
  onDuplicate: (q: Quotation) => void;
  onDelete: (q: Quotation) => void;
}) {
  const [pendingDelete, setPendingDelete] = useState<Quotation | null>(null);

  if (loading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (quotations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
        <History className="size-10 text-muted-foreground/40" />
        <p className="mt-3 font-semibold">No quotations yet</p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Estimates you save will appear here. You can view, edit, duplicate or share them with
          your customers anytime.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {quotations.map((q) => (
          <div
            key={q.id}
            className="flex flex-col gap-3 rounded-xl border bg-card p-4 transition-colors hover:border-primary/30 sm:flex-row sm:items-center"
          >
            <div className="flex items-start gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ReceiptText className="size-5" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold">{quoteNumber(q.quoteNo)}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(q.createdAt)}
                  </span>
                  {q.productName && (
                    <Badge variant="secondary" className="max-w-40 truncate">
                      {q.productName}
                    </Badge>
                  )}
                </div>
                <p className="mt-0.5 truncate text-sm">
                  {q.customerName || <span className="italic text-muted-foreground">Walk-in customer</span>}
                  {q.customerPhone && (
                    <span className="text-muted-foreground"> · {q.customerPhone}</span>
                  )}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {num(q.totalPieces)} pcs · {num(q.sheets)} sheets ·{" "}
                  {q.sides === "double" ? "Double side" : "Single side"}
                  {q.lamination ? " · Lamination" : ""}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 sm:ml-auto sm:flex-col sm:items-end sm:gap-1">
              <p className="text-lg font-black whitespace-nowrap text-primary">
                {inr(q.grandTotal)}
              </p>
              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-8"
                  onClick={() => onView(q)}
                  aria-label={`View ${quoteNumber(q.quoteNo)}`}
                  title="View / print / share"
                >
                  <Eye className="size-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-8"
                  onClick={() => onEdit(q)}
                  aria-label={`Edit ${quoteNumber(q.quoteNo)}`}
                  title="Edit"
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-8"
                  onClick={() => onDuplicate(q)}
                  aria-label={`Duplicate ${quoteNumber(q.quoteNo)}`}
                  title="Duplicate as new"
                >
                  <Copy className="size-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-8 text-destructive hover:text-destructive"
                  onClick={() => setPendingDelete(q)}
                  aria-label={`Delete ${quoteNumber(q.quoteNo)}`}
                  title="Delete"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AlertDialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {pendingDelete ? quoteNumber(pendingDelete.quoteNo) : ""}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the quotation from your history. This cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => {
                if (pendingDelete) onDelete(pendingDelete);
                setPendingDelete(null);
              }}
            >
              Delete quotation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
