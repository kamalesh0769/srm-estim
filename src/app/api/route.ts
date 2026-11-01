import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    app: "SRM Art Prints · Printing Cost Estimator",
    timestamp: new Date().toISOString(),
  });
}
