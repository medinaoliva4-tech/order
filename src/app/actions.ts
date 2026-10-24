"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Status = "pending" | "preparing" | "ready" | "delivered" | "cancelled";

export async function signIn(_: string | null, form: FormData) {
  const supabase = await createClient();
  const creds = { email: String(form.get("email")), password: String(form.get("password")) };
  const mode = form.get("mode");
  const { error } =
    mode === "signup" ? await supabase.auth.signUp(creds) : await supabase.auth.signInWithPassword(creds);
  if (error) return error.message;
  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function createOrder(form: FormData) {
  const supabase = await createClient();
  const names = form.getAll("name").map(String);
  const qtys = form.getAll("quantity").map(Number);
  const prices = form.getAll("unit_price").map(Number);
  const items = names
    .map((name, i) => ({ name: name.trim(), quantity: qtys[i], unit_price: prices[i] }))
    .filter((it) => it.name && it.quantity > 0 && it.unit_price >= 0);
  const customer = String(form.get("customer")).trim();
  if (!customer || items.length === 0) throw new Error("Cliente y al menos un producto son obligatorios");

  const { data: order, error } = await supabase
    .from("orders")
    .insert({ customer, notes: String(form.get("notes") || "") || null })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  const { error: e2 } = await supabase.from("order_items").insert(items.map((it) => ({ ...it, order_id: order.id })));
  if (e2) throw new Error(e2.message);
  revalidatePath("/");
  redirect(`/orders/${order.id}`);
}

export async function setStatus(id: string, status: Status) {
  const supabase = await createClient();
  await supabase.from("orders").update({ status }).eq("id", id);
  revalidatePath("/");
  revalidatePath(`/orders/${id}`);
}

export async function deleteOrder(id: string) {
  const supabase = await createClient();
  await supabase.from("orders").delete().eq("id", id);
  revalidatePath("/");
  redirect("/");
}
