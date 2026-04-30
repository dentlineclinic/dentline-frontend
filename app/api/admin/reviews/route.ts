import { NextResponse } from "next/server";
import { getReviews } from "@/app/api/routes";

export async function GET() {
  try {
    const data = await getReviews();
    return NextResponse.json({ success: true, message: "Reviews retrieved", data });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch reviews", error: String(error) },
      { status: 500 }
    );
  }
}
