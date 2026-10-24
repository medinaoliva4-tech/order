"use client";
import { useEffect, useMemo, useState, useTransition } from "react";
import { createHabit, deleteHabit, setHabitDay } from "@/app/habits";
import { addDays, iso, parse } from "@/lib/dates";
import { HabitCardSkeleton } from "@/components/Skeletons";
import { SubmitButton } from "@/components/ui";
import Menu from "@/components/Menu";
import PageHeader from "@/components/PageHeader";
import { Sheet, SheetForm, addButton } from "@/components/Sheet";

export type Habit = { id: string; name: string; emoji: string; color: string };

const COLORS = ["#e8d77a", "#7c9cff", "#a78bfa", "#4ade80", "#fb923c", "#f472b6", "#38bdf8"];
const WEEKS = 53;
const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const WD = ["D", "L", "M", "X", "J", "V", "S"];
const EMPTY = "rgba(255,255,255,0.07)";

function streak(days: Set<string>, today: string) {
  let d = days.has(today) ? today : addDays(today, -1);
  let n = 0;
  while (days.has(d)) {
    n++;
    d = addDays(d, -1);
  }
  return n;
}

function Year({ days, today, color, toggle }: { days: Set<string>; today: string; color: string; toggle: (d: string) => void }) {
  const { cells, labels } = useMemo(() => {
    const dow = (parse(today).getDay() + 6) % 7; // Monday = 0
    const start = addDays(today, -(WEEKS - 1) * 7 - dow);
    const cells = Array.from({ length: WEEKS * 7 }, (_, i) => addDays(start, i));
    const labels: { col: number; text: string }[] = [];
    let last = -1;
    for (let c = 0; c < WEEKS; c++) {
      const m = parse(cells[c * 7]).getMonth();
      if (m !== last) {
        labels.push({ col: c, text: MONTHS[m] });
        last = m;
      }
    }
    return { cells, labels: labels.filter((l, i) => i === labels.length - 1 || labels[i + 1].col - l.col >= 3) };
  }, [today]);

  return (
    <div>
      <div className="relative mb-1 h-3 text-[10px] text-mute">
        {labels.map((l) => (
          <span key={l.col} className="absolute" style={{ left: `${(l.col / WEEKS) * 100}%` }}>{l.text}</span>
        ))}
      </div>
      <div className="grid gap-[2px]" style={{ gridTemplateRows: "repeat(7, 1fr)", gridAutoFlow: "column", gridAutoColumns: "1fr" }}>
        {cells.map((d) =>
          d > today ? (
            <span key={d} className="aspect-square" />
          ) : (
            <button
              key={d}
              onClick={() => toggle(d)}
              title={d}
              className="aspect-square rounded-[3px] transition-[background-color,transform] duration-200 hover:scale-125 active:scale-90"
              style={{ background: days.has(d) ? color : EMPTY }}
            />
          ),
        )}
      </div>
    </div>
  );
}

function Week({ days, today, color, toggle }: { days: Set<string>; today: string; color: string; toggle: (d: string) => void }) {
  return (
    <div className="flex justify-between">
      {Array.from({ length: 7 }, (_, i) => addDays(today, i - 6)).map((d) => (
        <button key={d} onClick={() => toggle(d)} className="flex flex-col items-center gap-1.5">
          <span className="text-[10px] text-mute">{WD[parse(d).getDay()]}</span>
          <span
            className="grid size-9 place-items-center rounded-full text-sm transition-[background-color,color,transform] duration-200 hover:scale-105 active:scale-90"
            style={{ background: days.has(d) ? color : EMPTY, color: days.has(d) ? "#111" : "#8b8b92" }}
          >
            {parse(d).getDate()}
          </span>
        </button>
      ))}
    </div>
  );
}

