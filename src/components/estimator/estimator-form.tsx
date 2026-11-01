"use client";

import type { LamMode, ProcessMode, Sides } from "@/lib/calc";
import { LAM_MODES, PROCESS_MODES, sheetsRequired } from "@/lib/calc";
import { num } from "@/lib/format";
import type { FormState } from "./types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Scissors, GalleryVerticalEnd, Layers, UserRound, Layers2 } from "lucide-react";
import { cn } from "@/lib/utils";

function Question({
  index,
  label,
  children,
  htmlFor,
}: {
  index: number;
  label: string;
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="flex items-baseline gap-2 text-sm font-medium">
        <span className="flex size-5 shrink-0 translate-y-0.5 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
          {index}
        </span>
        {label}
      </Label>
      {children}
    </div>
  );
}

function ModeSelect({
  value,
  onChange,
  includeSheet = true,
  id,
}: {
  value: ProcessMode | LamMode;
  onChange: (v: string) => void;
  includeSheet?: boolean;
  id?: string;
}) {
  const options = includeSheet
    ? PROCESS_MODES
    : PROCESS_MODES.filter((m) => m.value !== "per_piece");
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger id={id} className="w-full sm:w-[170px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((m) => (
          <SelectItem key={m.value} value={m.value}>
            {m.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function unitHint(
  mode: ProcessMode | LamMode,
  totalPieces: number,
  sheets: number
): string {
  if (mode === "overall") return "Charged once for the whole job";
  if (mode === "per_piece") return `× ${num(totalPieces)} pieces`;
  return `× ${num(sheets)} sheets`;
}

function SideButton({
  active,
  onClick,
  title,
  desc,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  desc: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex flex-1 items-start gap-2.5 rounded-lg border p-3 text-left transition-colors",
        active
          ? "border-primary bg-red-50 ring-1 ring-primary/40"
          : "bg-background hover:bg-muted/60"
      )}
    >
      <span className={cn("mt-0.5 text-primary", active ? "opacity-100" : "opacity-50")}>
        {icon}
      </span>
      <span>
        <span className={cn("block text-sm font-semibold", active && "text-primary")}>
          {title}
        </span>
        <span className="mt-0.5 block text-xs text-muted-foreground">{desc}</span>
      </span>
    </button>
  );
}

