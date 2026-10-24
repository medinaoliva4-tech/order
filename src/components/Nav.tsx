"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

const TABS = [
  { href: "/", label: "Hábitos" },
  { href: "/movies", label: "Películas" },
  { href: "/spots", label: "Spots" },
];

export default function Nav() {
  const path = usePathname();
  // Tab tapped but not yet rendered: highlight it right away so the tap feels instant.
  const [target, setTarget] = useState<string | null>(null);
  useEffect(() => setTarget(null), [path]);
  const current = target ?? path;
  const idx = TABS.findIndex((t) => (t.href === "/" ? current === "/" : current.startsWith(t.href)));

  const refs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [pill, setPill] = useState<{ left: number; width: number } | null>(null);
  const placed = useRef(false);
  useLayoutEffect(() => {
    const place = () => {
      const el = refs.current[idx];
      setPill(el ? { left: el.offsetLeft, width: el.offsetWidth } : null);
    };
    place();
    document.fonts?.ready.then(place); // tab widths shift once the web font loads
  }, [idx]);
  useEffect(() => {
    if (pill) placed.current = true;
  }, [pill]);

  return (
    <nav className="glass fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-1/2 z-10 flex -translate-x-1/2 gap-1 rounded-full p-1.5 shadow-2xl">
      {pill && (
        <span
          aria-hidden
          className={`absolute top-1.5 bottom-1.5 rounded-full bg-accent ${placed.current ? "transition-all duration-300 ease-[cubic-bezier(0.3,1.3,0.5,1)]" : ""}`}
          style={{ left: pill.left, width: pill.width }}
        />
      )}
      {TABS.map((t, i) => (
        <Link
          key={t.href}
          href={t.href}
          ref={(el) => { refs.current[i] = el; }}
          onClick={() => setTarget(t.href)}
          className={`relative rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300 active:scale-95 ${
            i === idx ? "text-[#1a1700]" : "text-mute hover:text-white"
          }`}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
