import { NextResponse } from "next/server";
import { getPayments } from "@/app/api/routes";

export async function GET() {
  try {
    const data = await getPayments();
    return NextResponse.json({ success: true, message: "Payments retrieved", data });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch payments", error: String(error) },
      { status: 500 }
    );
  }
}
