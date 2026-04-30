import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    if (!file) {
      return NextResponse.json({ success: false, message: "file is required" }, { status: 400 });
    }
    // In production: upload to Cloudinary/S3 and return real URL
    const mockUrl = `https://cloudinary.url/image_${Date.now()}.jpg`;
    return NextResponse.json({
      success: true,
      message: "Image uploaded",
      data: {
        id,
        imageUrls: [mockUrl],
        status: "IN_PROGRESS",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to upload image", error: String(error) },
      { status: 500 }
    );
  }
}
