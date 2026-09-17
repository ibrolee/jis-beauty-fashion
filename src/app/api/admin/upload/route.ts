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
      throw new Error("Images_STORE_ID is not configured.");
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