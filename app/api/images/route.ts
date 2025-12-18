import { NextRequest, NextResponse } from "next/server";
import { uploadImage } from "@/lib/blob";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 10MB" },
        { status: 400 }
      );
    }

    // #region agent log
    console.info("[moodring][api/images] upload request", {
      hasBlobToken: !!process.env.BLOB_READ_WRITE_TOKEN,
      fileType: file.type,
      fileSize: file.size,
      fileName: file.name || "",
    });
    // #endregion

    const url = await uploadImage(file);

    return NextResponse.json({ url });
  } catch (error) {
    const code = (error as any)?.code;
    const message = (error as any)?.message;
    console.error("[moodring][api/images] Error uploading image", {
      code,
      message,
      name: (error as any)?.name,
    });

    if (code === "BLOB_TOKEN_MISSING") {
      return NextResponse.json(
        { error: "Blob storage is not configured (missing BLOB_READ_WRITE_TOKEN)" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}

