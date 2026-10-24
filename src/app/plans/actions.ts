"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();

export async function createPlan(form: FormData) {
  const title = str(form, "title");
  if (!title) return;
  const supabase = await createClient();
  const { data } = await supabase
    .from("plans")
    .insert({ title, place: str(form, "place") || null, starts_on: str(form, "starts_on") || null, budget: Number(form.get("budget")) || 0 })
    .select("id")
    .single();
  if (data) redirect(`/plans/${data.id}`);
}

export async function updatePlan(id: string, form: FormData) {
  const supabase = await createClient();
  await supabase.from("plans").update({
    title: str(form, "title") || "Plan",
    place: str(form, "place") || null,
    starts_on: str(form, "starts_on") || null,
    budget: Number(form.get("budget")) || 0,
    notes: String(form.get("notes") ?? ""),
  }).eq("id", id);
  revalidatePath(`/plans/${id}`);
}

export async function addItem(planId: string, kind: "task" | "expense", form: FormData) {
  const title = str(form, "title");
  if (!title) return;
  const supabase = await createClient();
  await supabase.from("plan_items").insert({ plan_id: planId, kind, title, amount: kind === "expense" ? Number(form.get("amount")) || 0 : 0 });
  revalidatePath(`/plans/${planId}`);
}

export async function toggleItem(planId: string, id: string, done: boolean) {
  const supabase = await createClient();
  await supabase.from("plan_items").update({ done }).eq("id", id);
  revalidatePath(`/plans/${planId}`);
}

export async function deleteItem(planId: string, id: string) {
  const supabase = await createClient();
  await supabase.from("plan_items").delete().eq("id", id);
  revalidatePath(`/plans/${planId}`);
}

export async function deletePlan(id: string) {
  const supabase = await createClient();
  await supabase.from("plans").delete().eq("id", id);
  redirect("/plans");
}
