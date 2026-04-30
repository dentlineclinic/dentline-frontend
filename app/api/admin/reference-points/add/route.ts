import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    // Support both query params (GET-style) and JSON body
    let patientId = searchParams.get("patientId");
    let points = searchParams.get("points");
    let reason = searchParams.get("reason") ?? "";

    if (!patientId || !points) {
      const body = await req.json().catch(() => ({}));
      patientId = patientId ?? body.patientId;
      points = points ?? String(body.pointsToAdd ?? body.points ?? "");
      reason = reason || body.reason || "";
    }

    if (!patientId) {
      return NextResponse.json({ success: false, message: "patientId is required" }, { status: 400 });
    }
    const pointsNum = parseInt(points ?? "0", 10);
    if (!pointsNum || pointsNum <= 0) {
      return NextResponse.json({ success: false, message: "points must be a positive integer" }, { status: 400 });
    }

    // In production: validate JWT, check ADMIN role, update DB
    return NextResponse.json({
      success: true,
      message: "Reference points added successfully",
      data: { patientId, pointsAdded: pointsNum, reason },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to add reference points", error: String(error) },
      { status: 500 }
    );
  }
}
