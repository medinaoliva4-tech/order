import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SubmitButton } from "@/components/ui";
import PageHeader from "@/components/PageHeader";
import { Sheet, SheetForm, addButton } from "@/components/Sheet";
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
  const plans = data ?? [];
  return (
    <div className="space-y-3">
      <PageHeader title="Planes">
        <Sheet title="Nuevo plan" label="Nuevo plan" trigger="+" triggerClassName={addButton}>
          <SheetForm action={createPlan} className="grid gap-3 sm:grid-cols-2">
            <input name="title" required placeholder="Título (Viaje a Viena…)" className="field sm:col-span-2" />
            <input name="place" placeholder="Lugar" className="field" />
            <input name="starts_on" type="date" className="field" />
            <input name="budget" type="number" min={0} step="0.01" placeholder="Presupuesto €" className="field sm:col-span-2" />
            <SubmitButton className="btn btn-accent sm:col-span-2">Crear plan</SubmitButton>
          </SheetForm>
        </Sheet>
      </PageHeader>

      {plans.length > 0 ? (
        <ul className="glass divide-y divide-white/5 overflow-hidden">
          {plans.map((p, i) => {
            const spent = p.plan_items.filter((x) => x.kind === "expense").reduce((s, x) => s + Number(x.amount), 0);
            const tasks = p.plan_items.filter((x) => x.kind === "task");
            const pct = p.budget > 0 ? Math.min(100, (spent / p.budget) * 100) : 0;
            const meta = [p.place, p.starts_on && shortDate(p.starts_on), tasks.length > 0 && `${tasks.filter((t) => t.done).length}/${tasks.length} tareas`]
              .filter(Boolean).join(" · ");
            return (
              <li key={p.id} className="animate-rise" style={{ animationDelay: `${i * 40}ms` }}>
                <Link href={`/plans/${p.id}`} className="flex items-center gap-3 px-4 py-3.5 transition hover:bg-white/5 active:bg-white/10">
                  <div className="min-w-0 flex-1">
                    <p className="truncate">{p.title}</p>
                    {meta && <p className="truncate text-xs text-mute">{meta}</p>}
                  </div>
                  {p.budget > 0 && (
                    <div className="w-20 shrink-0 space-y-1 text-right">
                      <p className="text-[11px] text-mute">{money(spent)} / {money(p.budget)}</p>
                      <div className="h-1 overflow-hidden rounded-full bg-white/10">
                        <div className="h-full origin-left animate-grow rounded-full bg-accent" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )}
                  <span className="text-mute">›</span>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="glass animate-rise p-8 text-center text-sm text-mute">Sin planes todavía. Toca + para crear uno.</p>
      )}
    </div>
  );
}
