import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard, ResetPasswordForm } from "@/components/auth/auth-forms";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = { title: "Reset password", robots: { index: false } };

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <AuthCard eyebrow="Account recovery" title="Invalid reset link" description="This link is missing its security token. Please request a new password reset.">
        <ButtonLink href="/forgot-password">Request a new link</ButtonLink>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      eyebrow="Account recovery"
      title="Choose a new password"
      footer={
        <>
          Need help? <Link href="/contact" className="text-ink underline underline-offset-4">Contact us</Link>
        </>
      }
    >
      <ResetPasswordForm token={token} />
    </AuthCard>
  );
}
