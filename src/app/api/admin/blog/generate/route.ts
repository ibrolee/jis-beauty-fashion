import { generateText } from "ai";
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
});

function parseGeneratedJson(text: string) {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("The AI response was not valid JSON.");
  return generatedBlogSchema.parse(JSON.parse(cleaned.slice(start, end + 1)));
}

async function generateArticle(prompt: string) {
  const models = [
    "inclusionai/ling-3.0-flash-sante-free",
    "stealth/pixel-canary",
  ];

  let lastError: unknown = null;

  for (const model of models) {
    try {
      const result = await generateText({
        model,
        prompt,
        maxOutputTokens: 5000,
      });
      return parseGeneratedJson(result.text);
    } catch (error) {
      lastError = error;
      console.warn("JIS blog model failed, trying fallback:", model, error);
    }
  }

  throw lastError instanceof Error ? lastError : new Error("No free AI model was available.");
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
      "Return ONLY valid JSON in exactly this shape:",
      '{"title":"string","category":"one exact category from the available list","excerpt":"1-2 sentence summary under 260 characters","body":"full article as plain text with blank lines"}',
    ].join("\n");

    const generated = await generateArticle(prompt);
    const category = selectedCategory || (categories.includes(generated.category) ? generated.category : categories[0]);
    const image = "/api/blog-cover?title=" + encodeURIComponent(generated.title) + "&category=" + encodeURIComponent(category);

    return NextResponse.json({
      title: generated.title,
      category,
      excerpt: generated.excerpt,
      body: generated.body,
      image,
    });
  } catch (error) {
    console.error("JIS AI blog generation failed:", error);
    return NextResponse.json(
      {
        error: "Could not generate the blog post right now. Please wait a moment and try again.",
      },
      { status: 500 },
    );
  }
}
