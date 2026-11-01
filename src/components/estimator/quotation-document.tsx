"use client";

import { Printer, Globe, Phone } from "lucide-react";
import { inr, num, formatDate, quoteNumber, waPhone } from "@/lib/format";
import {
  processModeLabel,
  lamModeLabel,
  type LamMode,
  type ProcessMode,
  type Sides,
} from "@/lib/calc";

export interface QuotationDoc {
  quoteNo: number | null; // null = draft (not saved yet)
  date: Date;
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
}

/** Build the WhatsApp message for sharing an estimate. */
export function buildWhatsAppText(q: QuotationDoc): string {
  const lines: string[] = [
    "*SRM ART PRINTS*",
    q.quoteNo ? `Estimate No: ${quoteNumber(q.quoteNo)}` : "Estimate",
    `Date: ${formatDate(q.date)}`,
  ];
  if (q.customerName) lines.push(`Customer: ${q.customerName}`);
  if (q.productName) lines.push(`Job: ${q.productName}`);
  lines.push(
    `Quantity: ${num(q.totalPieces)} pcs | Sheets: ${num(q.sheets)} (${num(q.piecesPerSheet)} pcs/sheet)`,
    `Printing: ${q.sides === "double" ? "Double side" : "Single side"}`
  );
  lines.push("------------------------------");
  lines.push(`Printing: ${inr(q.printingCost)}`);
  lines.push(`Cutting: ${inr(q.cuttingTotal)}`);
  lines.push(`Creasing: ${inr(q.creasingTotal)}`);
  if (q.lamination) lines.push(`Lamination: ${inr(q.laminationTotal)}`);
  lines.push("------------------------------");
  lines.push(`*Total Estimate: ${inr(q.grandTotal)}*`);
  lines.push("");
  lines.push("Thank you for your business!");
  lines.push("SRM ART PRINTS | +91 98417 09111 | srmartprints.in");
  return lines.join("\n");
}

export function whatsappUrl(q: QuotationDoc): string {
  const phone = waPhone(q.customerPhone);
  const text = encodeURIComponent(buildWhatsAppText(q));
  return phone ? `https://wa.me/${phone}?text=${text}` : `https://wa.me/?text=${text}`;
}

function LineItem({
  sno,
  title,
  detail,
  amount,
}: {
  sno: number;
  title: string;
  detail: string;
  amount: number;
}) {
  return (
    <tr className="border-b border-neutral-200">
      <td className="py-2.5 pr-2 align-top text-neutral-500">{sno}.</td>
      <td className="py-2.5 pr-2 align-top">
        <p className="font-semibold text-neutral-800">{title}</p>
        <p className="text-xs leading-relaxed text-neutral-500">{detail}</p>
      </td>
      <td className="py-2.5 text-right align-top font-medium whitespace-nowrap text-neutral-800">
        {inr(amount)}
      </td>
    </tr>
  );
}

