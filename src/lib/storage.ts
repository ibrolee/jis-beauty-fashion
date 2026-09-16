/**
 * Image storage adapter — INTEGRATION POINT.
 *
 * Product images are currently referenced by URL/path (see the "Image URLs"
 * field in the admin product form). To enable direct uploads from the admin:
 *
 *  1. Pick a provider (Cloudinary, AWS S3, Vercel Blob, UploadThing…).
 *  2. Implement `uploadImage` below using the provider SDK and env vars
 *     (e.g. CLOUDINARY_URL or BLOB_READ_WRITE_TOKEN).
 *  3. Add an API route (e.g. src/app/api/admin/upload/route.ts) that calls
 *     `uploadImage` after `requireAdmin()`, and wire a file input in
 *     src/components/admin/product-form.tsx to POST to it and append the
 *     returned URL to the images textarea.
 */
export type UploadResult = { url: string; width?: number; height?: number };

export function isStorageConfigured(): boolean {
  return false;
}

export async function uploadImage(_file: File | Blob, _options?: { folder?: string }): Promise<UploadResult> {
  throw new Error("Image storage is not configured. See src/lib/storage.ts for setup instructions.");
}
