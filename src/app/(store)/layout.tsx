import type { ReactNode } from "react";
import type { CSSProperties } from "react";
import { draftMode } from "next/headers";
import Link from "next/link";
import { stopWebsitePreviewAction } from "@/lib/actions/website";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { WhatsAppButton } from "@/components/layout/whatsapp-button";
import { getCurrentUser } from "@/lib/auth/session";
import { getCategories } from "@/lib/data/categories";
import { getSiteContent } from "@/lib/data/settings";

export default async function StoreLayout({ children }: { children: ReactNode }) {
  const [user, categories, content] = await Promise.all([getCurrentUser(), getCategories(), getSiteContent()]);
  const preview = (await draftMode()).isEnabled && user?.role === "admin";

  return (
    <div className="jis-store min-h-dvh" style={{ "--color-ink": content.website.brand.primaryColor, "--color-rosewood": content.website.brand.accentColor, "--color-rosewood-dark": content.website.brand.accentColor } as CSSProperties}>
      {preview && <div className="flex flex-wrap items-center justify-between gap-3 bg-amber-100 px-5 py-3 text-sm text-amber-950"><p><strong>Draft preview</strong> · Customers see the published website. Shopping uses published delivery and payment settings.</p><div className="flex items-center gap-4"><Link href="/admin/content" className="underline">Back to editor</Link><form action={stopWebsitePreviewAction}><button type="submit" className="min-h-10 underline">Exit preview</button></form></div></div>}
      <AnnouncementBar content={content.announcement} />
      <Header user={user} categories={categories} website={content.website} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer categories={categories} content={content.business} website={content.website} />
      <WhatsAppButton brand={content.website.brand} />
    </div>
  );
}
