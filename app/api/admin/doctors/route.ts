import { NextResponse } from "next/server";
import { getDoctors } from "@/app/api/routes";

export async function GET() {
  try {
    const data = await getDoctors();
    return NextResponse.json({ success: true, message: "Doctors retrieved", data });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch doctors", error: String(error) },
      { status: 500 }
    );
  }
}
