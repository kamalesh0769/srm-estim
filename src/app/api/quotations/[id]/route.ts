import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { computeJob, validateJob, type JobInput, type LamMode, type ProcessMode, type Sides } from "@/lib/calc";

type Params = { params: Promise<{ id: string }> };

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

// GET /api/quotations/[id]
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const quotation = await db.quotation.findUnique({ where: { id } });
  if (!quotation) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(quotation);
}

// PUT /api/quotations/[id] — edit a quotation (totals recomputed server-side)
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const existing = await db.quotation.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

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

    const quotation = await db.quotation.update({
      where: { id },
      data: {
        customerName: String(body.customerName ?? "").trim(),
        customerPhone: String(body.customerPhone ?? "").trim(),
        productName: String(body.productName ?? "").trim(),
        orderDetails: String(body.orderDetails ?? "").trim(),
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

    return NextResponse.json(quotation);
  } catch (e) {
    console.error("PUT /api/quotations/[id] failed:", e);
    return NextResponse.json({ error: "Could not update the quotation." }, { status: 500 });
  }
}

// DELETE /api/quotations/[id]
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await db.quotation.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/quotations/[id] failed:", e);
    return NextResponse.json({ error: "Could not delete the quotation." }, { status: 500 });
  }
}
