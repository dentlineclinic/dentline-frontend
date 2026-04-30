import { NextResponse } from "next/server";
import { getPatients } from "@/app/api/routes";

export async function GET(
  _req: Request,
  props: { params: Promise<{ patientId: string }> }
) {
  const { patientId } = await props.params;
  try {
    const patients = await getPatients();
    const patient = patients.find(p => p.id === patientId);
    if (!patient) {
      return NextResponse.json({ success: false, message: "Patient not found" }, { status: 404 });
    }
    return NextResponse.json({
      success: true,
      message: "Reference points retrieved",
      data: { patientId: patient.id, referencePoints: patient.referencePoints },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch reference points", error: String(error) },
      { status: 500 }
    );
  }
}
