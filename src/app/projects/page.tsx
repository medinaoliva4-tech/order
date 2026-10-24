import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createProject } from "./actions";

const COLORS = ["#7c9cff", "#a78bfa", "#4ade80", "#fb923c", "#f472b6", "#e8d77a"];
type Project = { id: string; name: string; color: string; tasks: { done: boolean }[] };

export default async function Projects() {
  const supabase = await createClient();
  const { data } = await supabase.from("projects").select("id, name, color, tasks(done)").order("created_at", { ascending: false }).returns<Project[]>();
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-light">Proyectos</h1>
      <div className="grid gap-3 sm:grid-cols-2">
        {(data ?? []).map((p) => {
          const done = p.tasks.filter((t) => t.done).length;
          const pct = p.tasks.length ? (done / p.tasks.length) * 100 : 0;
          return (
            <Link key={p.id} href={`/projects/${p.id}`} className="glass block space-y-3 p-5 transition hover:bg-white/10">
              <p className="flex items-center gap-2 text-lg"><span className="size-2.5 rounded-full" style={{ background: p.color }} />{p.name}</p>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: p.color }} />
              </div>
              <p className="text-xs text-mute">{done}/{p.tasks.length} tareas</p>
            </Link>
          );
        })}
      </div>
      {(data ?? []).length === 0 && <p className="glass p-6 text-center text-mute">Aún no hay proyectos.</p>}
      <details className="glass p-4">
        <summary className="cursor-pointer text-sm text-accent">+ Nuevo proyecto</summary>
        <form action={createProject} className="mt-4 space-y-3">
          <input name="name" required placeholder="Nombre del proyecto" className="field" />
          <div className="flex gap-2">
            {COLORS.map((c, i) => (
              <label key={c}>
                <input type="radio" name="color" value={c} defaultChecked={i === 0} className="peer sr-only" />
                <span className="block size-7 cursor-pointer rounded-full ring-white ring-offset-2 ring-offset-black peer-checked:ring-2" style={{ background: c }} />
              </label>
            ))}
          </div>
          <button className="btn btn-accent">Crear</button>
        </form>
      </details>
    </div>
  );
}