export function EstimatorForm({
  form,
  onChange,
}: {
  form: FormState;
  onChange: (patch: Partial<FormState>) => void;
}) {
  const pieces = Number(form.piecesPerSheet);
  const total = Number(form.totalPieces);
  const sheets = sheetsRequired(total, pieces);

  const costField = (
    mode: ProcessMode | LamMode,
    value: string,
    onValue: (v: string) => void,
    id: string,
    placeholder = "0.00"
  ) => (
    <div className="flex-1 space-y-1">
      <div className="relative">
        <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">
          ₹
        </span>
        <Input
          id={id}
          type="number"
          min="0"
          step="any"
          inputMode="decimal"
          placeholder={placeholder}
          className="pl-7"
          value={value}
          onChange={(e) => onValue(e.target.value)}
        />
      </div>
      <p className="text-xs text-muted-foreground">{unitHint(mode, total, sheets)}</p>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* ── Customer information (optional) ── */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <UserRound className="size-4 text-primary" />
            Customer information
            <span className="text-xs font-normal text-muted-foreground">(optional)</span>
          </CardTitle>
          <CardDescription>
            Shown on the printed estimate and used for WhatsApp sharing.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="customerName">Customer name</Label>
            <Input
              id="customerName"
              placeholder="e.g. Ravi Traders"
              value={form.customerName}
              onChange={(e) => onChange({ customerName: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="customerPhone">Phone (WhatsApp)</Label>
            <Input
              id="customerPhone"
              type="tel"
              inputMode="tel"
              placeholder="e.g. 98417 09111"
              value={form.customerPhone}
              onChange={(e) => onChange({ customerPhone: e.target.value })}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="productName">Job / product name</Label>
            <Input
              id="productName"
              placeholder="e.g. Visiting cards, Wedding invitation, Brochure…"
              value={form.productName}
              onChange={(e) => onChange({ productName: e.target.value })}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="orderDetails">Order details / notes</Label>
            <Textarea
              id="orderDetails"
              rows={2}
              placeholder="Paper type, size, colour, delivery notes…"
              value={form.orderDetails}
              onChange={(e) => onChange({ orderDetails: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* ── 1. Printing requirements ── */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">1 · Printing requirements</CardTitle>
          <CardDescription>The core job specification.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Question index={1} label="How many pieces in one sheet?" htmlFor="piecesPerSheet">
              <Input
                id="piecesPerSheet"
                type="number"
                min="1"
                step="1"
                inputMode="numeric"
                placeholder="e.g. 12"
                value={form.piecesPerSheet}
                onChange={(e) => onChange({ piecesPerSheet: e.target.value })}
              />
            </Question>
            <Question index={2} label="Total pieces wanted?" htmlFor="totalPieces">
              <Input
                id="totalPieces"
                type="number"
                min="1"
                step="1"
                inputMode="numeric"
                placeholder="e.g. 1000"
                value={form.totalPieces}
                onChange={(e) => onChange({ totalPieces: e.target.value })}
              />
              {sheets > 0 && (
                <p className="text-xs text-muted-foreground">
                  → <span className="font-semibold text-primary">{num(sheets)}</span>{" "}
                  {sheets === 1 ? "sheet" : "sheets"} will be used (rounded up)
                </p>
              )}
            </Question>
          </div>

          <Separator />

          <Question index={3} label="Single side or double side printing?">
            <div className="flex flex-col gap-2.5 sm:flex-row">
              <SideButton
                active={form.sides === "single"}
                onClick={() => onChange({ sides: "single" })}
                title="Single side"
                desc="Uses the single-side rate per sheet"
                icon={<Layers className="size-4" />}
              />
              <SideButton
                active={form.sides === "double"}
                onClick={() => onChange({ sides: "double" })}
                title="Double side"
                desc="Uses your separately entered double-side rate"
                icon={<Layers2 className="size-4" />}
              />
            </div>
          </Question>

          <Separator />

          <div>
            <p className="mb-2.5 text-sm font-medium">
              <span className="mr-2 inline-flex size-5 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                7
              </span>
              Cost per sheet
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div
                className={cn(
                  "rounded-lg border p-3 transition-colors",
                  form.sides === "single" ? "border-primary/40 bg-red-50/50" : "bg-muted/30"
                )}
              >
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <Label htmlFor="sheetCostSingle" className="text-xs font-semibold">
                    Single side
                  </Label>
                  {form.sides === "single" && (
                    <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                      APPLYING
                    </span>
                  )}
                </div>
                <div className="relative">
                  <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">
                    ₹
                  </span>
                  <Input
                    id="sheetCostSingle"
                    type="number"
                    min="0"
                    step="any"
                    inputMode="decimal"
                    placeholder="Rate per sheet"
                    className="pl-7"
                    value={form.sheetCostSingle}
                    onChange={(e) => onChange({ sheetCostSingle: e.target.value })}
                  />
                </div>
                {sheets > 0 && Number(form.sheetCostSingle) > 0 && form.sides === "single" && (
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    {num(sheets)} sheets × ₹{form.sheetCostSingle}
                  </p>
                )}
              </div>
              <div
                className={cn(
                  "rounded-lg border p-3 transition-colors",
                  form.sides === "double" ? "border-primary/40 bg-red-50/50" : "bg-muted/30"
                )}
              >
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <Label htmlFor="sheetCostDouble" className="text-xs font-semibold">
                    Double side
                  </Label>
                  {form.sides === "double" && (
                    <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                      APPLYING
                    </span>
                  )}
                </div>
                <div className="relative">
                  <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">
                    ₹
                  </span>
                  <Input
                    id="sheetCostDouble"
                    type="number"
                    min="0"
                    step="any"
                    inputMode="decimal"
                    placeholder="Manual double-side rate"
                    className="pl-7"
                    value={form.sheetCostDouble}
                    onChange={(e) => onChange({ sheetCostDouble: e.target.value })}
                  />
                </div>
                {sheets > 0 && Number(form.sheetCostDouble) > 0 && form.sides === "double" && (
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    {num(sheets)} sheets × ₹{form.sheetCostDouble}
                  </p>
                )}
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Two independent rates — the app automatically selects the matching one from the
              printing type above.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ── 2. Additional processing ── */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">2 · Additional processing</CardTitle>
          <CardDescription>
            Enter 0 if a process is not required for this job.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* 4 · Cutting */}
          <div className="space-y-2">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <span className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                4
              </span>
              Cost for cutting
              <Scissors className="size-3.5 text-muted-foreground" />
            </p>
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-start">
              <ModeSelect
                id="cutMode"
                value={form.cutMode}
                onChange={(v) => onChange({ cutMode: v as ProcessMode })}
              />
              {costField(form.cutMode, form.cutCost, (v) => onChange({ cutCost: v }), "cutCost")}
            </div>
          </div>

          <Separator />

          {/* 5 · Creasing */}
          <div className="space-y-2">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <span className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                5
              </span>
              Cost for creasing
              <GalleryVerticalEnd className="size-3.5 text-muted-foreground" />
            </p>
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-start">
              <ModeSelect
                id="creaseMode"
                value={form.creaseMode}
                onChange={(v) => onChange({ creaseMode: v as ProcessMode })}
              />
              {costField(
                form.creaseMode,
                form.creaseCost,
                (v) => onChange({ creaseCost: v }),
                "creaseCost"
              )}
            </div>
          </div>

          <Separator />

          {/* 6 · Lamination */}
          <div className="space-y-2.5">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <span className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                6
              </span>
              Lamination required?
              <Layers className="size-3.5 text-muted-foreground" />
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onChange({ lamination: true })}
                aria-pressed={form.lamination}
                className={cn(
                  "rounded-md border px-5 py-2 text-sm font-semibold transition-colors",
                  form.lamination
                    ? "border-primary bg-red-50 text-primary ring-1 ring-primary/40"
                    : "bg-background hover:bg-muted/60"
                )}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => onChange({ lamination: false })}
                aria-pressed={!form.lamination}
                className={cn(
                  "rounded-md border px-5 py-2 text-sm font-semibold transition-colors",
                  !form.lamination
                    ? "border-primary bg-red-50 text-primary ring-1 ring-primary/40"
                    : "bg-background hover:bg-muted/60"
                )}
              >
                No
              </button>
            </div>
            {form.lamination && (
              <div className="flex flex-col gap-2.5 sm:flex-row sm:items-start">
                <ModeSelect
                  id="lamMode"
                  includeSheet={false}
                  value={form.lamMode}
                  onChange={(v) => onChange({ lamMode: v as LamMode })}
                />
                {costField(
                  form.lamMode,
                  form.lamCost,
                  (v) => onChange({ lamCost: v }),
                  "lamCost"
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
