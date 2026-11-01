import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/rates — list saved rate presets, newest first
export async function GET() {
  const rates = await db.savedRate.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(rates);
}

// POST /api/rates — save a set of frequently used rates
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const name = String(body.name ?? "").trim();
    if (!name) {
      return NextResponse.json({ error: "Give this rate preset a name." }, { status: 400 });
    }
    const piecesPerSheet = Number(body.piecesPerSheet);
    if (!Number.isFinite(piecesPerSheet) || piecesPerSheet < 1) {
      return NextResponse.json({ error: "Pieces per sheet must be at least 1." }, { status: 400 });
    }

    const rate = await db.savedRate.create({
      data: {
        name,
        piecesPerSheet,
        sides: body.sides === "double" ? "double" : "single",
        sheetCostSingle: Number(body.sheetCostSingle ?? 0),
        sheetCostDouble: Number(body.sheetCostDouble ?? 0),
        cutMode: String(body.cutMode ?? "overall"),
        cutCost: Number(body.cutCost ?? 0),
        creaseMode: String(body.creaseMode ?? "overall"),
        creaseCost: Number(body.creaseCost ?? 0),
        lamination: Boolean(body.lamination),
        lamMode: String(body.lamMode ?? "per_sheet"),
        lamCost: Number(body.lamCost ?? 0),
      },
    });

    return NextResponse.json(rate, { status: 201 });
  } catch (e) {
    console.error("POST /api/rates failed:", e);
    return NextResponse.json({ error: "Could not save the rate preset." }, { status: 500 });
  }
}