export function QuotationDocument({
  data,
  printable = true,
}: {
  data: QuotationDoc;
  /** true = this copy carries #print-area (used by the print portal) */
  printable?: boolean;
}) {
  const items: { title: string; detail: string; amount: number }[] = [
    {
      title: `Printing – ${data.sides === "double" ? "Double side" : "Single side"}`,
      detail: `${num(data.sheets)} sheet${data.sheets === 1 ? "" : "s"} × ${inr(
        data.sides === "double" ? data.sheetCostDouble : data.sheetCostSingle
      )} per sheet`,
      amount: data.printingCost,
    },
    {
      title: "Cutting",
      detail:
        data.cutCost > 0
          ? `${processModeLabel(data.cutMode)} @ ${inr(data.cutCost)}${
              data.cutMode === "overall" ? "" : ` × ${num(data.cutMode === "per_piece" ? data.totalPieces : data.sheets)}`
            }`
          : "—",
      amount: data.cuttingTotal,
    },
    {
      title: "Creasing",
      detail:
        data.creaseCost > 0
          ? `${processModeLabel(data.creaseMode)} @ ${inr(data.creaseCost)}${
              data.creaseMode === "overall" ? "" : ` × ${num(data.creaseMode === "per_piece" ? data.totalPieces : data.sheets)}`
            }`
          : "—",
      amount: data.creasingTotal,
    },
  ];
  if (data.lamination) {
    items.push({
      title: "Lamination",
      detail: `${lamModeLabel(data.lamMode)} @ ${inr(data.lamCost)}${
        data.lamMode === "overall" ? "" : ` × ${num(data.sheets)}`
      }`,
      amount: data.laminationTotal,
    });
  }

  return (
    <div
      id={printable ? "print-area" : undefined}
      className="mx-auto w-full max-w-[720px] bg-white px-7 py-7 text-[13px] text-neutral-900 sm:px-9 sm:py-9"
    >
      {/* Letterhead */}
      <div className="flex items-start justify-between gap-4 border-b-2 border-red-700 pb-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-red-700">
            SRM ART PRINTS
          </h1>
          <p className="mt-0.5 text-xs italic text-neutral-500">
            Premium Printing That Elevates Your Brand
          </p>
        </div>
        <div className="text-right text-xs text-neutral-600">
          <p className="flex items-center justify-end gap-1">
            <Phone className="h-3 w-3" /> +91 98417 09111
          </p>
          <p className="mt-1 flex items-center justify-end gap-1">
            <Globe className="h-3 w-3" /> srmartprints.in
          </p>
        </div>
      </div>

      {/* Title row */}
      <div className="mt-4 flex items-end justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-wide text-neutral-800 uppercase">
            Estimate / Quotation
          </h2>
          <p className="mt-0.5 text-xs text-neutral-500">
            {data.quoteNo ? `Estimate No: ${quoteNumber(data.quoteNo)}` : "Draft estimate (not saved)"}
          </p>
        </div>
        <p className="text-xs text-neutral-600">
          <span className="font-semibold">Date:</span> {formatDate(data.date)}
        </p>
      </div>

      {/* Customer block */}
      <div className="mt-4 rounded-md bg-neutral-50 p-3.5 text-xs">
        <div className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
          <p>
            <span className="font-semibold text-neutral-600">Customer:</span>{" "}
            {data.customerName || "—"}
          </p>
          <p>
            <span className="font-semibold text-neutral-600">Phone:</span>{" "}
            {data.customerPhone || "—"}
          </p>
          <p>
            <span className="font-semibold text-neutral-600">Job:</span>{" "}
            {data.productName || "—"}
          </p>
          <p>
            <span className="font-semibold text-neutral-600">Quantity:</span>{" "}
            {num(data.totalPieces)} pieces
          </p>
        </div>
        {data.orderDetails && (
          <p className="mt-1.5">
            <span className="font-semibold text-neutral-600">Details:</span>{" "}
            {data.orderDetails}
          </p>
        )}
      </div>

      {/* Line items */}
      <table className="mt-4 w-full border-collapse">
        <thead>
          <tr className="border-b border-neutral-300 text-left text-[11px] tracking-wider text-neutral-500 uppercase">
            <th className="w-8 pb-2 font-semibold">#</th>
            <th className="pb-2 font-semibold">Description</th>
            <th className="pb-2 text-right font-semibold">Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <LineItem key={item.title} sno={i + 1} {...item} />
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={2} className="pt-3.5 text-right">
              <span className="text-sm font-bold text-neutral-800">Total Estimate</span>
            </td>
            <td className="pt-3.5 text-right">
              <span className="rounded bg-red-700 px-2.5 py-1 text-sm font-bold text-white whitespace-nowrap">
                {inr(data.grandTotal)}
              </span>
            </td>
          </tr>
        </tfoot>
      </table>

      {/* Job spec box */}
      <div className="mt-5 rounded-md border border-neutral-200 p-3.5 text-xs text-neutral-600">
        <p className="mb-1.5 font-semibold text-neutral-700">Job specification</p>
        <div className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
          <p>Pieces per sheet: {num(data.piecesPerSheet)}</p>
          <p>Sheets required: {num(data.sheets)} (rounded up)</p>
          <p>
            Printing:{" "}
            {data.sides === "double"
              ? `Double side @ ${inr(data.sheetCostDouble)}/sheet`
              : `Single side @ ${inr(data.sheetCostSingle)}/sheet`}
          </p>
          <p>
            Cutting: {processModeLabel(data.cutMode)}
            {data.cutCost > 0 ? ` @ ${inr(data.cutCost)}` : " — no charge"}
          </p>
          <p>
            Creasing: {processModeLabel(data.creaseMode)}
            {data.creaseCost > 0 ? ` @ ${inr(data.creaseCost)}` : " — no charge"}
          </p>
          <p>
            Lamination:{" "}
            {data.lamination
              ? `${lamModeLabel(data.lamMode)} @ ${inr(data.lamCost)}`
              : "Not required"}
          </p>
        </div>
      </div>

      {/* Footer notes */}
      <div className="mt-5 border-t border-neutral-200 pt-3 text-[11px] leading-relaxed text-neutral-500">
        <p>
          Note: This is a cost estimate generated by SRM ART PRINTS. Final invoice may vary based
          on the actual job specification. Rates are applicable for the specifications listed
          above.
        </p>
        <p className="mt-2 text-center font-semibold tracking-wide text-neutral-600">
          Thank you for your business! — SRM ART PRINTS
        </p>
      </div>

      {/* Screen-only hint (hidden when printing) */}
      <p className="mt-4 hidden items-center justify-center gap-1.5 text-[11px] text-neutral-400 print:hidden sm:flex">
        <Printer className="h-3 w-3" />
        Use “Download PDF” to save or print this estimate
      </p>
    </div>
  );
}
