// ─── SRM ART PRINTS · Printing Cost Estimator ───
// Shared calculation engine — used on the client for live preview
// and on the server as the source of truth when saving quotations.

export type Sides = "single" | "double";
export type ProcessMode = "overall" | "per_piece" | "per_sheet";
export type LamMode = "overall" | "per_sheet";

export const PROCESS_MODES: { value: ProcessMode; label: string }[] = [
  { value: "overall", label: "Overall price" },
  { value: "per_piece", label: "Per piece" },
  { value: "per_sheet", label: "Per sheet" },
];

export const LAM_MODES: { value: LamMode; label: string }[] = [
  { value: "overall", label: "Overall price" },
  { value: "per_sheet", label: "Per sheet" },
];

export function processModeLabel(m: ProcessMode): string {
  return PROCESS_MODES.find((x) => x.value === m)?.label ?? m;
}

export function lamModeLabel(m: LamMode): string {
  return LAM_MODES.find((x) => x.value === m)?.label ?? m;
}

/** The 7 questions from the estimator spec (double-side rate entered manually — Option C, no profit margin). */
export interface JobInput {
  piecesPerSheet: number;
  totalPieces: number;
  sides: Sides;
  sheetCostSingle: number;
  sheetCostDouble: number;
  cutMode: ProcessMode;
  cutCost: number;
  creaseMode: ProcessMode;
  creaseCost: number;
  lamination: boolean;
  lamMode: LamMode;
  lamCost: number;
}

export interface JobResult {
  sheets: number;
  printingCost: number;
  cuttingTotal: number;
  creasingTotal: number;
  laminationTotal: number;
  grandTotal: number;
}

export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/** Sheets required = Total pieces ÷ Pieces per sheet, rounded up. */
export function sheetsRequired(totalPieces: number, piecesPerSheet: number): number {
  if (piecesPerSheet <= 0 || totalPieces <= 0) return 0;
  return Math.ceil(totalPieces / piecesPerSheet);
}

export function computeJob(input: JobInput): JobResult {
  const sheets = sheetsRequired(input.totalPieces, input.piecesPerSheet);
  // The app automatically selects the appropriate rate based on the printing type.
  const rate = input.sides === "double" ? input.sheetCostDouble : input.sheetCostSingle;
  const printingCost = sheets * rate;

  const processCost = (mode: ProcessMode, cost: number) =>
    mode === "overall"
      ? cost
      : mode === "per_piece"
        ? cost * input.totalPieces
        : cost * sheets;

  const cuttingTotal = processCost(input.cutMode, input.cutCost);
  const creasingTotal = processCost(input.creaseMode, input.creaseCost);
  const laminationTotal = input.lamination
    ? input.lamMode === "overall"
      ? input.lamCost
      : input.lamCost * sheets
    : 0;

  return {
    sheets,
    printingCost: round2(printingCost),
    cuttingTotal: round2(cuttingTotal),
    creasingTotal: round2(creasingTotal),
    laminationTotal: round2(laminationTotal),
    grandTotal: round2(printingCost + cuttingTotal + creasingTotal + laminationTotal),
  };
}

/** Validation messages; empty array = ready to save. */
export function validateJob(input: JobInput): string[] {
  const errors: string[] = [];
  if (!Number.isFinite(input.piecesPerSheet) || input.piecesPerSheet < 1)
    errors.push("Pieces in one sheet must be at least 1.");
  if (!Number.isFinite(input.totalPieces) || input.totalPieces < 1)
    errors.push("Total pieces wanted must be at least 1.");
  if (!Number.isFinite(input.sheetCostSingle))
    errors.push("Enter the cost per sheet (single side).");
  if (input.sides === "double" && !Number.isFinite(input.sheetCostDouble))
    errors.push("Enter the double-side cost per sheet.");
  if (!Number.isFinite(input.cutCost)) errors.push("Enter the cutting cost (use 0 if free).");
  if (!Number.isFinite(input.creaseCost)) errors.push("Enter the creasing cost (use 0 if free).");
  if (input.lamination && !Number.isFinite(input.lamCost))
    errors.push("Enter the lamination cost.");
  return errors;
}
