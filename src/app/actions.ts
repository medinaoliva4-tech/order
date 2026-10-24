"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signIn(_: string | null, form: FormData) {
  const supabase = await createClient();
  const creds = { email: String(form.get("email")), password: String(form.get("password")) };
  const { error } =
    form.get("mode") === "signup" ? await supabase.auth.signUp(creds) : await supabase.auth.signInWithPassword(creds);
  if (error) return error.message;
  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
