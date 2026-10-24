import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SubmitButton } from "@/components/ui";
import PageHeader from "@/components/PageHeader";
import { Sheet, SheetForm, addButton } from "@/components/Sheet";
import { createProject } from "./actions";

const COLORS = ["#7c9cff", "#a78bfa", "#4ade80", "#fb923c", "#f472b6", "#e8d77a"];
type Project = { id: string; name: string; color: string; tasks: { done: boolean }[] };

export default async function Projects() {
  const supabase = await createClient();
  const { data } = await supabase.from("projects").select("id, name, color, tasks(done)").order("created_at", { ascending: false }).returns<Project[]>();
  const projects = data ?? [];
  return (
    <div className="space-y-3">
      <PageHeader title="Proyectos">
        <Sheet title="Nuevo proyecto" label="Nuevo proyecto" trigger="+" triggerClassName={addButton}>
          <SheetForm action={createProject} className="space-y-4">
            <input name="name" required placeholder="Nombre del proyecto" className="field" />
            <div className="flex gap-2">
              {COLORS.map((c, j) => (
                <label key={c}>
                  <input type="radio" name="color" value={c} defaultChecked={j === 0} className="peer sr-only" />
                  <span className="block size-8 cursor-pointer rounded-full ring-white ring-offset-2 ring-offset-[#141416] transition peer-checked:scale-110 peer-checked:ring-2" style={{ background: c }} />
                </label>
              ))}
            </div>
            <SubmitButton className="btn btn-accent w-full">Crear proyecto</SubmitButton>
          </SheetForm>
        </Sheet>
      </PageHeader>

      {projects.length > 0 ? (
        <ul className="glass divide-y divide-white/5 overflow-hidden">
          {projects.map((p, i) => {
            const done = p.tasks.filter((t) => t.done).length;
            const pct = p.tasks.length ? (done / p.tasks.length) * 100 : 0;
            return (
              <li key={p.id} className="animate-rise" style={{ animationDelay: `${i * 40}ms` }}>
                <Link href={`/projects/${p.id}`} className="flex items-center gap-3 px-4 py-3.5 transition hover:bg-white/5 active:bg-white/10">
                  <span className="size-2.5 shrink-0 rounded-full" style={{ background: p.color }} />
                  <p className="min-w-0 flex-1 truncate">{p.name}</p>
                  <div className="w-16 shrink-0 space-y-1 text-right">
                    <p className="text-[11px] text-mute">{done}/{p.tasks.length}</p>
                    <div className="h-1 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full origin-left animate-grow rounded-full" style={{ width: `${pct}%`, background: p.color }} />
                    </div>
                  </div>
                  <span className="text-mute">›</span>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="glass animate-rise p-8 text-center text-sm text-mute">Sin proyectos todavía. Toca + para crear uno.</p>
      )}
    </div>
  );
}
