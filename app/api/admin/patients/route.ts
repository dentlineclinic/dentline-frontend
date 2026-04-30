import { NextResponse } from "next/server";
import { getPatients } from "@/app/api/routes";

export async function GET() {
  try {
    const data = await getPatients();
    return NextResponse.json({ success: true, message: "Patients retrieved", data });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch patients", error: String(error) },
      { status: 500 }
    );
  }
}
