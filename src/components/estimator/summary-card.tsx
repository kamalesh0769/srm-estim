"use client";

import {
  Save,
  FileText,
  MessageCircle,
  RotateCcw,
  BookmarkPlus,
  Pencil,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { inr, num, quoteNumber } from "@/lib/format";
import { processModeLabel, lamModeLabel, type JobInput, type JobResult } from "@/lib/calc";
import type { Quotation } from "./types";

function Row({
  label,
  detail,
  amount,
  muted,
}: {
  label: string;
  detail: string;
  amount: number;
  muted?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <div>
        <p className={muted ? "text-muted-foreground" : "font-medium"}>{label}</p>
        <p className="text-xs text-muted-foreground">{detail}</p>
      </div>
      <p className={`whitespace-nowrap font-medium ${muted ? "text-muted-foreground" : ""}`}>
        {inr(amount)}
      </p>
    </div>
  );
}

export function SummaryCard({
  jobInput,
  result,
  errors,
  editingQuotation,
  saving,
  onSave,
  onPreview,
  onShare,
  onSavePreset,
  onReset,
  onCancelEdit,
}: {
  jobInput: JobInput;
  result: JobResult;
  errors: string[];
  editingQuotation: Quotation | null;
  saving: boolean;
  onSave: () => void;
  onPreview: () => void;
  onShare: () => void;
  onSavePreset: () => void;
  onReset: () => void;
  onCancelEdit: () => void;
}) {
  const { sheets } = result;
  const rate = jobInput.sides === "double" ? jobInput.sheetCostDouble : jobInput.sheetCostSingle;
  const ready = errors.length === 0 && sheets > 0;

  return (
    <Card className="border-primary/20 shadow-md shadow-primary/5 lg:sticky lg:top-20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          Estimate summary
          {editingQuotation && (
            <Badge variant="outline" className="gap-1 border-primary/40 text-primary">
              <Pencil className="size-3" />
              Editing {quoteNumber(editingQuotation.quoteNo)}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sheets */}
        <div className="rounded-lg bg-primary/5 p-4 text-center ring-1 ring-primary/15">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Sheets required
          </p>
          <p className="mt-1 text-4xl font-black text-primary">{num(sheets)}</p>
          {sheets > 0 ? (
            <p className="mt-1 text-xs text-muted-foreground">
              {num(jobInput.totalPieces)} pieces ÷ {num(jobInput.piecesPerSheet)} per sheet,
              rounded up
            </p>
          ) : (
            <p className="mt-1 text-xs text-muted-foreground">
              Enter pieces per sheet &amp; total pieces
            </p>
          )}
        </div>

        <Separator />

        {/* Line items */}
        <div className="space-y-3">
          <Row
            label={`Printing (${jobInput.sides === "double" ? "double" : "single"} side)`}
            detail={sheets > 0 && rate > 0 ? `${num(sheets)} sheets × ${inr(rate)}` : "Rate per sheet"}
            amount={result.printingCost}
            muted={!(sheets > 0 && rate > 0)}
          />
          <Row
            label="Cutting"
            detail={
              jobInput.cutCost > 0
                ? `${processModeLabel(jobInput.cutMode)} @ ${inr(jobInput.cutCost)}`
                : "No charge"
            }
            amount={result.cuttingTotal}
            muted={jobInput.cutCost <= 0}
          />
          <Row
            label="Creasing"
            detail={
              jobInput.creaseCost > 0
                ? `${processModeLabel(jobInput.creaseMode)} @ ${inr(jobInput.creaseCost)}`
                : "No charge"
            }
            amount={result.creasingTotal}
            muted={jobInput.creaseCost <= 0}
          />
          <Row
            label="Lamination"
            detail={
              jobInput.lamination
                ? `${lamModeLabel(jobInput.lamMode)} @ ${inr(jobInput.lamCost)}`
                : "Not required"
            }
            amount={result.laminationTotal}
            muted={!jobInput.lamination}
          />
        </div>

        <Separator />

        {/* Total */}
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">Total estimate</p>
          <p className="text-3xl font-black text-primary">{inr(result.grandTotal)}</p>
        </div>

        {errors.length > 0 && (
          <div className="rounded-md bg-amber-50 p-3 ring-1 ring-amber-200">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-amber-700">
              <AlertCircle className="size-3.5" />
              Fill in to complete the estimate
            </p>
            <ul className="mt-1 list-disc space-y-0.5 pl-5 text-xs text-amber-700">
              {errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="grid gap-2">
          {editingQuotation ? (
            <>
              <Button onClick={onSave} disabled={!ready || saving}>
                <Save className="size-4" />
                {saving ? "Updating…" : `Update ${quoteNumber(editingQuotation.quoteNo)}`}
              </Button>
              <Button variant="outline" onClick={onCancelEdit}>
                <RotateCcw className="size-4" />
                Cancel editing
              </Button>
            </>
          ) : (
            <Button onClick={onSave} disabled={!ready || saving}>
              <Save className="size-4" />
              {saving ? "Saving…" : "Save quotation"}
            </Button>
          )}
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={onPreview} disabled={!ready}>
              <FileText className="size-4" />
              Preview &amp; PDF
            </Button>
            <Button
              variant="outline"
              onClick={onShare}
              disabled={!ready}
              className="border-[#25D366]/40 text-[#128C4A] hover:bg-[#25D366]/10 hover:text-[#128C4A]"
            >
              <MessageCircle className="size-4" />
              WhatsApp
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onSavePreset}
              disabled={!ready}
              title={
                ready
                  ? "Save these rates as a reusable preset"
                  : "Complete the estimate first"
              }
            >
              <BookmarkPlus className="size-4" />
              Save rates
            </Button>
            <Button variant="ghost" size="sm" onClick={onReset}>
              <RotateCcw className="size-4" />
              Reset form
            </Button>
          </div>
        </div>

        <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
          Rates stay fully under your control — no automatic profit margin is added.
        </p>
      </CardContent>
    </Card>
  );
}
