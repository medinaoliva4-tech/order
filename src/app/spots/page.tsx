import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createSpot, deleteSpot, toggleFavorite } from "./actions";

const CATS = [
  { value: "run", label: "Correr", icon: "🏃" },
  { value: "date", label: "Citas", icon: "🍷" },
  { value: "friend", label: "Amigos", icon: "👥" },
  { value: "other", label: "Otros", icon: "📍" },
];
type Spot = { id: string; category: string; name: string; detail: string | null; link: string | null; favorite: boolean };

export default async function Spots({ searchParams }: { searchParams: Promise<{ c?: string }> }) {
  const { c } = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.from("spots").select("id, category, name, detail, link, favorite")
    .order("favorite", { ascending: false }).order("created_at", { ascending: false }).returns<Spot[]>();
  const spots = (data ?? []).filter((s) => !c || s.category === c);
  const chip = (active: boolean) => `rounded-full border px-3 py-1.5 text-sm ${active ? "border-transparent bg-accent text-[#1a1700]" : "border-white/10 text-mute"}`;

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-light">Spots</h1>
      <div className="flex flex-wrap gap-2">
        <Link href="/spots" className={chip(!c)}>Todos</Link>
        {CATS.map((k) => <Link key={k.value} href={`/spots?c=${k.value}`} className={chip(c === k.value)}>{k.icon} {k.label}</Link>)}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {spots.map((s) => {
          const cat = CATS.find((k) => k.value === s.category)!;
          const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([s.name, s.detail].filter(Boolean).join(" "))}`;
          return (
            <article key={s.id} className="glass space-y-2 p-5">
              <div className="flex items-start justify-between gap-2">
                <p className="text-lg">{cat.icon} {s.name}</p>
                <form action={toggleFavorite.bind(null, s.id, !s.favorite)}>
                  <button className={s.favorite ? "text-accent" : "text-mute"} aria-label="Favorito">★</button>
                </form>
              </div>
              {s.detail && <p className="text-sm text-mute">{s.detail}</p>}
              <div className="flex items-center gap-3 text-xs">
                <a href={maps} target="_blank" rel="noreferrer" className="text-accent">Abrir en Maps</a>
                {s.link && <a href={s.link} target="_blank" rel="noreferrer" className="text-mute hover:text-white">Enlace</a>}
                <form action={deleteSpot.bind(null, s.id)} className="ml-auto"><button className="text-mute hover:text-red-400">Eliminar</button></form>
              </div>
            </article>
          );
        })}
      </div>
      {spots.length === 0 && <p className="glass p-6 text-center text-mute">Nada guardado aquí todavía.</p>}
      <details className="glass p-4">
        <summary className="cursor-pointer text-sm text-accent">+ Guardar spot</summary>
        <form action={createSpot} className="mt-4 grid gap-3 sm:grid-cols-2">
          <input name="name" required placeholder="Nombre (Parque del Retiro, Ana…)" className="field" />
          <select name="category" defaultValue={c ?? "run"} className="field">
            {CATS.map((k) => <option key={k.value} value={k.value}>{k.icon} {k.label}</option>)}
          </select>
          <input name="detail" placeholder="Dirección o nota" className="field sm:col-span-2" />
          <input name="link" type="url" placeholder="Enlace (opcional)" className="field sm:col-span-2" />
          <button className="btn btn-accent sm:col-span-2">Guardar</button>
        </form>
      </details>
    </div>
  );
}
