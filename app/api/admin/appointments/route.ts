import { NextResponse } from "next/server";
import { getAppointments } from "@/app/api/routes";

export async function GET() {
  try {
    const data = await getAppointments();
    return NextResponse.json({ success: true, message: "Appointments retrieved", data });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch appointments", error: String(error) },
      { status: 500 }
    );
  }
}
