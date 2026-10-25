"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import { addExpense, deleteExpense, deleteStream, updateExpense, updateStream } from "@/app/dream/actions";
import { Sheet, SheetForm } from "@/components/Sheet";
import Menu from "@/components/Menu";
import { SubmitButton } from "@/components/ui";

export type Stream = { id: string; source: string; name: string; price: number; clients: number };
export type Expense = { id: string; name: string; amount: number; period: "month" | "year" };

const perMonth = (e: Expense) => (e.period === "year" ? e.amount / 12 : e.amount);

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

function ExpenseRow({ e, fmt, onChange }: { e: Expense; fmt: (n: number) => string; onChange: (patch: Partial<Expense>) => void }) {
  const [amount, setAmount] = useState(String(e.amount));
  useEffect(() => setAmount(String(e.amount)), [e.amount]);
  const commit = () => {
    const n = Math.max(0, Number(amount) || 0);
    if (n !== e.amount) onChange({ amount: n });
    else setAmount(String(e.amount));
  };
  return (
    <li className="animate-rise space-y-2 py-3">
      <div className="flex items-center gap-2">
        <p className="min-w-0 flex-1 truncate">{e.name}</p>
        <p className="text-sm tabular-nums text-red-300">{fmt(perMonth(e))}/mes</p>
        <Menu>
          <form action={deleteExpense.bind(null, e.id)}>
            <SubmitButton className="menu-item danger">Eliminar</SubmitButton>
          </form>
        </Menu>
      </div>
      <div className="flex items-center gap-2 text-xs text-mute">
        <input
          value={amount}
          onChange={(ev) => setAmount(ev.target.value)}
          onBlur={commit}
          onKeyDown={(ev) => ev.key === "Enter" && (ev.target as HTMLInputElement).blur()}
          inputMode="decimal"
          aria-label={`Monto de ${e.name}`}
          className="w-28 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-white outline-none transition focus:border-accent/60"
        />
        <div className="relative flex rounded-full border border-white/10 p-0.5">
          <span
            aria-hidden
            className="absolute top-0.5 bottom-0.5 left-0.5 w-14 rounded-full bg-white/15 transition-transform duration-300"
            style={{ transform: e.period === "year" ? "translateX(100%)" : "none" }}
          />
          {(["month", "year"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => p !== e.period && onChange({ period: p })}
              className={`relative w-14 rounded-full py-0.5 transition-colors ${e.period === p ? "text-white" : ""}`}
            >
              {p === "month" ? "al mes" : "al año"}
            </button>
          ))}
        </div>
      </div>
    </li>
  );
}

// Progress of the dream income towards a monthly target, with how many clients would close the gap.
function TargetBar({ label, target, monthly, best, fmt }: { label: string; target: number; monthly: number; best: Stream | null; fmt: (n: number) => string }) {
  const pct = Math.min(100, (monthly / target) * 100);
  const gap = Math.max(0, target - monthly);
  const need = best && best.price > 0 ? Math.ceil(gap / best.price) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs text-mute">
        <span>{label} {fmt(target)}/mes</span>
        <span className={pct >= 100 ? "text-accent" : ""}>{Math.round((monthly / target) * 100)}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div className={`h-full rounded-full transition-[width] duration-500 ${pct >= 100 ? "bg-accent" : "bg-accent/80"}`} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs text-mute">
        {gap === 0
          ? "✦ Cubierto"
          : best && best.price > 0
            ? `Faltan ${fmt(gap)}/mes ≈ ${need} ${need === 1 ? "cliente" : "clientes"} más de ${best.name}`
            : `Faltan ${fmt(gap)}/mes`}
      </p>
    </div>
  );
}

export default function DreamCalculator({ streams, expenses, goal, currency }: { streams: Stream[]; expenses: Expense[]; goal: number; currency: string }) {
  const [rows, setRows] = useState(streams);
  useEffect(() => setRows(streams), [streams]);
  const [costs, setCosts] = useState(expenses);
  useEffect(() => setCosts(expenses), [expenses]);
  const [, start] = useTransition();
  const fmt = (n: number) => n.toLocaleString("es-MX", { style: "currency", currency, currencyDisplay: "narrowSymbol", maximumFractionDigits: 0 });

  const change = (id: string, patch: Partial<Stream>) => {
    setRows((r) => r.map((s) => (s.id === id ? { ...s, ...patch } : s)));
    start(() => updateStream(id, patch));
  };
  const changeCost = (id: string, patch: Partial<Expense>) => {
    setCosts((r) => r.map((e) => (e.id === id ? { ...e, ...patch } : e)));
    start(() => updateExpense(id, patch));
  };

  const monthly = rows.reduce((t, s) => t + s.price * s.clients, 0);
  const shown = useAnimated(monthly);
  const clients = rows.reduce((t, s) => t + s.clients, 0);
  const spend = costs.reduce((t, e) => t + perMonth(e), 0);
  const left = monthly - spend;
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
          {spend > 0 && (
            <p className={`mt-1 text-sm ${left >= 0 ? "text-accent" : "text-red-300"}`}>
              {left >= 0 ? `Después de gastos te quedan ${fmt(left)}/mes` : `Te faltan ${fmt(-left)}/mes para cubrir tus gastos`}
            </p>
          )}
        </div>
        {spend > 0 && <TargetBar label="Gastos soñados" target={spend} monthly={monthly} best={best} fmt={fmt} />}
        {goal > 0 && <TargetBar label="Salario soñado" target={goal} monthly={monthly} best={best} fmt={fmt} />}
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

      <section className="glass animate-rise px-4 pt-3" style={{ animationDelay: `${(sources.length + 1) * 60}ms` }}>
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-medium">Gastos soñados</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm tabular-nums text-mute">{fmt(spend)}/mes</span>
            <Sheet
              title="Nuevo gasto soñado"
              label="Nuevo gasto"
              trigger="+"
              triggerClassName="grid size-8 place-items-center rounded-full bg-white/10 text-lg transition hover:bg-white/15 active:scale-90"
            >
              <SheetForm action={addExpense} className="grid gap-3">
                <input name="name" required placeholder="Universidad, apartamento, coche…" className="field" />
                <div className="grid grid-cols-2 gap-3">
                  <input name="amount" type="number" min={0} step="any" required placeholder={`Monto (${currency})`} className="field" />
                  <select name="period" defaultValue="month" className="field">
                    <option value="month">al mes</option>
                    <option value="year">al año</option>
                  </select>
                </div>
                <SubmitButton className="btn btn-accent">Añadir gasto</SubmitButton>
              </SheetForm>
            </Sheet>
          </div>
        </div>
        {costs.length > 0 ? (
          <ul className="divide-y divide-white/5">
            {costs.map((e) => <ExpenseRow key={e.id} e={e} fmt={fmt} onChange={(p) => changeCost(e.id, p)} />)}
          </ul>
        ) : (
          <p className="py-4 text-sm text-mute">Añade lo que quieres pagar (universidad, apartamento…) para saber cuánto necesitas generar.</p>
        )}
      </section>
    </div>
  );
}
