"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function resetWidgetToken() {
  const supabase = await createClient();
  await supabase.from("widget_tokens").delete().not("token", "is", null);
  revalidatePath("/widget");
}
