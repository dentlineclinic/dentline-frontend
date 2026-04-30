import { NextResponse } from "next/server";
import { getPatientHistories } from "@/app/api/routes";

export async function GET(
  _req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;
  try {
    const histories = await getPatientHistories();
    const history = histories.find(h => h.id === id);

    if (!history) {
      return NextResponse.json(
        { success: false, message: "History not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "History retrieved",
      data: {
        id: history.id,
        patientId: history.patientId,
        patientName: history.patientName,
        doctorId: history.doctorId,
        doctorName: history.doctorName,
        appointmentId: history.appointmentId,
        appointmentDate: history.date,
        amount: history.amount,
        paymentStatus: history.paymentStatus,
        status: history.status,
        observation: history.observation ?? "",
        imageUrls: [],
        videoUrls: [],
        createdAt: history.createdAt,
        updatedAt: history.createdAt,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch history", error: String(error) },
      { status: 500 }
    );
  }
}
