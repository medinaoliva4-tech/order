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
