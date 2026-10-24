import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { money, shortDate } from "@/lib/dates";
import CheckItem from "@/components/CheckItem";
import Menu from "@/components/Menu";
import PageHeader from "@/components/PageHeader";
import { Sheet, SheetForm } from "@/components/Sheet";
import { SubmitButton } from "@/components/ui";
import { addItem, deleteItem, deletePlan, toggleItem, updatePlan } from "../actions";

type Item = { id: string; kind: "task" | "expense"; title: string; amount: number; done: boolean };

export default async function PlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: plan } = await supabase.from("plans").select("*").eq("id", id).maybeSingle();
  if (!plan) notFound();
  const { data } = await supabase.from("plan_items").select("id, kind, title, amount, done").eq("plan_id", id).order("created_at").returns<Item[]>();
  const items = data ?? [];
  const expenses = items.filter((i) => i.kind === "expense");
  const tasks = items.filter((i) => i.kind === "task");
  const spent = expenses.reduce((s, i) => s + Number(i.amount), 0);
  const left = Number(plan.budget) - spent;
  const pct = plan.budget > 0 ? Math.min(100, (spent / plan.budget) * 100) : 0;
  const chips = [plan.place && `📍 ${plan.place}`, plan.starts_on && `📅 ${shortDate(plan.starts_on)}`, plan.budget > 0 && `💶 ${money(plan.budget)}`].filter(Boolean);

  return (
    <div className="space-y-3">
      <Link href="/plans" className="text-sm text-mute transition hover:text-white">← Planes</Link>
      <PageHeader title={plan.title}>
        <Sheet title="Editar plan" label="Editar plan" trigger="Editar" triggerClassName="btn">
          <SheetForm action={updatePlan.bind(null, id)} className="grid gap-3 sm:grid-cols-2">
            <input name="title" defaultValue={plan.title} required className="field sm:col-span-2" />
            <input name="place" defaultValue={plan.place ?? ""} placeholder="Lugar" className="field" />
            <input name="starts_on" type="date" defaultValue={plan.starts_on ?? ""} className="field" />
            <input name="budget" type="number" min={0} step="0.01" defaultValue={plan.budget} placeholder="Presupuesto €" className="field sm:col-span-2" />
            <textarea name="notes" defaultValue={plan.notes} rows={5} placeholder="Notas" className="field sm:col-span-2" />
            <SubmitButton className="btn btn-accent sm:col-span-2">Guardar</SubmitButton>
          </SheetForm>
        </Sheet>
        <Menu>
          <form action={deletePlan.bind(null, id)}>
            <SubmitButton className="menu-item danger">Eliminar plan</SubmitButton>
          </form>
        </Menu>
      </PageHeader>

      {chips.length > 0 && (
        <div className="flex flex-wrap gap-2 text-sm text-mute">
          {chips.map((c) => <span key={c as string} className="rounded-full border border-white/10 px-3 py-1">{c}</span>)}
        </div>
      )}
      {plan.notes && <p className="glass animate-rise whitespace-pre-wrap p-4 text-sm text-white/80">{plan.notes}</p>}

      <section className="glass animate-rise space-y-3 p-4" style={{ animationDelay: "60ms" }}>
        <div className="flex items-end justify-between">
          <h2>Tareas</h2>
          <span className="text-xs text-mute">{tasks.filter((t) => t.done).length}/{tasks.length}</span>
        </div>
        <form action={addItem.bind(null, id, "task")} className="flex gap-2">
          <input name="title" required placeholder="Nueva tarea" className="field" />
          <SubmitButton aria-label="Añadir tarea">+</SubmitButton>
        </form>
        {tasks.length > 0 && (
          <ul>
            {tasks.map((t) => (
              <CheckItem key={t.id} title={t.title} done={t.done} setDone={toggleItem.bind(null, id, t.id)} remove={deleteItem.bind(null, id, t.id)} />
            ))}
          </ul>
        )}
      </section>

      <section className="glass animate-rise space-y-3 p-4" style={{ animationDelay: "120ms" }}>
        <div className="flex items-end justify-between">
          <h2>Gastos</h2>
          <span className={`text-xs ${left < 0 ? "text-red-400" : "text-accent"}`}>
            {plan.budget > 0 ? `${money(left)} restante` : money(spent)}
          </span>
        </div>
        {plan.budget > 0 && (
          <div className="h-1 overflow-hidden rounded-full bg-white/10">
            <div className={`h-full origin-left animate-grow rounded-full ${left < 0 ? "bg-red-400" : "bg-accent"}`} style={{ width: `${pct}%` }} />
          </div>
        )}
        <form action={addItem.bind(null, id, "expense")} className="flex gap-2">
          <input name="title" required placeholder="Gasto (vuelo, hotel…)" className="field" />
          <input name="amount" type="number" min={0} step="0.01" placeholder="€" className="field w-24" />
          <SubmitButton aria-label="Añadir gasto">+</SubmitButton>
        </form>
        {expenses.length > 0 && (
          <ul className="divide-y divide-white/5">
            {expenses.map((i) => (
              <li key={i.id} className="flex animate-rise items-center justify-between py-2 text-sm">
                <span>{i.title}</span>
                <span className="flex items-center gap-3">
                  {money(i.amount)}
                  <form action={deleteItem.bind(null, id, i.id)}>
                    <SubmitButton className="text-mute transition hover:text-red-400 active:scale-90" aria-label="Eliminar">✕</SubmitButton>
                  </form>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
