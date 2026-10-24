"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createHabit(form: FormData) {
  const name = String(form.get("name")).trim();
  if (!name) return;
  const supabase = await createClient();
  await supabase.from("habits").insert({
    name,
    emoji: String(form.get("emoji") || "●").trim().slice(0, 2) || "●",
    color: String(form.get("color") || "#e8d77a"),
  });
  revalidatePath("/");
}

export async function setHabitDay(habitId: string, day: string, on: boolean) {
  const supabase = await createClient();
  if (on) await supabase.from("habit_logs").upsert({ habit_id: habitId, day });
  else await supabase.from("habit_logs").delete().eq("habit_id", habitId).eq("day", day);
}

export async function deleteHabit(id: string) {
  const supabase = await createClient();
  await supabase.from("habits").delete().eq("id", id);
  revalidatePath("/");
}
