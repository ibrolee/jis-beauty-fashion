import { randomUUID } from "node:crypto";
import {
  issueSignedToken,
  presignUrl,
} from "@vercel/blob";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";

const ALLOWED_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    // Supabase Storage is an alternative to Vercel Blob. The service role key
    // never leaves this protected server route; the browser only receives public URLs.
    if (request.headers.get("content-type")?.includes("multipart/form-data")) {
      const url = process.env.SUPABASE_URL;
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      const bucket = process.env.SUPABASE_STORAGE_BUCKET ?? "product-images";
      if (!url || !serviceKey || !/^[a-z0-9][a-z0-9_-]{1,62}$/i.test(bucket)) {
        return NextResponse.json({ error: "Supabase Storage is not configured correctly." }, { status: 503 });
      }
      const data = await request.formData();
      const file = data.get("file");
      if (!(file instanceof File) || !ALLOWED_CONTENT_TYPES.includes(file.type) || file.size <= 0 || file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: "Choose a JPG, PNG or WebP image under 10MB." }, { status: 400 });
      }
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      const jpeg = bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
      const png = bytes.length > 8 && [137,80,78,71,13,10,26,10].every((v,i) => bytes[i] === v);
      const webp = bytes.length > 12 && String.fromCharCode(...bytes.slice(0,4)) === "RIFF" && String.fromCharCode(...bytes.slice(8,12)) === "WEBP";
      if (!((file.type === "image/jpeg" && jpeg) || (file.type === "image/png" && png) || (file.type === "image/webp" && webp))) {
        return NextResponse.json({ error: "The file does not match its image type." }, { status: 400 });
      }
      const extension = file.type === "image/jpeg" ? "jpg" : file.type === "image/png" ? "png" : "webp";
      const pathname = `products/${randomUUID()}.${extension}`;
      const origin = new URL(url).origin;
      const path = `${encodeURIComponent(bucket)}/${pathname}`;
      const uploaded = await fetch(`${origin}/storage/v1/object/${path}`, {
        method: "POST",
        headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, "Content-Type": file.type, "x-upsert": "false" },
        body: buffer,
      });
      if (!uploaded.ok) {
        console.error("Supabase Storage upload failed", uploaded.status, await uploaded.text());
        return NextResponse.json({ error: "Image upload failed. Check that the public product-images bucket exists." }, { status: 502 });
      }
      return NextResponse.json({ url: `${origin}/storage/v1/object/public/${path}` });
    }

    const body = await request.json();

    const pathname = body?.pathname;
    const contentType = body?.contentType;
    const size = body?.size;

    if (
      typeof pathname !== "string" ||
      !pathname.startsWith("products/")
    ) {
      return NextResponse.json(
        { error: "Invalid upload path." },
        { status: 400 },
      );
    }

    if (
      typeof contentType !== "string" ||
      !ALLOWED_CONTENT_TYPES.includes(contentType)
    ) {
      return NextResponse.json(
        { error: "Only JPG, PNG and WebP images are allowed." },
        { status: 400 },
      );
    }

    if (
      typeof size !== "number" ||
      size <= 0 ||
      size > MAX_FILE_SIZE
    ) {
      return NextResponse.json(
        { error: "Image must be between 1 byte and 10MB." },
        { status: 400 },
      );
    }

    const storeId = process.env.Images_STORE_ID;

    if (!storeId) {
      if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return NextResponse.json({ uploadMode: "supabase" });
      }
      return NextResponse.json({ error: "Configure Supabase Storage or Vercel Blob before uploading photos." }, { status: 503 });
    }

    const validUntil = Date.now() + 15 * 60 * 1000;

    const signedToken = await issueSignedToken({
      storeId,
      pathname,
      operations: ["put"],
      validUntil,
      allowedContentTypes: ALLOWED_CONTENT_TYPES,
      maximumSizeInBytes: MAX_FILE_SIZE,
    });

    const { presignedUrl } = await presignUrl(
      signedToken,
      {
        pathname,
        operation: "put",
        validUntil,
        allowedContentTypes: [contentType],
        maximumSizeInBytes: MAX_FILE_SIZE,
        access: "public",
      },
    );

    return NextResponse.json({
      uploadUrl: presignedUrl,
      pathname,
      storeId,
      expiresAt: validUntil,
    });
  } catch (error) {
    console.error(
      "JIS product image upload URL error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not create upload URL.",
      },
      { status: 500 },
    );
  }
}