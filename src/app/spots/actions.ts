"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createSpot(form: FormData) {
  const name = String(form.get("name") ?? "").trim();
  if (!name) return;
  const supabase = await createClient();
  await supabase.from("spots").insert({
    name,
    category: String(form.get("category") || "other"),
    detail: String(form.get("detail") ?? "").trim() || null,
    link: String(form.get("link") ?? "").trim() || null,
    country: String(form.get("country") ?? "").trim() || null,
    ticket_link: String(form.get("ticket_link") ?? "").trim() || null,
    stay_link: String(form.get("stay_link") ?? "").trim() || null,
  });
  revalidatePath("/spots");
}

export async function toggleFavorite(id: string, favorite: boolean) {
  const supabase = await createClient();
  await supabase.from("spots").update({ favorite }).eq("id", id);
  revalidatePath("/spots");
}

export async function deleteSpot(id: string) {
  const supabase = await createClient();
  await supabase.from("spots").delete().eq("id", id);
  revalidatePath("/spots");
}

export async function createCategory(form: FormData) {
  const name = String(form.get("name") ?? "").trim();
  if (!name) return;
  const supabase = await createClient();
  await supabase.from("spot_categories").insert({ name, icon: String(form.get("icon") ?? "").trim().slice(0, 2) || "📍" });
  revalidatePath("/spots");
}

export async function deleteCategory(id: string) {
  const supabase = await createClient();
  await supabase.from("spots").update({ category: "other" }).eq("category", id);
  await supabase.from("spot_categories").delete().eq("id", id);
  revalidatePath("/spots");
}
