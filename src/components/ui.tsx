"use client";
import { useFormStatus } from "react-dom";

export const Spinner = ({ className = "" }: { className?: string }) => (
  <span className={`inline-block size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent ${className}`} />
);

// Submit button that shows a spinner (keeping its width) while its form's server action runs.
// With name/value, only the clicked button spins; all of the form's buttons are disabled meanwhile.
export function SubmitButton({
  children, className = "btn", name, value, ...rest
}: { children: React.ReactNode; className?: string; name?: string; value?: string; "aria-label"?: string }) {
  const { pending, data } = useFormStatus();
  const mine = pending && (!name || data?.get(name) === value);
  return (
    <button name={name} value={value} disabled={pending} aria-busy={mine} className={`relative ${className}`} {...rest}>
      <span className={mine ? "invisible" : ""}>{children}</span>
      {mine && <span className="absolute inset-0 grid place-items-center"><Spinner /></span>}
    </button>
  );
}
