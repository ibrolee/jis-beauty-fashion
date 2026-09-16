import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const control =
  "block w-full border border-line bg-white px-4 text-[15px] text-ink placeholder:text-mist transition-colors focus:border-ink focus:outline-none disabled:bg-ivory";

export function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
  className,
  required,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
  required?: boolean;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={htmlFor} className="block text-xs font-medium uppercase tracking-[0.14em] text-ink-soft">
        {label}
        {required && <span className="ml-0.5 text-rosewood" aria-hidden>*</span>}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-sale" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-stone">{hint}</p>
      ) : null}
    </div>
  );
}

export function Input({ className, invalid, ...props }: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return <input className={cn(control, "h-12", invalid && "border-sale", className)} aria-invalid={invalid || undefined} {...props} />;
}

export function Textarea({ className, invalid, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return <textarea className={cn(control, "min-h-[120px] py-3", invalid && "border-sale", className)} aria-invalid={invalid || undefined} {...props} />;
}

export function Select({ className, invalid, children, ...props }: SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }) {
  return (
    <select className={cn(control, "h-12 appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%27http://www.w3.org/2000/svg%27 width=%2712%27 height=%2712%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%23141414%27 stroke-width=%272%27><path d=%27m6 9 6 6 6-6%27/></svg>')] bg-[length:12px] bg-[right_1rem_center] bg-no-repeat pr-10", invalid && "border-sale", className)} aria-invalid={invalid || undefined} {...props}>
      {children}
    </select>
  );
}

export function Checkbox({ label, className, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: ReactNode }) {
  return (
    <label className={cn("flex cursor-pointer items-start gap-3 text-sm text-ink-soft", className)}>
      <input type="checkbox" className="mt-0.5 h-4 w-4 shrink-0 accent-ink" {...props} />
      <span>{label}</span>
    </label>
  );
}

export function FormMessage({ type, children }: { type: "error" | "success"; children: ReactNode }) {
  return (
    <div
      role={type === "error" ? "alert" : "status"}
      className={cn("border px-4 py-3 text-sm", type === "error" ? "border-sale/40 bg-red-50 text-sale" : "border-success/30 bg-green-50 text-success")}
    >
      {children}
    </div>
  );
}
