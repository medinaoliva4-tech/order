"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addStream(form: FormData) {
  const name = String(form.get("name") ?? "").trim();
  if (!name) return;
  const supabase = await createClient();
  await supabase.from("dream_streams").insert({
    name,
    source: String(form.get("source") ?? "").trim() || "Inherent",
    price: Math.max(0, Number(form.get("price")) || 0),
    clients: Math.max(0, Math.floor(Number(form.get("clients")) || 0)),
  });
  revalidatePath("/dream");
}

// Called on every stepper tap / price edit; the client keeps its own state, so no revalidate.
export async function updateStream(id: string, patch: { clients?: number; price?: number }) {
  const supabase = await createClient();
  await supabase.from("dream_streams").update(patch).eq("id", id);
}

export async function deleteStream(id: string) {
  const supabase = await createClient();
  await supabase.from("dream_streams").delete().eq("id", id);
  revalidatePath("/dream");
}

export async function saveSettings(form: FormData) {
  const supabase = await createClient();
  await supabase.from("dream_settings").upsert({
    goal: Math.max(0, Number(form.get("goal")) || 0),
    currency: String(form.get("currency") || "USD"),
  });
  revalidatePath("/dream");
}

export async function addExpense(form: FormData) {
  const name = String(form.get("name") ?? "").trim();
  if (!name) return;
  const supabase = await createClient();
  await supabase.from("dream_expenses").insert({
    name,
    amount: Math.max(0, Number(form.get("amount")) || 0),
    period: form.get("period") === "year" ? "year" : "month",
  });
  revalidatePath("/dream");
}

export async function updateExpense(id: string, patch: { amount?: number; period?: "month" | "year" }) {
  const supabase = await createClient();
  await supabase.from("dream_expenses").update(patch).eq("id", id);
}

export async function deleteExpense(id: string) {
  const supabase = await createClient();
  await supabase.from("dream_expenses").delete().eq("id", id);
  revalidatePath("/dream");
}
