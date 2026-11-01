import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { computeJob, validateJob, type JobInput, type LamMode, type ProcessMode, type Sides } from "@/lib/calc";

function parseJobInput(body: Record<string, unknown>): JobInput {
  return {
    piecesPerSheet: Number(body.piecesPerSheet),
    totalPieces: Number(body.totalPieces),
    sides: (body.sides === "double" ? "double" : "single") as Sides,
    sheetCostSingle: Number(body.sheetCostSingle),
    sheetCostDouble: Number(body.sheetCostDouble ?? 0),
    cutMode: (body.cutMode ?? "overall") as ProcessMode,
    cutCost: Number(body.cutCost ?? 0),
    creaseMode: (body.creaseMode ?? "overall") as ProcessMode,
    creaseCost: Number(body.creaseCost ?? 0),
    lamination: Boolean(body.lamination),
    lamMode: (body.lamMode ?? "per_sheet") as LamMode,
    lamCost: Number(body.lamCost ?? 0),
  };
}

function customerFields(body: Record<string, unknown>) {
  return {
    customerName: String(body.customerName ?? "").trim(),
    customerPhone: String(body.customerPhone ?? "").trim(),
    productName: String(body.productName ?? "").trim(),
    orderDetails: String(body.orderDetails ?? "").trim(),
  };
}

// GET /api/quotations — list all quotations, newest first
export async function GET() {
  const quotations = await db.quotation.findMany({
    orderBy: { quoteNo: "desc" },
  });
  return NextResponse.json(quotations);
}

// POST /api/quotations — create a quotation (totals are computed server-side)
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const input = parseJobInput(body);
    const errors = validateJob(input);
    if (errors.length > 0) {
      return NextResponse.json({ error: errors.join(" ") }, { status: 400 });
    }

    const result = computeJob(input);
    if (result.sheets <= 0) {
      return NextResponse.json({ error: "Invalid quantity — cannot compute sheets." }, { status: 400 });
    }

    // Generate the next sequential quote number (single-user internal tool)
    const last = await db.quotation.findFirst({ orderBy: { quoteNo: "desc" } });
    const quoteNo = (last?.quoteNo ?? 0) + 1;

    const quotation = await db.quotation.create({
      data: {
        quoteNo,
        ...customerFields(body),
        piecesPerSheet: input.piecesPerSheet,
        totalPieces: input.totalPieces,
        sides: input.sides,
        sheetCostSingle: input.sheetCostSingle,
        sheetCostDouble: input.sheetCostDouble,
        cutMode: input.cutMode,
        cutCost: input.cutCost,
        creaseMode: input.creaseMode,
        creaseCost: input.creaseCost,
        lamination: input.lamination,
        lamMode: input.lamMode,
        lamCost: input.lamCost,
        sheets: result.sheets,
        printingCost: result.printingCost,
        cuttingTotal: result.cuttingTotal,
        creasingTotal: result.creasingTotal,
        laminationTotal: result.laminationTotal,
        grandTotal: result.grandTotal,
      },
    });

    return NextResponse.json(quotation, { status: 201 });
  } catch (e) {
    console.error("POST /api/quotations failed:", e);
    return NextResponse.json({ error: "Could not save the quotation." }, { status: 500 });
  }
}
