"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "Hábitos" },
  { href: "/plans", label: "Planes" },
  { href: "/projects", label: "Proyectos" },
  { href: "/spots", label: "Spots" },
];

export default function Nav() {
  const path = usePathname();
  const active = (h: string) => (h === "/" ? path === "/" : path.startsWith(h));
  return (
    <nav className="glass fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-1/2 z-10 flex -translate-x-1/2 gap-1 rounded-full p-1.5 shadow-2xl">
      {TABS.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          className={`rounded-full px-4 py-2 text-sm transition ${
            active(t.href) ? "bg-accent font-semibold text-[#1a1700]" : "text-mute hover:text-white"
          }`}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
