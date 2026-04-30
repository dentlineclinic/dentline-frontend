import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { patientId, pointsToRemove, reason = "" } = body;

    if (!patientId) {
      return NextResponse.json({ success: false, message: "patientId is required" }, { status: 400 });
    }
    if (!pointsToRemove || typeof pointsToRemove !== "number" || pointsToRemove <= 0) {
      return NextResponse.json({ success: false, message: "pointsToRemove must be a positive integer" }, { status: 400 });
    }

    // In production: validate JWT, check ADMIN role, ensure balance >= pointsToRemove, update DB
    return NextResponse.json({
      success: true,
      message: "Reference points removed successfully",
      data: { patientId, pointsRemoved: pointsToRemove, reason },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to remove reference points", error: String(error) },
      { status: 500 }
    );
  }
}
