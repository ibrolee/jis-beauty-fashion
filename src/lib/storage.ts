/**
 * Images are uploaded through /api/admin/upload (an admin-only endpoint).
 * It supports Supabase Storage when SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 * are configured, or existing Vercel Blob when Images_STORE_ID is configured.
 * The product form stores resulting public URLs in products.images and
 * product_variants.images. Never expose SUPABASE_SERVICE_ROLE_KEY in the browser.
 */
export type UploadResult = { url: string; width?: number; height?: number };

export function isStorageConfigured(): boolean {
  return Boolean(process.env.Images_STORE_ID || (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY));
}
