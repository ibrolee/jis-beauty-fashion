import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard, ForgotPasswordForm } from "@/components/auth/auth-forms";

export const metadata: Metadata = { title: "Forgot password", robots: { index: false } };

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      eyebrow="Account recovery"
      title="Forgot your password?"
      description="Enter the email you registered with and we'll send you a link to reset it."
      footer={
        <>
          Remembered it? <Link href="/login" className="text-ink underline underline-offset-4">Back to log in</Link>
        </>
      }
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
