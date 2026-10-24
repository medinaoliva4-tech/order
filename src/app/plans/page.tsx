import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { money, shortDate } from "@/lib/dates";
import { createPlan } from "./actions";

type Plan = {
  id: string; title: string; place: string | null; starts_on: string | null; budget: number;
  plan_items: { kind: string; amount: number; done: boolean }[];
};

export default async function Plans() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("plans")
    .select("id, title, place, starts_on, budget, plan_items(kind, amount, done)")
    .order("created_at", { ascending: false })
    .returns<Plan[]>();
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-light">Planes</h1>
      <div className="grid gap-3 sm:grid-cols-2">
        {(data ?? []).map((p) => {
          const spent = p.plan_items.filter((i) => i.kind === "expense").reduce((s, i) => s + Number(i.amount), 0);
          const tasks = p.plan_items.filter((i) => i.kind === "task");
          const pct = p.budget > 0 ? Math.min(100, (spent / p.budget) * 100) : 0;
          return (
            <Link key={p.id} href={`/plans/${p.id}`} className="glass block space-y-3 p-5 transition hover:bg-white/10">
              <div>
                <p className="text-lg">{p.title}</p>
                <p className="text-xs text-mute">{[p.place, p.starts_on && shortDate(p.starts_on)].filter(Boolean).join(" · ") || "Sin lugar ni fecha"}</p>
              </div>
              <div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
                </div>
                <p className="mt-1.5 text-xs text-mute">{money(spent)} de {money(p.budget)}</p>
              </div>
              <p className="text-xs text-mute">{tasks.filter((t) => t.done).length}/{tasks.length} tareas</p>
            </Link>
          );
        })}
      </div>
      {(data ?? []).length === 0 && <p className="glass p-6 text-center text-mute">Aún no hay planes.</p>}
      <details className="glass p-4">
        <summary className="cursor-pointer text-sm text-accent">+ Nuevo plan</summary>
        <form action={createPlan} className="mt-4 grid gap-3 sm:grid-cols-2">
          <input name="title" required placeholder="Título (Viaje a Viena…)" className="field sm:col-span-2" />
          <input name="place" placeholder="Lugar" className="field" />
          <input name="starts_on" type="date" className="field" />
          <input name="budget" type="number" min={0} step="0.01" placeholder="Presupuesto €" className="field" />
          <button className="btn btn-accent">Crear plan</button>
        </form>
      </details>
    </div>
  );
}
