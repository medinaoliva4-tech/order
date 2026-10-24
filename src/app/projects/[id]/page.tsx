import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { shortDate } from "@/lib/dates";
import CheckItem from "@/components/CheckItem";
import Menu from "@/components/Menu";
import PageHeader from "@/components/PageHeader";
import { SubmitButton } from "@/components/ui";
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
  const pct = tasks.length ? (done / tasks.length) * 100 : 0;

  return (
    <div className="space-y-3">
      <Link href="/projects" className="text-sm text-mute transition hover:text-white">← Proyectos</Link>
      <PageHeader title={<span className="flex items-center gap-3"><span className="size-3 shrink-0 rounded-full" style={{ background: project.color }} />{project.name}</span>}>
        <span className="text-sm text-mute">{done}/{tasks.length}</span>
        <Menu>
          <form action={deleteProject.bind(null, id)}>
            <SubmitButton className="menu-item danger">Eliminar proyecto</SubmitButton>
          </form>
        </Menu>
      </PageHeader>
      <div className="h-1 overflow-hidden rounded-full bg-white/10">
        <div className="h-full origin-left animate-grow rounded-full transition-[width] duration-500" style={{ width: `${pct}%`, background: project.color }} />
      </div>
      <section className="glass animate-rise space-y-3 p-4">
        <form action={addTask.bind(null, id)} className="flex gap-2">
          <input name="title" required placeholder="Nueva tarea" className="field min-w-0 flex-1" />
          <input name="due_on" type="date" aria-label="Fecha límite" className="field w-36" />
          <SubmitButton aria-label="Añadir tarea">+</SubmitButton>
        </form>
        <ul>
          {tasks.map((t) => (
            <CheckItem
              key={t.id}
              title={t.title}
              done={t.done}
              color={project.color}
              meta={t.due_on ? shortDate(t.due_on) : undefined}
              setDone={toggleTask.bind(null, id, t.id)}
              remove={deleteTask.bind(null, id, t.id)}
            />
          ))}
          {tasks.length === 0 && <li className="py-2 text-center text-sm text-mute">Sin tareas todavía.</li>}
        </ul>
      </section>
    </div>
  );
}
