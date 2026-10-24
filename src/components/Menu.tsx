"use client";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// "⋯" button with a small dropdown for secondary actions (delete, links…).
export default function Menu({ children, label = "Más opciones" }: { children: React.ReactNode; label?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const path = usePathname();
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("pointerdown", away);
    return () => document.removeEventListener("pointerdown", away);
  }, [open]);
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="grid size-8 place-items-center rounded-full text-lg text-mute transition hover:bg-white/10 hover:text-white active:scale-90"
      >
        ⋯
      </button>
      {open && <div className="menu absolute right-0 top-full z-20 mt-1 min-w-44 animate-fade">{children}</div>}
    </div>
  );
}
