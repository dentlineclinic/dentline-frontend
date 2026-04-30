import { NextResponse } from "next/server";
import { getPatientHistories, getPatients } from "@/app/api/routes";

export async function GET(
  req: Request,
  props: { params: Promise<{ patientId: string }> }
) {
  const { patientId } = await props.params;
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "0", 10);
  const size = parseInt(searchParams.get("size") ?? "10", 10);

  try {
    // Validate patient exists
    const patients = await getPatients();
    const patient = patients.find(p => p.id === patientId);
    if (!patient) {
      return NextResponse.json(
        { success: false, message: "Patient not found" },
        { status: 404 }
      );
    }

    // Get all histories for this patient
    const allHistories = await getPatientHistories();
    const patientHistories = allHistories.filter(h => h.patientId === patientId);

    // Paginate
    const totalElements = patientHistories.length;
    const totalPages = Math.ceil(totalElements / size) || 1;
    const start = page * size;
    const content = patientHistories.slice(start, start + size).map(h => ({
      id: h.id,
      patientId: h.patientId,
      patientName: h.patientName,
      doctorId: h.doctorId,
      doctorName: h.doctorName,
      appointmentId: h.appointmentId,
      appointmentDate: h.date,
      amount: h.amount,
      paymentStatus: h.paymentStatus,
      status: h.status,
      observation: h.observation,
      createdAt: h.createdAt,
    }));

    return NextResponse.json({
      success: true,
      message: "Histories retrieved",
      data: {
        content,
        totalElements,
        totalPages,
        size,
        number: page,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch patient histories", error: String(error) },
      { status: 500 }
    );
  }
}
