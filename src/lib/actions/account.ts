"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { addresses, users } from "@/db/schema";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { requireUser } from "@/lib/auth/session";
import { addressSchema, changePasswordSchema, fieldErrorsFrom, formToObject, profileSchema } from "@/lib/validation";
import type { ActionState } from "@/types";

export async function updateProfileAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser("/account/profile");
  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Please fix the highlighted fields.", fieldErrors: fieldErrorsFrom(parsed.error) };

  await db
    .update(users)
    .set({ ...parsed.data, phone: parsed.data.phone || null, whatsapp: parsed.data.whatsapp || null, updatedAt: new Date() })
    .where(eq(users.id, user.id));
  revalidatePath("/account");
  return { ok: true, message: "Profile updated." };
}

export async function changePasswordAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser("/account/profile");
  const parsed = changePasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Please fix the highlighted fields.", fieldErrors: fieldErrorsFrom(parsed.error) };

  const row = await db.query.users.findFirst({ where: eq(users.id, user.id) });
  if (!row || !(await verifyPassword(parsed.data.currentPassword, row.passwordHash))) {
    return { error: "Your current password is incorrect.", fieldErrors: { currentPassword: "Incorrect password" } };
  }
  await db.update(users).set({ passwordHash: await hashPassword(parsed.data.password), updatedAt: new Date() }).where(eq(users.id, user.id));
  return { ok: true, message: "Password changed successfully." };
}

export async function saveAddressAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser("/account/addresses");
  const parsed = addressSchema.safeParse(formToObject(formData, ["isDefault"]));
  if (!parsed.success) return { error: "Please fix the highlighted fields.", fieldErrors: fieldErrorsFrom(parsed.error) };

  const id = Number(formData.get("id")) || null;
  const data = { ...parsed.data, instructions: parsed.data.instructions || null, isDefault: Boolean(parsed.data.isDefault) };

  await db.transaction(async (tx) => {
    if (data.isDefault) await tx.update(addresses).set({ isDefault: false }).where(eq(addresses.userId, user.id));
    if (id) {
      await tx.update(addresses).set(data).where(and(eq(addresses.id, id), eq(addresses.userId, user.id)));
    } else {
      await tx.insert(addresses).values({ ...data, userId: user.id });
    }
  });
  revalidatePath("/account/addresses");
  return { ok: true, message: id ? "Address updated." : "Address added." };
}

export async function deleteAddressAction(id: number): Promise<ActionState> {
  const user = await requireUser("/account/addresses");
  await db.delete(addresses).where(and(eq(addresses.id, id), eq(addresses.userId, user.id)));
  revalidatePath("/account/addresses");
  return { ok: true, message: "Address removed." };
}

export async function setDefaultAddressAction(id: number): Promise<ActionState> {
  const user = await requireUser("/account/addresses");
  await db.transaction(async (tx) => {
    await tx.update(addresses).set({ isDefault: false }).where(eq(addresses.userId, user.id));
    await tx.update(addresses).set({ isDefault: true }).where(and(eq(addresses.id, id), eq(addresses.userId, user.id)));
  });
  revalidatePath("/account/addresses");
  return { ok: true };
}
