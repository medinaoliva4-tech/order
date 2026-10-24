import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SubmitButton } from "@/components/ui";
import Menu from "@/components/Menu";
import PageHeader from "@/components/PageHeader";
import { Sheet, addButton } from "@/components/Sheet";
import SpotForm from "@/components/SpotForm";
import { createCategory, deleteCategory, deleteSpot, toggleFavorite } from "./actions";

const BUILT_IN = [
  { value: "run", label: "Correr", icon: "🏃" },
  { value: "date", label: "Citas", icon: "🍷" },
  { value: "friend", label: "Amigos", icon: "👥" },
  { value: "trip", label: "Viajes", icon: "✈️" },
  { value: "other", label: "Otros", icon: "📍" },
];
type Spot = {
  id: string; category: string; name: string; detail: string | null; link: string | null; favorite: boolean;
  country?: string | null; ticket_link?: string | null; stay_link?: string | null;
};

// waze:// opens the Waze app directly (from Safari and the home-screen app) and starts navigation.
const waze = (q: string) => `waze://?q=${encodeURIComponent(q)}&navigate=yes`;

export default async function Spots({ searchParams }: { searchParams: Promise<{ c?: string }> }) {
  const { c } = await searchParams;
  const supabase = await createClient();
  const [{ data }, { data: custom }] = await Promise.all([
    // "*" so the page keeps working before the country/trip-link columns exist
    supabase.from("spots").select("*")
      .order("favorite", { ascending: false }).order("created_at", { ascending: false }).returns<Spot[]>(),
    supabase.from("spot_categories").select("id, name, icon").order("created_at").returns<{ id: string; name: string; icon: string }[]>(),
  ]);
  const cats = [...BUILT_IN, ...(custom ?? []).map((k) => ({ value: k.id, label: k.name, icon: k.icon }))];
  const catOf = (v: string) => cats.find((k) => k.value === v) ?? BUILT_IN[BUILT_IN.length - 1];
  const countries = [...new Set((data ?? []).map((s) => s.country).filter((x): x is string => !!x))].sort();
  const spots = (data ?? []).filter((s) => !c || s.category === c);
  const chip = (active: boolean) =>
    `shrink-0 rounded-full border px-3 py-1.5 text-sm transition active:scale-95 ${active ? "border-transparent bg-accent text-[#1a1700]" : "border-white/10 text-mute"}`;

  return (
    <div className="space-y-3">
      <PageHeader title="Spots">
        <Sheet title="Guardar spot" label="Guardar spot" trigger="+" triggerClassName={addButton}>
          <SpotForm cats={cats} countries={countries} initial={c && cats.some((k) => k.value === c) ? c : "run"} />
        </Sheet>
      </PageHeader>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
        <Link href="/spots" className={chip(!c)}>Todos</Link>
        {cats.map((k) => <Link key={k.value} href={`/spots?c=${k.value}`} className={chip(c === k.value)}>{k.icon} {k.label}</Link>)}
        <Sheet title="Categorías" label="Gestionar categorías" trigger="＋ Categoría" triggerClassName={`${chip(false)} border-dashed`}>
          <form action={createCategory} className="flex gap-2">
            <input name="icon" placeholder="🏖️" maxLength={2} className="field w-16 text-center" />
            <input name="name" required placeholder="Nueva categoría (Playas, Cafés…)" className="field" />
            <SubmitButton className="btn btn-accent">Crear</SubmitButton>
          </form>
          {(custom ?? []).length > 0 && (
            <ul className="mt-4 divide-y divide-white/5">
              {(custom ?? []).map((k) => (
                <li key={k.id} className="flex items-center justify-between py-2.5 text-sm">
                  <span>{k.icon} {k.name}</span>
                  <form action={deleteCategory.bind(null, k.id)}>
                    <SubmitButton className="text-mute transition hover:text-red-400" aria-label={`Eliminar ${k.name}`}>✕</SubmitButton>
                  </form>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 text-xs text-mute">Al eliminar una categoría, sus spots pasan a “Otros”.</p>
        </Sheet>
      </div>

      {spots.length > 0 ? (
        <ul className="glass divide-y divide-white/5">
          {spots.map((s, i) => {
            const cat = catOf(s.category);
            const trip = s.category === "trip";
            const route = waze([s.name, s.detail, s.country].filter(Boolean).join(", "));
            const sub = [s.detail, s.country].filter(Boolean).join(" · ");
            const head = (
              <>
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/5">{cat.icon}</span>
                <span className="min-w-0">
                  <span className="block truncate">{s.name}</span>
                  {sub && <span className="block truncate text-xs text-mute">{sub}</span>}
                </span>
              </>
            );
            const pill = "rounded-full border border-white/10 px-2.5 py-1 text-xs text-mute transition hover:text-white active:scale-95";
            return (
              <li key={s.id} className="flex animate-rise items-start gap-2 py-1 pl-4 pr-2" style={{ animationDelay: `${i * 40}ms` }}>
                <div className="min-w-0 flex-1 py-2.5">
                  {trip ? (
                    <div className="flex items-center gap-3">{head}</div>
                  ) : (
                    <a href={route} className="flex items-center gap-3 transition active:opacity-60">{head}</a>
                  )}
                  {(s.ticket_link || s.stay_link) && (
                    <div className="mt-2 flex gap-2 pl-12">
                      {s.ticket_link && <a href={s.ticket_link} target="_blank" rel="noreferrer" className={pill}>✈️ Boleto</a>}
                      {s.stay_link && <a href={s.stay_link} target="_blank" rel="noreferrer" className={pill}>🏠 Estancia</a>}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 pt-2">
                  <form action={toggleFavorite.bind(null, s.id, !s.favorite)}>
                    <SubmitButton className={`grid size-8 place-items-center text-lg transition active:scale-75 ${s.favorite ? "animate-pop text-accent" : "text-white/20 hover:text-white"}`} aria-label="Favorito">★</SubmitButton>
                  </form>
                  <Menu>
                    {!trip && <a href={route} className="menu-item">Ir con Waze</a>}
                    {s.ticket_link && <a href={s.ticket_link} target="_blank" rel="noreferrer" className="menu-item">Ver boleto</a>}
                    {s.stay_link && <a href={s.stay_link} target="_blank" rel="noreferrer" className="menu-item">Ver estancia</a>}
                    {s.link && <a href={s.link} target="_blank" rel="noreferrer" className="menu-item">Abrir enlace</a>}
                    <form action={deleteSpot.bind(null, s.id)}>
                      <SubmitButton className="menu-item danger">Eliminar</SubmitButton>
                    </form>
                  </Menu>
                </div>
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
