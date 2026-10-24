"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createProject(form: FormData) {
  const name = String(form.get("name") ?? "").trim();
  if (!name) return;
  const supabase = await createClient();
  const { data } = await supabase.from("projects").insert({ name, color: String(form.get("color") || "#7c9cff") }).select("id").single();
  if (data) redirect(`/projects/${data.id}`);
}

export async function addTask(projectId: string, form: FormData) {
  const title = String(form.get("title") ?? "").trim();
  if (!title) return;
  const supabase = await createClient();
  await supabase.from("tasks").insert({ project_id: projectId, title, due_on: String(form.get("due_on") || "") || null });
  revalidatePath(`/projects/${projectId}`);
}

export async function toggleTask(projectId: string, id: string, done: boolean) {
  const supabase = await createClient();
  await supabase.from("tasks").update({ done }).eq("id", id);
  revalidatePath(`/projects/${projectId}`);
}

export async function deleteTask(projectId: string, id: string) {
  const supabase = await createClient();
  await supabase.from("tasks").delete().eq("id", id);
  revalidatePath(`/projects/${projectId}`);
}

export async function deleteProject(id: string) {
  const supabase = await createClient();
  await supabase.from("projects").delete().eq("id", id);
  redirect("/projects");
}
