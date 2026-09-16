"use client";

import { WifiOff } from "lucide-react";
import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-x flex min-h-[60vh] items-center justify-center">
      <EmptyState
        icon={WifiOff}
        title="Something went wrong"
        description="We hit a snag loading this page. It may be a temporary network issue — please try again."
        action={
          <>
            <Button type="button" onClick={reset}>
              Try again
            </Button>
            <ButtonLink href="/" variant="secondary">
              Go home
            </ButtonLink>
          </>
        }
      />
    </div>
  );
}
