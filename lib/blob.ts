import { put } from "@vercel/blob";

export async function uploadImage(file: File): Promise<string> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("BLOB_READ_WRITE_TOKEN is not set");
  }

  const safeName =
    file.name && file.name.trim().length > 0
      ? file.name
      : `paste-${Date.now()}.png`;

  const blob = await put(safeName, file, {
    access: "public",
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });

  return blob.url;
}

