import { NextResponse } from "next/server";
import { getAppointments } from "@/app/api/routes";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { appointmentId, amount } = body;

    if (!appointmentId) {
      return NextResponse.json(
        { success: false, message: "appointmentId is required" },
        { status: 400 }
      );
    }
    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { success: false, message: "amount must be a positive number" },
        { status: 400 }
      );
    }

    // Look up the appointment to derive patient/doctor info
    const appointments = await getAppointments();
    const appt = appointments.find(a => a.rawId === appointmentId);

    if (!appt) {
      return NextResponse.json(
        { success: false, message: "Appointment not found" },
        { status: 404 }
      );
    }

    const now = new Date().toISOString();
    const newId = `hist-${Date.now()}`;

    return NextResponse.json(
      {
        success: true,
        message: "Patient history created",
        data: {
          id: newId,
          patientId: appt.patientId,
          patientName: appt.patientName,
          doctorId: appt.doctorId,
          doctorName: appt.doctorName,
          appointmentId,
          amount,
          paymentStatus: "PENDING",
          status: "IN_PROGRESS",
          observation: null,
          imageUrls: [],
          videoUrls: [],
          createdAt: now,
          updatedAt: now,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to create patient history", error: String(error) },
      { status: 500 }
    );
  }
}
