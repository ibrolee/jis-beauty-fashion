import type { Metadata, Viewport } from "next";
import type { CSSProperties, ReactNode } from "react";
import { draftMode } from "next/headers";
import { Providers } from "@/components/providers";
import { getCurrentUser } from "@/lib/auth/session";
import { getSiteContent } from "@/lib/data/settings";
import { publicSiteOrigin } from "@/lib/utils";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getSiteContent();
  const brand = content.website.brand;
  return {
    metadataBase: new URL(publicSiteOrigin()),
    title: { default: `${brand.name} — ${brand.tagline}`, template: `%s | ${brand.name}` },
    description: brand.description,
    applicationName: brand.name,
    openGraph: { type: "website", siteName: brand.name, title: brand.name, description: brand.description, locale: "en_NG", images: brand.shareImage ? [{ url: brand.shareImage, alt: brand.name }] : [] },
    twitter: { card: "summary_large_image", title: brand.name, description: brand.description, images: brand.shareImage ? [brand.shareImage] : [] },
    robots: { index: !(await draftMode()).isEnabled, follow: !(await draftMode()).isEnabled },
  };
}

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

// The storefront is personalised (session, cart, live stock) so it renders dynamically.
export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: ReactNode }) {
  const [user, content] = await Promise.all([getCurrentUser(), getSiteContent()]);

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Loaded in the root layout so it applies to every page (swap for next/font/google if you prefer self-hosting). */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Jost:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-dvh flex flex-col" style={{ "--color-ink": content.website.brand.primaryColor, "--color-rosewood": content.website.brand.accentColor } as CSSProperties}>
        <Providers isAuthenticated={Boolean(user)}>{children}</Providers>
      </body>
    </html>
  );
}
