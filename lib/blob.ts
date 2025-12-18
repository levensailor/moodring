import { put } from "@vercel/blob";

export async function uploadImage(file: File): Promise<string> {
  const hasToken = !!process.env.BLOB_READ_WRITE_TOKEN;
  if (!hasToken) {
    const err = new Error("BLOB_READ_WRITE_TOKEN is not set");
    (err as any).code = "BLOB_TOKEN_MISSING";
    throw err;
  }

  const safeName =
    file.name && file.name.trim().length > 0
      ? file.name
      : `paste-${Date.now()}.png`;

  try {
    const blob = await put(safeName, file, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return blob.url;
  } catch (err: any) {
    // Do not log secrets. Provide enough to debug in Vercel logs.
    console.error("[moodring][blob] upload failed", {
      code: err?.code,
      name: err?.name,
      message: err?.message,
    });
    const e = new Error("BLOB_UPLOAD_FAILED");
    (e as any).code = "BLOB_UPLOAD_FAILED";
    throw e;
  }
}

