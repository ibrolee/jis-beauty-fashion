"use client";

import { ArrowRight } from "lucide-react";
import { useActionState } from "react";
import { subscribeNewsletterAction } from "@/lib/actions/engagement";
import { cn } from "@/lib/utils";
import { initialActionState } from "@/types";

export function NewsletterForm({ className, dark = false }: { className?: string; dark?: boolean }) {
  const [state, action, pending] = useActionState(subscribeNewsletterAction, initialActionState);

  if (state.ok) {
    return (
      <p className={cn("text-sm", dark ? "text-white/80" : "text-success", className)} role="status">
        {state.message}
      </p>
    );
  }

  return (
    <form action={action} className={cn("space-y-2", className)}>
      <div className={cn("flex items-center border-b", dark ? "border-white/40" : "border-ink")}>
        <label htmlFor={`newsletter-${dark ? "dark" : "light"}`} className="sr-only">Email address</label>
        <input
          id={`newsletter-${dark ? "dark" : "light"}`}
          name="email"
          type="email"
          required
          placeholder="Your email address"
          className={cn("h-12 flex-1 bg-transparent text-[15px] focus:outline-none", dark ? "text-white placeholder:text-white/50" : "text-ink placeholder:text-mist")}
        />
        <button type="submit" disabled={pending} aria-label="Subscribe" className={cn("flex h-12 w-12 items-center justify-center transition-colors", dark ? "text-white hover:text-blush" : "text-ink hover:text-rosewood")}>
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
      {state.error && <p className="text-xs text-sale" role="alert">{state.error}</p>}
    </form>
  );
}
