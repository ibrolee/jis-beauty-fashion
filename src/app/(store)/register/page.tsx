import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthCard, RegisterForm } from "@/components/auth/auth-forms";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Create account", robots: { index: false } };

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const user = await getCurrentUser();
  if (user) redirect("/account");

  return (
    <AuthCard
      eyebrow="Join JIS"
      title="Create your account"
      description="Track orders, save your favourites and check out faster."
      footer={
        <>
          Already have an account? <Link href={`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="text-ink underline underline-offset-4">Log in</Link>
        </>
      }
    >
      <RegisterForm next={next} />
    </AuthCard>
  );
}
