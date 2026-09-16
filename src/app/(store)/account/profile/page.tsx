import type { Metadata } from "next";
import { ChangePasswordForm, ProfileForm } from "@/components/account/profile-forms";
import { requireUser } from "@/lib/auth/session";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Profile", robots: { index: false } };

export default async function ProfilePage() {
  const user = await requireUser("/account/profile");
  return (
    <div className="space-y-12">
      <section aria-labelledby="profile-heading">
        <h2 id="profile-heading" className="font-serif text-2xl">Personal details</h2>
        <p className="mt-1 text-xs text-stone">Member since {formatDate(user.createdAt, { month: "long" })}</p>
        <div className="mt-6">
          <ProfileForm user={user} />
        </div>
      </section>
      <section aria-labelledby="password-heading" className="border-t border-line pt-10">
        <h2 id="password-heading" className="font-serif text-2xl">Change password</h2>
        <div className="mt-6">
          <ChangePasswordForm />
        </div>
      </section>
    </div>
  );
}