function HabitCard({ habit, initial, view, today, index }: { habit: Habit; initial: string[]; view: "year" | "week"; today: string; index: number }) {
  const [days, setDays] = useState(() => new Set(initial));
  const [removing, setRemoving] = useState(false);
  const [, start] = useTransition();
  const toggle = (day: string) => {
    const on = !days.has(day);
    setDays((prev) => {
      const next = new Set(prev);
      if (on) next.add(day);
      else next.delete(day);
      return next;
    });
    start(() => setHabitDay(habit.id, day, on));
  };
  const doneToday = days.has(today);
  return (
    <section
      className={`glass animate-rise space-y-3 p-4 transition-all duration-300 ${removing ? "scale-95 opacity-0" : ""}`}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-center gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl text-lg" style={{ background: `${habit.color}22` }}>{habit.emoji}</span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{habit.name}</p>
          <p className="text-xs text-mute">🔥 {streak(days, today)} · {days.size} días</p>
        </div>
        <Menu>
          <form action={deleteHabit.bind(null, habit.id)} onSubmit={(e) => (confirm(`¿Eliminar "${habit.name}"?`) ? setRemoving(true) : e.preventDefault())}>
            <SubmitButton className="menu-item danger">Eliminar hábito</SubmitButton>
          </form>
        </Menu>
        <button
          onClick={() => toggle(today)}
          aria-label="Marcar hoy"
          className={`grid size-10 shrink-0 place-items-center rounded-xl border text-lg transition-[background-color,color,box-shadow] duration-200 active:scale-90 ${doneToday ? "animate-pop" : ""}`}
          style={{
            borderColor: habit.color,
            background: doneToday ? habit.color : "transparent",
            color: doneToday ? "#111" : habit.color,
            boxShadow: doneToday ? `0 0 18px ${habit.color}55` : "none",
          }}
        >
          ✓
        </button>
      </div>
      <div key={view} className="animate-fade">
        {view === "year" ? (
          <Year days={days} today={today} color={habit.color} toggle={toggle} />
        ) : (
          <Week days={days} today={today} color={habit.color} toggle={toggle} />
        )}
      </div>
    </section>
  );
}

export default function HabitsView({ habits, logs }: { habits: Habit[]; logs: Record<string, string[]> }) {
  const [view, setView] = useState<"year" | "week">("year");
  const [today, setToday] = useState<string | null>(null);
  useEffect(() => setToday(iso(new Date())), []);

  return (
    <div className="space-y-3">
      <PageHeader title="Hábitos">
        <div className="glass relative flex rounded-full p-1 text-xs">
          <span
            aria-hidden
            className="absolute top-1 bottom-1 left-1 w-16 rounded-full bg-white/15 transition-transform duration-300 ease-[cubic-bezier(0.3,1.3,0.5,1)]"
            style={{ transform: view === "year" ? "translateX(100%)" : "none" }}
          />
          {(["week", "year"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`relative w-16 rounded-full py-1.5 transition-colors duration-300 ${view === v ? "text-white" : "text-mute"}`}
            >
              {v === "year" ? "Año" : "Semana"}
            </button>
          ))}
        </div>
        <Sheet title="Nuevo hábito" label="Nuevo hábito" trigger="+" triggerClassName={addButton}>
          <SheetForm action={createHabit} className="space-y-4">
            <div className="flex gap-2">
              <input name="emoji" placeholder="🏃" maxLength={2} className="field w-16 text-center" />
              <input name="name" required placeholder="Nombre del hábito" className="field" />
            </div>
            <div className="flex gap-2">
              {COLORS.map((c, i) => (
                <label key={c}>
                  <input type="radio" name="color" value={c} defaultChecked={i === 0} className="peer sr-only" />
                  <span className="block size-8 cursor-pointer rounded-full ring-white ring-offset-2 ring-offset-[#141416] transition peer-checked:scale-110 peer-checked:ring-2" style={{ background: c }} />
                </label>
              ))}
            </div>
            <SubmitButton className="btn btn-accent w-full">Crear hábito</SubmitButton>
          </SheetForm>
        </Sheet>
      </PageHeader>

      {today
        ? habits.map((h, i) => <HabitCard key={h.id} habit={h} initial={logs[h.id] ?? []} view={view} today={today} index={i} />)
        : habits.map((h) => <HabitCardSkeleton key={h.id} />)}
      {habits.length === 0 && (
        <div className="glass animate-rise space-y-1 p-8 text-center">
          <p className="text-2xl">✦</p>
          <p>Crea tu primer hábito</p>
          <p className="text-sm text-mute">Toca + arriba para empezar tu racha.</p>
        </div>
      )}
    </div>
  );
}
