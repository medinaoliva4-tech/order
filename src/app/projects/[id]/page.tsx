import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { shortDate } from "@/lib/dates";
import { addTask, deleteProject, deleteTask, toggleTask } from "../actions";

type Task = { id: string; title: string; due_on: string | null; done: boolean };

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: project } = await supabase.from("projects").select("id, name, color").eq("id", id).maybeSingle();
  if (!project) notFound();
  const { data } = await supabase.from("tasks").select("id, title, due_on, done").eq("project_id", id).order("done").order("created_at").returns<Task[]>();
  const tasks = data ?? [];
  const done = tasks.filter((t) => t.done).length;

  return (
    <div className="space-y-4">
      <Link href="/projects" className="text-sm text-mute">← Proyectos</Link>
      <div className="flex items-end justify-between">
        <h1 className="flex items-center gap-3 text-3xl font-light"><span className="size-3 rounded-full" style={{ background: project.color }} />{project.name}</h1>
        <p className="text-sm text-mute">{done}/{tasks.length}</p>
      </div>
      <section className="glass space-y-3 p-5">
        <ul className="space-y-1">
          {tasks.map((t) => (
            <li key={t.id} className="flex items-center gap-3 py-1.5 text-sm">
              <form action={toggleTask.bind(null, id, t.id, !t.done)}>
                <button className="grid size-5 place-items-center rounded-full border text-[11px]" style={t.done ? { background: project.color, borderColor: project.color, color: "#111" } : { borderColor: "rgba(255,255,255,.3)" }}>{t.done && "✓"}</button>
              </form>
              <span className={`flex-1 ${t.done ? "text-mute line-through" : ""}`}>{t.title}</span>
              {t.due_on && <span className="text-xs text-mute">{shortDate(t.due_on)}</span>}
              <form action={deleteTask.bind(null, id, t.id)}><button className="text-mute hover:text-red-400">✕</button></form>
            </li>
          ))}
          {tasks.length === 0 && <li className="text-sm text-mute">Sin tareas todavía.</li>}
        </ul>
        <form action={addTask.bind(null, id)} className="flex flex-wrap gap-2">
          <input name="title" required placeholder="Nueva tarea" className="field min-w-40 flex-1" />
          <input name="due_on" type="date" className="field w-40" />
          <button className="btn btn-accent">Añadir</button>
        </form>
      </section>
      <form action={deleteProject.bind(null, id)}><button className="text-xs text-mute hover:text-red-400">Eliminar proyecto</button></form>
    </div>
  );
}
