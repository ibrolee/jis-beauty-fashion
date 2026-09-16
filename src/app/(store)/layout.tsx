import type { ReactNode } from "react";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { WhatsAppButton } from "@/components/layout/whatsapp-button";
import { getCurrentUser } from "@/lib/auth/session";
import { getCategories } from "@/lib/data/categories";
import { getSiteContent } from "@/lib/data/settings";

export default async function StoreLayout({ children }: { children: ReactNode }) {
  const [user, categories, content] = await Promise.all([getCurrentUser(), getCategories(), getSiteContent()]);

  return (
    <>
      <AnnouncementBar content={content.announcement} />
      <Header user={user} categories={categories} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer categories={categories} />
      <WhatsAppButton />
    </>
  );
}
