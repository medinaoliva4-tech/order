import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SubmitButton } from "@/components/ui";
import Menu from "@/components/Menu";
import PageHeader from "@/components/PageHeader";
import { Sheet, SheetForm, addButton } from "@/components/Sheet";
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
  const chip = (active: boolean) =>
    `shrink-0 rounded-full border px-3 py-1.5 text-sm transition active:scale-95 ${active ? "border-transparent bg-accent text-[#1a1700]" : "border-white/10 text-mute"}`;

  return (
    <div className="space-y-3">
      <PageHeader title="Spots">
        <Sheet title="Guardar spot" label="Guardar spot" trigger="+" triggerClassName={addButton}>
          <SheetForm action={createSpot} className="grid gap-3">
            <input name="name" required placeholder="Nombre (Parque del Retiro, Ana…)" className="field" />
            <select name="category" defaultValue={c ?? "run"} className="field">
              {CATS.map((k) => <option key={k.value} value={k.value}>{k.icon} {k.label}</option>)}
            </select>
            <input name="detail" placeholder="Dirección o nota" className="field" />
            <input name="link" type="url" placeholder="Enlace (opcional)" className="field" />
            <SubmitButton className="btn btn-accent">Guardar</SubmitButton>
          </SheetForm>
        </Sheet>
      </PageHeader>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
        <Link href="/spots" className={chip(!c)}>Todos</Link>
        {CATS.map((k) => <Link key={k.value} href={`/spots?c=${k.value}`} className={chip(c === k.value)}>{k.icon} {k.label}</Link>)}
      </div>

      {spots.length > 0 ? (
        <ul className="glass divide-y divide-white/5">
          {spots.map((s, i) => {
            const cat = CATS.find((k) => k.value === s.category)!;
            const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([s.name, s.detail].filter(Boolean).join(" "))}`;
            return (
              <li key={s.id} className="flex animate-rise items-center gap-2 py-1 pl-4 pr-2" style={{ animationDelay: `${i * 40}ms` }}>
                <a href={maps} target="_blank" rel="noreferrer" className="flex min-w-0 flex-1 items-center gap-3 py-2.5 transition active:opacity-60">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/5">{cat.icon}</span>
                  <span className="min-w-0">
                    <span className="block truncate">{s.name}</span>
                    {s.detail && <span className="block truncate text-xs text-mute">{s.detail}</span>}
                  </span>
                </a>
                <form action={toggleFavorite.bind(null, s.id, !s.favorite)}>
                  <SubmitButton className={`grid size-8 place-items-center text-lg transition active:scale-75 ${s.favorite ? "animate-pop text-accent" : "text-white/20 hover:text-white"}`} aria-label="Favorito">★</SubmitButton>
                </form>
                <Menu>
                  <a href={maps} target="_blank" rel="noreferrer" className="menu-item">Abrir en Maps</a>
                  {s.link && <a href={s.link} target="_blank" rel="noreferrer" className="menu-item">Abrir enlace</a>}
                  <form action={deleteSpot.bind(null, s.id)}>
                    <SubmitButton className="menu-item danger">Eliminar</SubmitButton>
                  </form>
                </Menu>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="glass animate-rise p-8 text-center text-sm text-mute">Nada guardado aquí. Toca + para añadir un spot.</p>
      )}
    </div>
  );
}
