import Link from "next/link";
import type { AnnouncementContent } from "@/lib/site-content";

export function AnnouncementBar({ content }: { content: AnnouncementContent }) {
  if (!content.enabled || !content.text) return null;
  return (
    <div className="bg-ink text-white">
      <div className="container-x flex h-9 items-center justify-center">
        <Link href={content.href || "/shop"} className="truncate text-center text-[11px] font-medium uppercase tracking-[0.18em] hover:text-blush">
          {content.text}
        </Link>
      </div>
    </div>
  );
}
