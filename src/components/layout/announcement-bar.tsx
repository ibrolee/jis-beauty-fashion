import Link from "next/link";
import type { AnnouncementContent } from "@/lib/site-content";

export function AnnouncementBar({ content }: { content: AnnouncementContent }) {
  if (!content.enabled || !content.text) return null;
  return (
    <div className="bg-ink text-white">
      <div className="container-x flex min-h-9 items-center justify-center py-2">
        <Link href={content.href || "/shop"} className="text-center text-[10px] font-medium uppercase leading-relaxed tracking-[0.12em] hover:text-blush sm:text-[11px] sm:tracking-[0.18em]">
          {content.text}
        </Link>
      </div>
    </div>
  );
}
