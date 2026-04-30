import { NextResponse } from "next/server";
import { getPatientHistories } from "@/app/api/routes";

export async function PATCH(
  _req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;
  try {
    const histories = await getPatientHistories();
    const history = histories.find(h => h.id === id);
    if (!history) {
      return NextResponse.json({ success: false, message: "Patient history not found" }, { status: 404 });
    }
    return NextResponse.json({
      success: true,
      message: "History marked as completed",
      data: {
        id,
        status: "COMPLETED",
        patientName: history.patientName,
        doctorName: history.doctorName,
        amount: history.amount,
        paymentStatus: history.paymentStatus,
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to complete history", error: String(error) },
      { status: 500 }
    );
  }
}
