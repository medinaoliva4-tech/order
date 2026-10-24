"use client";
import { useEffect, useState, useTransition } from "react";
import type { MovieResult } from "@/app/api/movies/search/route";
import { useCloseSheet } from "@/components/Sheet";
import { Spinner } from "@/components/ui";

// Search-as-you-type against /api/movies/search; tapping a result adds it to the current list.
export default function MovieSearch({ add, existing }: { add: (m: MovieResult) => Promise<void>; existing: string[] }) {
  const close = useCloseSheet();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<MovieResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);
  const [, start] = useTransition();

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      fetch(`/api/movies/search?q=${encodeURIComponent(term)}`, { signal: ctrl.signal })
        .then((r) => r.json())
        .then((r: MovieResult[]) => setResults(r))
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 300);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  const pick = (m: MovieResult, key: string) => {
    setAdding(key);
    start(async () => {
      await add(m);
      setAdding(null);
      setQ("");
      close();
    });
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Busca una película o serie…" className="field pr-10" />
        {loading && <Spinner className="absolute right-3.5 top-1/2 -translate-y-1/2 text-mute" />}
      </div>
      <ul className="max-h-[50vh] space-y-1 overflow-y-auto">
        {results.map((m) => {
          const key = m.imdb_id ?? m.title;
          const already = !!m.imdb_id && existing.includes(m.imdb_id);
          return (
            <li key={key} className="animate-fade">
              <button
                type="button"
                disabled={already || adding !== null}
                onClick={() => pick(m, key)}
                className="flex w-full items-center gap-3 rounded-xl p-1.5 text-left transition hover:bg-white/5 active:scale-[0.98] disabled:opacity-50"
              >
                {m.poster ? (
                  <img src={m.poster} alt="" className="h-[60px] w-10 shrink-0 rounded-md object-cover" />
                ) : (
                  <span className="h-[60px] w-10 shrink-0 rounded-md bg-white/5" />
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm">{m.title}</span>
                  <span className="block text-xs text-mute">{[m.year, m.kind].filter(Boolean).join(" · ")}</span>
                </span>
                <span className="grid size-8 shrink-0 place-items-center text-accent">
                  {adding === key ? <Spinner /> : already ? "✓" : "+"}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {q.trim().length >= 2 && !loading && (
        <button
          type="button"
          disabled={adding !== null}
          onClick={() => pick({ imdb_id: null, title: q.trim(), year: null, kind: null, poster: null }, "manual")}
          className="w-full rounded-xl border border-dashed border-white/15 p-3 text-sm text-mute transition hover:text-white"
        >
          {adding === "manual" ? <Spinner /> : `Añadir “${q.trim()}” sin póster`}
        </button>
      )}
    </div>
  );
}
