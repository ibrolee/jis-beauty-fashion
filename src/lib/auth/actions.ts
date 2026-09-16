"use server";

import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt, isNull } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { passwordResetTokens, users } from "@/db/schema";
import { isEmailConfigured, passwordResetEmail, sendEmail } from "@/lib/email";
import { absoluteUrl } from "@/lib/utils";
import { fieldErrorsFrom, forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema } from "@/lib/validation";
import type { ActionState } from "@/types";
import { hashPassword, verifyPassword } from "./password";
import { createSession, destroySession, revokeUserSessions } from "./session";

function safeNext(value: FormDataEntryValue | null, fallback = "/account"): string {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") ? next : fallback;
}

export async function registerAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Please fix the highlighted fields.", fieldErrors: fieldErrorsFrom(parsed.error) };

  const { email, password, firstName, lastName, phone } = parsed.data;
  const existing = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (existing) return { error: "An account with this email already exists. Try logging in instead." };

  const [user] = await db
    .insert(users)
    .values({ email, passwordHash: await hashPassword(password), firstName, lastName, phone: phone || null })
    .returning({ id: users.id });

  await createSession(user.id);
  redirect(safeNext(formData.get("next")));
}

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Enter your email and password.", fieldErrors: fieldErrorsFrom(parsed.error) };

  const user = await db.query.users.findFirst({ where: eq(users.email, parsed.data.email) });
  const valid = user ? await verifyPassword(parsed.data.password, user.passwordHash) : false;
  if (!user || !valid) return { error: "Incorrect email or password." };

  await createSession(user.id);
  redirect(safeNext(formData.get("next"), user.role === "admin" ? "/admin" : "/account"));
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/");
}

export async function forgotPasswordAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = forgotPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Enter a valid email address.", fieldErrors: fieldErrorsFrom(parsed.error) };

  const user = await db.query.users.findFirst({ where: eq(users.email, parsed.data.email) });
  const genericMessage = "If an account exists for that email, we've sent a password reset link. Check your inbox (and spam folder).";

  if (!user) return { ok: true, message: genericMessage };

  const token = randomBytes(32).toString("hex");
  await db.insert(passwordResetTokens).values({
    userId: user.id,
    tokenHash: createHash("sha256").update(token).digest("hex"),
    expiresAt: new Date(Date.now() + 60 * 60 * 1000),
  });

  const resetUrl = absoluteUrl(`/reset-password?token=${token}`);
  await sendEmail({ to: user.email, ...passwordResetEmail(resetUrl, user.firstName) });

  // DEV CONVENIENCE: until an email provider is configured (RESEND_API_KEY),
  // surface the link in the UI so password reset can be tested end-to-end.
  // Once email is configured this branch is skipped automatically.
  if (!isEmailConfigured()) {
    return {
      ok: true,
      message: "Email delivery isn't configured yet, so here is your reset link for testing:",
      data: { resetUrl },
    };
  }

  return { ok: true, message: genericMessage };
}

export async function resetPasswordAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = resetPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Please fix the highlighted fields.", fieldErrors: fieldErrorsFrom(parsed.error) };

  const tokenHash = createHash("sha256").update(parsed.data.token).digest("hex");
  const record = await db.query.passwordResetTokens.findFirst({
    where: and(eq(passwordResetTokens.tokenHash, tokenHash), isNull(passwordResetTokens.usedAt), gt(passwordResetTokens.expiresAt, new Date())),
  });
  if (!record) return { error: "This reset link is invalid or has expired. Please request a new one." };

  await db.transaction(async (tx) => {
    await tx.update(users).set({ passwordHash: await hashPassword(parsed.data.password), updatedAt: new Date() }).where(eq(users.id, record.userId));
    await tx.update(passwordResetTokens).set({ usedAt: new Date() }).where(eq(passwordResetTokens.id, record.id));
  });
  await revokeUserSessions(record.userId);

  redirect("/login?reset=success");
}
