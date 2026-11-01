import type { LamMode, ProcessMode, Sides } from "@/lib/calc";

/** Quotation as returned by the API (JSON — dates are strings). */
export interface Quotation {
  id: string;
  quoteNo: number;
  customerName: string;
  customerPhone: string;
  productName: string;
  orderDetails: string;
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
  sheets: number;
  printingCost: number;
  cuttingTotal: number;
  creasingTotal: number;
  laminationTotal: number;
  grandTotal: number;
  createdAt: string;
  updatedAt: string;
}

/** Saved rate preset as returned by the API. */
export interface SavedRate {
  id: string;
  name: string;
  piecesPerSheet: number;
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
  createdAt: string;
}

/** Form state keeps numbers as strings for smooth typing. */
export interface FormState {
  customerName: string;
  customerPhone: string;
  productName: string;
  orderDetails: string;
  piecesPerSheet: string;
  totalPieces: string;
  sides: Sides;
  sheetCostSingle: string;
  sheetCostDouble: string;
  cutMode: ProcessMode;
  cutCost: string;
  creaseMode: ProcessMode;
  creaseCost: string;
  lamination: boolean;
  lamMode: LamMode;
  lamCost: string;
}

export const DEFAULT_FORM: FormState = {
  customerName: "",
  customerPhone: "",
  productName: "",
  orderDetails: "",
  piecesPerSheet: "12",
  totalPieces: "1000",
  sides: "single",
  sheetCostSingle: "",
  sheetCostDouble: "",
  cutMode: "overall",
  cutCost: "",
  creaseMode: "overall",
  creaseCost: "",
  lamination: false,
  lamMode: "per_sheet",
  lamCost: "",
};

/** Convert a quotation into form state (for Edit / Duplicate). */
export function quotationToForm(q: Quotation): FormState {
  return {
    customerName: q.customerName,
    customerPhone: q.customerPhone,
    productName: q.productName,
    orderDetails: q.orderDetails,
    piecesPerSheet: String(q.piecesPerSheet),
    totalPieces: String(q.totalPieces),
    sides: q.sides,
    sheetCostSingle: String(q.sheetCostSingle),
    sheetCostDouble: String(q.sheetCostDouble),
    cutMode: q.cutMode,
    cutCost: String(q.cutCost),
    creaseMode: q.creaseMode,
    creaseCost: String(q.creaseCost),
    lamination: q.lamination,
    lamMode: q.lamMode,
    lamCost: String(q.lamCost),
  };
}

export function rateToForm(r: SavedRate): FormState {
  return {
    ...DEFAULT_FORM,
    piecesPerSheet: String(r.piecesPerSheet),
    sides: r.sides,
    sheetCostSingle: String(r.sheetCostSingle),
    sheetCostDouble: String(r.sheetCostDouble),
    cutMode: r.cutMode,
    cutCost: String(r.cutCost),
    creaseMode: r.creaseMode,
    creaseCost: String(r.creaseCost),
    lamination: r.lamination,
    lamMode: r.lamMode,
    lamCost: String(r.lamCost),
  };
}
