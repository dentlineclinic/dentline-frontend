import { NextResponse } from "next/server";

export async function PATCH(
  _req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;
  if (!id) {
    return NextResponse.json({ success: false, message: "Doctor ID is required" }, { status: 400 });
  }
  return NextResponse.json({ success: true, message: "Doctor activated successfully" });
}
