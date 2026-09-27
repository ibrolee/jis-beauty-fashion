import { randomUUID } from "node:crypto";
import { issueSignedToken, presignUrl } from "@vercel/blob";
import { generateImage, generateText } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { getBlogContent } from "@/lib/data/blog";

export const maxDuration = 60;

const generatedBlogSchema = z.object({
  title: z.string().trim().min(8).max(140),
  category: z.string().trim().min(2).max(80),
  excerpt: z.string().trim().min(40).max(320),
  body: z.string().trim().min(500).max(16000),
  imagePrompt: z.string().trim().min(30).max(1400),
});

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

function parseGeneratedJson(text: string) {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("The AI response was not valid JSON.");
  return generatedBlogSchema.parse(JSON.parse(cleaned.slice(start, end + 1)));
}

function extensionFor(contentType: string) {
  if (contentType === "image/jpeg") return "jpg";
  if (contentType === "image/webp") return "webp";
  if (contentType === "image/png") return "png";
  const candidate = contentType.split("/")[1]?.replace(/[^a-z0-9]/gi, "").toLowerCase();
  return candidate || "png";
}

async function storeGeneratedImage(bytes: Uint8Array, contentType: string) {
  if (!contentType.startsWith("image/")) throw new Error("The generated file was not an image.");
  if (!bytes.byteLength || bytes.byteLength > MAX_IMAGE_SIZE) throw new Error("The generated cover image is too large.");

  const pathname = `blog/${randomUUID()}.${extensionFor(contentType)}`;
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET ?? "product-images";

  if (supabaseUrl && supabaseServiceKey && /^[a-z0-9][a-z0-9_-]{1,62}$/i.test(bucket)) {
    const origin = new URL(supabaseUrl).origin;
    const path = `${encodeURIComponent(bucket)}/${pathname}`;
    const uploaded = await fetch(`${origin}/storage/v1/object/${path}`, {
      method: "POST",
      headers: {
        apikey: supabaseServiceKey,
        Authorization: `Bearer ${supabaseServiceKey}`,
        "Content-Type": contentType,
        "x-upsert": "false",
      },
      body: Buffer.from(bytes),
    });

    if (!uploaded.ok) {
      console.error("Supabase generated blog image upload failed", uploaded.status, await uploaded.text());
      throw new Error("The article was generated, but its cover image could not be stored.");
    }

    return `${origin}/storage/v1/object/public/${path}`;
  }

  const storeId = process.env.Images_STORE_ID;
  if (storeId) {
    const validUntil = Date.now() + 15 * 60 * 1000;
    const signedToken = await issueSignedToken({
      storeId,
      pathname,
      operations: ["put"],
      validUntil,
      allowedContentTypes: [contentType],
      maximumSizeInBytes: MAX_IMAGE_SIZE,
    });

    const { presignedUrl } = await presignUrl(signedToken, {
      pathname,
      operation: "put",
      validUntil,
      allowedContentTypes: [contentType],
      maximumSizeInBytes: MAX_IMAGE_SIZE,
      access: "public",
    });

    const uploaded = await fetch(presignedUrl, {
      method: "PUT",
      headers: { "Content-Type": contentType },
      body: Buffer.from(bytes),
    });

    const result = (await uploaded.json().catch(() => null)) as { url?: string; error?: string } | null;
    if (!uploaded.ok || !result?.url) {
      console.error("Vercel Blob generated blog image upload failed", uploaded.status, result);
      throw new Error("The article was generated, but its cover image could not be stored.");
    }

    return result.url;
  }

  throw new Error("Image storage is not configured for the site.");
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const raw = await request.json().catch(() => ({}));
    const topic = typeof raw?.topic === "string" ? raw.topic.trim().slice(0, 180) : "";
    const requestedCategory = typeof raw?.category === "string" ? raw.category.trim().slice(0, 80) : "";

    const blog = await getBlogContent();
    const categories = blog.categories.length ? blog.categories : ["Fragrance Tips", "Gift Guides", "Beauty Notes"];
    const selectedCategory = requestedCategory && categories.includes(requestedCategory) ? requestedCategory : "";
    const recentTitles = blog.posts.slice(0, 20).map((post) => post.title);

    const prompt = [
      "You are the in-house content editor for JIS Beauty & Fashion, a Nigerian fragrance, perfume-oil and beauty ecommerce brand.",
      "",
      "Create one genuinely useful evergreen blog article for the JIS website.",
      "",
      "Audience:",
      "- shoppers in Nigeria who enjoy fragrance, perfume oils, beauty and thoughtful gifting",
      "- readers should learn something useful, not feel like they are reading an advertisement",
      "",
      "Editorial style:",
      "- premium, warm, modern and practical",
      "- natural English that feels human, not generic AI copy",
      "- useful specifics and examples, but do not invent statistics, medical claims, product availability, prices, discounts or promotions",
      "- avoid exaggerated promises and repetitive words such as luxury",
      "- 700 to 1,050 words",
      "- short readable paragraphs",
      "- plain text body with simple section headings separated by blank lines; no Markdown symbols, HTML or bullet characters",
      "- end naturally; do not add an author bio or a Conclusion heading unless it genuinely fits",
      "",
      "Available categories (choose exactly one):",
      JSON.stringify(categories),
      "",
      "Requested category:",
      selectedCategory ? JSON.stringify(selectedCategory) : "AUTO - choose the best available category",
      "",
      "Requested topic:",
      topic ? JSON.stringify(topic) : "AUTO - choose a fresh, useful topic",
      "",
      "Avoid creating something too similar to these recent titles:",
      JSON.stringify(recentTitles),
      "",
      "Also write a cover-image prompt. The visual must feel like a polished JIS editorial photograph: premium Nigerian beauty/fragrance aesthetic, sophisticated warm neutrals with tasteful colour, realistic materials and lighting, horizontal composition, no readable text, no watermark, no fake brand logo, and no misleading product packaging.",
      "",
      "Return ONLY valid JSON in exactly this shape:",
      '{"title":"string","category":"one exact category from the available list","excerpt":"1-2 sentence summary under 260 characters","body":"full article as plain text with blank lines","imagePrompt":"detailed photographic cover-image prompt"}',
    ].join("\n");

    const textResult = await generateText({
      model: "openai/gpt-6-luna",
      prompt,
    });

    const generated = parseGeneratedJson(textResult.text);
    const category = selectedCategory || (categories.includes(generated.category) ? generated.category : categories[0]);

    const imagePrompt = [
      "Create a premium horizontal editorial cover photograph for the JIS Beauty & Fashion blog.",
      "",
      `Article title: ${generated.title}`,
      `Article summary: ${generated.excerpt}`,
      "",
      "Creative direction:",
      generated.imagePrompt,
      "",
      "Keep it photorealistic, tasteful and publication-ready. Use a 16:9 composition with the main subject safely inside the frame. No words, captions, watermarks or logos.",
    ].join("\n");

    const imageResult = await generateImage({
      model: "recraft/recraft-v4.1-flash",
      prompt: imagePrompt,
      aspectRatio: "16:9",
    });

    const file = imageResult.image as {
      uint8Array: Uint8Array;
      mediaType?: string;
      mimeType?: string;
    };
    const contentType = file.mediaType ?? file.mimeType ?? "image/png";
    const image = await storeGeneratedImage(file.uint8Array, contentType);

    return NextResponse.json({
      title: generated.title,
      category,
      excerpt: generated.excerpt,
      body: generated.body,
      image,
    });
  } catch (error) {
    console.error("JIS AI blog generation failed:", error);
    const message = error instanceof Error ? error.message : "Could not generate the blog post.";
    const configurationError =
      message.includes("not configured") ||
      message.includes("AI_GATEWAY") ||
      message.includes("authentication");

    return NextResponse.json(
      {
        error: configurationError
          ? "AI generation is not configured yet. Enable Vercel AI Gateway for this project and try again."
          : "Could not generate the blog post and cover image. Please try again.",
      },
      { status: configurationError ? 503 : 500 },
    );
  }
}
