"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { MovieResult } from "@/app/api/movies/search/route";

export type List = "favorite" | "watchlist";

export async function addMovie(list: List, m: MovieResult) {
  const title = m.title?.trim();
  if (!title) return;
  const supabase = await createClient();
  await supabase.from("movies").insert({ list, title, year: m.year, kind: m.kind, poster: m.poster, imdb_id: m.imdb_id });
  revalidatePath("/movies");
}

export async function moveMovie(id: string, list: List) {
  const supabase = await createClient();
  await supabase.from("movies").update({ list }).eq("id", id);
  revalidatePath("/movies");
}

export async function deleteMovie(id: string) {
  const supabase = await createClient();
  await supabase.from("movies").delete().eq("id", id);
  revalidatePath("/movies");
}
