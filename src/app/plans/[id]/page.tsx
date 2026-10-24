import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { money } from "@/lib/dates";
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

  return (
    <div className="space-y-4">
      <Link href="/plans" className="text-sm text-mute">← Planes</Link>
      <h1 className="text-3xl font-light">{plan.title}</h1>

      <form action={updatePlan.bind(null, id)} className="glass grid gap-3 p-5 sm:grid-cols-2">
        <input name="title" defaultValue={plan.title} className="field sm:col-span-2" />
        <input name="place" defaultValue={plan.place ?? ""} placeholder="Lugar" className="field" />
        <input name="starts_on" type="date" defaultValue={plan.starts_on ?? ""} className="field" />
        <input name="budget" type="number" min={0} step="0.01" defaultValue={plan.budget} placeholder="Presupuesto €" className="field" />
        <textarea name="notes" defaultValue={plan.notes} rows={4} placeholder="Notas" className="field sm:col-span-2" />
        <button className="btn btn-accent sm:col-span-2">Guardar</button>
      </form>

      <section className="glass space-y-3 p-5">
        <div className="flex items-end justify-between">
          <h2 className="text-lg">Presupuesto</h2>
          <p className={`text-sm ${left < 0 ? "text-red-400" : "text-accent"}`}>{money(left)} restante</p>
        </div>
        <ul className="divide-y divide-white/5">
          {expenses.map((i) => (
            <li key={i.id} className="flex items-center justify-between py-2 text-sm">
              <span>{i.title}</span>
              <span className="flex items-center gap-3">
                {money(i.amount)}
                <form action={deleteItem.bind(null, id, i.id)}><button className="text-mute hover:text-red-400">✕</button></form>
              </span>
            </li>
          ))}
        </ul>
        <form action={addItem.bind(null, id, "expense")} className="flex gap-2">
          <input name="title" required placeholder="Gasto (vuelo, hotel…)" className="field" />
          <input name="amount" type="number" min={0} step="0.01" placeholder="€" className="field w-28" />
          <button className="btn">+</button>
        </form>
      </section>

      <section className="glass space-y-3 p-5">
        <h2 className="text-lg">Tareas</h2>
        <ul className="space-y-1">
          {tasks.map((t) => (
            <li key={t.id} className="flex items-center gap-3 py-1.5 text-sm">
              <form action={toggleItem.bind(null, id, t.id, !t.done)}>
                <button className={`grid size-5 place-items-center rounded-full border text-[11px] ${t.done ? "border-accent bg-accent text-black" : "border-white/30"}`}>{t.done && "✓"}</button>
              </form>
              <span className={`flex-1 ${t.done ? "text-mute line-through" : ""}`}>{t.title}</span>
              <form action={deleteItem.bind(null, id, t.id)}><button className="text-mute hover:text-red-400">✕</button></form>
            </li>
          ))}
        </ul>
        <form action={addItem.bind(null, id, "task")} className="flex gap-2">
          <input name="title" required placeholder="Nueva tarea" className="field" />
          <button className="btn">+</button>
        </form>
      </section>

      <form action={deletePlan.bind(null, id)}><button className="text-xs text-mute hover:text-red-400">Eliminar plan</button></form>
    </div>
  );
}
