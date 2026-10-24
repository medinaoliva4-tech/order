import { createClient } from "@/lib/supabase/server";
import HabitsView, { type Habit } from "@/components/HabitsView";

export default async function Home() {
  const supabase = await createClient();
  const since = new Date(Date.now() - 400 * 864e5).toISOString().slice(0, 10);
  const [{ data: habits }, { data: logs }] = await Promise.all([
    supabase.from("habits").select("id, name, emoji, color").order("created_at").returns<Habit[]>(),
    supabase.from("habit_logs").select("habit_id, day").gte("day", since),
  ]);
  const byHabit: Record<string, string[]> = {};
  for (const l of logs ?? []) (byHabit[l.habit_id] ??= []).push(l.day);
  return <HabitsView habits={habits ?? []} logs={byHabit} />;
}
