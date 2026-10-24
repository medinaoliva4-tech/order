"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import { deleteStream, updateStream } from "@/app/dream/actions";
import Menu from "@/components/Menu";
import { SubmitButton } from "@/components/ui";

export type Stream = { id: string; source: string; name: string; price: number; clients: number };

// Counts up/down to the new value so totals feel alive while you play with the numbers.
function useAnimated(value: number) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    const start = performance.now();
    const a = from.current;
    let raf = 0;
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / 450);
      const v = a + (value - a) * (1 - Math.pow(1 - k, 3));
      setShown(v);
      from.current = v;
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return shown;
}

function Row({ s, fmt, onChange }: { s: Stream; fmt: (n: number) => string; onChange: (patch: Partial<Stream>) => void }) {
  const [price, setPrice] = useState(String(s.price));
  useEffect(() => setPrice(String(s.price)), [s.price]);
  const commitPrice = () => {
    const n = Math.max(0, Number(price) || 0);
    if (n !== s.price) onChange({ price: n });
    else setPrice(String(s.price));
  };
  const step = "grid size-8 place-items-center rounded-full bg-white/5 text-lg transition hover:bg-white/10 active:scale-90 disabled:opacity-30";
  return (
    <li className="animate-rise space-y-2 py-3">
      <div className="flex items-center gap-2">
        <p className="min-w-0 flex-1 truncate">{s.name}</p>
        <p className="text-sm tabular-nums text-accent">{fmt(s.price * s.clients)}</p>
        <Menu>
          <form action={deleteStream.bind(null, s.id)}>
            <SubmitButton className="menu-item danger">Eliminar</SubmitButton>
          </form>
        </Menu>
      </div>
      <div className="flex items-center justify-between gap-3">
        <label className="flex min-w-0 items-center gap-1 text-xs text-mute">
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            onBlur={commitPrice}
            onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
            inputMode="decimal"
            aria-label={`Precio de ${s.name}`}
            className="w-24 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-white outline-none transition focus:border-accent/60"
          />
          <span className="whitespace-nowrap">por cliente / mes</span>
        </label>
        <div className="flex items-center gap-2">
          <button type="button" aria-label="Quitar cliente" disabled={s.clients === 0} onClick={() => onChange({ clients: s.clients - 1 })} className={step}>−</button>
          <span key={s.clients} className="w-7 animate-pop text-center tabular-nums">{s.clients}</span>
          <button type="button" aria-label="Añadir cliente" onClick={() => onChange({ clients: s.clients + 1 })} className={step}>+</button>
        </div>
      </div>
    </li>
  );
}

export default function DreamCalculator({ streams, goal, currency }: { streams: Stream[]; goal: number; currency: string }) {
  const [rows, setRows] = useState(streams);
  useEffect(() => setRows(streams), [streams]);
  const [, start] = useTransition();
  const fmt = (n: number) => n.toLocaleString("es-MX", { style: "currency", currency, currencyDisplay: "narrowSymbol", maximumFractionDigits: 0 });

  const change = (id: string, patch: Partial<Stream>) => {
    setRows((r) => r.map((s) => (s.id === id ? { ...s, ...patch } : s)));
    start(() => updateStream(id, patch));
  };

  const monthly = rows.reduce((t, s) => t + s.price * s.clients, 0);
  const shown = useAnimated(monthly);
  const clients = rows.reduce((t, s) => t + s.clients, 0);
  const pct = goal > 0 ? Math.min(100, (monthly / goal) * 100) : 0;
  const gap = Math.max(0, goal - monthly);
  const best = rows.reduce<Stream | null>((b, s) => (s.price > (b?.price ?? 0) ? s : b), null);
  const sources = [...new Set(rows.map((s) => s.source))];

  return (
    <div className="space-y-3">
      <section className="glass animate-rise space-y-4 p-5">
        <div>
          <p className="text-xs tracking-widest text-mute">INGRESO SOÑADO / MES</p>
          <p className="text-4xl font-light tabular-nums">{fmt(shown)}</p>
          <p className="text-sm text-mute">
            {fmt(monthly * 12)} al año · {clients} {clients === 1 ? "cliente" : "clientes"}
          </p>
        </div>
        {goal > 0 && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-mute">
              <span>Salario soñado {fmt(goal)}</span>
              <span className={pct >= 100 ? "text-accent" : ""}>{Math.round((monthly / goal) * 100)}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-accent transition-[width] duration-500" style={{ width: `${pct}%` }} />
            </div>
            <p className="text-xs text-mute">
              {gap === 0
                ? "✦ Meta alcanzada"
                : best && best.price > 0
                  ? `Faltan ${fmt(gap)}/mes ≈ ${Math.ceil(gap / best.price)} clientes más de ${best.name}`
                  : `Faltan ${fmt(gap)}/mes`}
            </p>
          </div>
        )}
      </section>

      {sources.map((src, i) => {
        const items = rows.filter((s) => s.source === src);
        const subtotal = items.reduce((t, s) => t + s.price * s.clients, 0);
        return (
          <section key={src} className="glass animate-rise px-4 pt-3" style={{ animationDelay: `${(i + 1) * 60}ms` }}>
            <div className="flex items-baseline justify-between">
              <h2 className="font-medium">{src}</h2>
              <span className="text-sm tabular-nums text-mute">{fmt(subtotal)}/mes</span>
            </div>
            <ul className="divide-y divide-white/5">
              {items.map((s) => <Row key={s.id} s={s} fmt={fmt} onChange={(p) => change(s.id, p)} />)}
            </ul>
          </section>
        );
      })}

      {rows.length === 0 && (
        <p className="glass animate-rise p-8 text-center text-sm text-mute">
          Toca + para añadir lo que vendes (por ejemplo, un plan de Inherent) y juega con el número de clientes.
        </p>
      )}
    </div>
  );
}
