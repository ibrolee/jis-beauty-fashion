import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthCard, LoginForm } from "@/components/auth/auth-forms";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Log in", robots: { index: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; reset?: string }> }) {
  const { next, reset } = await searchParams;
  const user = await getCurrentUser();
  if (user) redirect(next && next.startsWith("/") ? next : "/account");

  return (
    <AuthCard
      eyebrow="Welcome back"
      title="Log in"
      description="Access your orders, wishlist and saved addresses."
      footer={
        <>
          New to JIS? <Link href={`/register${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="text-ink underline underline-offset-4">Create an account</Link>
        </>
      }
    >
      <LoginForm next={next} notice={reset === "success" ? "Your password has been updated. Log in with your new password." : undefined} />
    </AuthCard>
  );
}
