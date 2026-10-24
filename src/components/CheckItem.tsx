"use client";
import { useOptimistic, useState, useTransition } from "react";

// Checklist row that flips instantly and fades out on delete while the server action runs.
export default function CheckItem({
  title, done, meta, color = "#e8d77a", setDone, remove,
}: { title: string; done: boolean; meta?: string; color?: string; setDone: (done: boolean) => Promise<void>; remove: () => Promise<void> }) {
  const [checked, setChecked] = useOptimistic(done);
  const [removing, setRemoving] = useState(false);
  const [, start] = useTransition();
  return (
    <li className={`flex animate-rise items-center gap-3 py-1.5 text-sm transition-all duration-300 ${removing ? "pointer-events-none translate-x-3 opacity-0" : ""}`}>
      <button
        aria-label={checked ? "Desmarcar" : "Marcar"}
        onClick={() => start(async () => { setChecked(!checked); await setDone(!checked); })}
        className={`grid size-5 shrink-0 place-items-center rounded-full border text-[11px] transition-colors duration-200 active:scale-90 ${checked ? "animate-pop" : ""}`}
        style={checked ? { background: color, borderColor: color, color: "#111" } : { borderColor: "rgba(255,255,255,.3)" }}
      >
        {checked && "✓"}
      </button>
      <span className={`flex-1 transition-colors duration-300 ${checked ? "text-mute line-through" : ""}`}>{title}</span>
      {meta && <span className="text-xs text-mute">{meta}</span>}
      <button aria-label="Eliminar" onClick={() => { setRemoving(true); start(remove); }} className="text-mute transition hover:text-red-400 active:scale-90">✕</button>
    </li>
  );
}
