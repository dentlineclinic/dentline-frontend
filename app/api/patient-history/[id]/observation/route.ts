import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;
  try {
    const body = await req.json();
    const { observation } = body;
    if (!observation || typeof observation !== "string") {
      return NextResponse.json({ success: false, message: "observation is required" }, { status: 400 });
    }
    return NextResponse.json({
      success: true,
      message: "Observation updated",
      data: {
        id,
        observation,
        status: "IN_PROGRESS",
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to update observation", error: String(error) },
      { status: 500 }
    );
  }
}
