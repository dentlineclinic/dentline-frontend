import { NextResponse } from "next/server";
import { getPatientHistories } from "@/app/api/routes";

export async function GET() {
  try {
    const data = await getPatientHistories();
    return NextResponse.json({
      success: true,
      message: "Patient histories retrieved",
      data,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch patient histories", error: String(error) },
      { status: 500 }
    );
  }
}
