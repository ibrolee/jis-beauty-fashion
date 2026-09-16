import { Compass } from "lucide-react";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Logo } from "@/components/layout/logo";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col">
      <div className="flex h-16 items-center justify-center border-b border-line">
        <Logo />
      </div>
      <div className="container-x flex flex-1 items-center justify-center">
        <EmptyState
          icon={Compass}
          title="We couldn't find that page"
          description="The page or product you're looking for may have moved or is no longer available. Let's get you back to something beautiful."
          action={
            <>
              <ButtonLink href="/">Back to home</ButtonLink>
              <ButtonLink href="/shop" variant="secondary">
                Shop all fragrances
              </ButtonLink>
            </>
          }
        />
      </div>
      <p className="pb-8 text-center text-xs text-stone">
        Need help? <Link href="/contact" className="underline underline-offset-4">Contact us</Link>
      </p>
    </div>
  );
}
