import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SubmitButton } from "@/components/ui";
import Menu from "@/components/Menu";
import MovieSearch from "@/components/MovieSearch";
import PageHeader from "@/components/PageHeader";
import { Sheet, addButton } from "@/components/Sheet";
import { addMovie, deleteMovie, moveMovie, type List } from "./actions";

type Movie = { id: string; list: List; title: string; year: number | null; kind: string | null; poster: string | null; imdb_id: string | null };

const TABS: { value: List; label: string }[] = [
  { value: "favorite", label: "Favoritas" },
  { value: "watchlist", label: "Por ver" },
];

export default async function Movies({ searchParams }: { searchParams: Promise<{ l?: string }> }) {
  const { l } = await searchParams;
  const list: List = l === "watchlist" ? "watchlist" : "favorite";
  const supabase = await createClient();
  const { data } = await supabase
    .from("movies")
    .select("id, list, title, year, kind, poster, imdb_id")
    .order("created_at", { ascending: false })
    .returns<Movie[]>();
  const all = data ?? [];
  const movies = all.filter((m) => m.list === list);
  const other: List = list === "favorite" ? "watchlist" : "favorite";

  return (
    <div className="space-y-3">
      <PageHeader title="Películas">
        <Sheet title={list === "favorite" ? "Añadir a Favoritas" : "Añadir a Por ver"} label="Añadir película" trigger="+" triggerClassName={addButton}>
          <MovieSearch add={addMovie.bind(null, list)} existing={movies.map((m) => m.imdb_id).filter((x): x is string => !!x)} />
        </Sheet>
      </PageHeader>

      <div className="glass relative flex w-fit rounded-full p-1 text-sm">
        <span
          aria-hidden
          className="absolute top-1 bottom-1 left-1 w-28 rounded-full bg-white/15 transition-transform duration-300 ease-[cubic-bezier(0.3,1.3,0.5,1)]"
          style={{ transform: list === "watchlist" ? "translateX(100%)" : "none" }}
        />
        {TABS.map((t) => (
          <Link
            key={t.value}
            href={t.value === "favorite" ? "/movies" : "/movies?l=watchlist"}
            className={`relative w-28 rounded-full py-1.5 text-center transition-colors duration-300 ${list === t.value ? "text-white" : "text-mute"}`}
          >
            {t.label} <span className="text-xs text-mute">{all.filter((m) => m.list === t.value).length}</span>
          </Link>
        ))}
      </div>

      {movies.length > 0 ? (
        <ul className="grid grid-cols-3 gap-x-3 gap-y-4 sm:grid-cols-4">
          {movies.map((m, i) => (
            <li key={m.id} className="relative animate-rise has-[[aria-expanded=true]]:z-20" style={{ animationDelay: `${i * 30}ms` }}>
              <div className="aspect-[2/3] overflow-hidden rounded-xl bg-white/5 shadow-lg">
                {m.poster ? (
                  <img src={m.poster} alt={m.title} loading="lazy" className="size-full object-cover" />
                ) : (
                  <div className="grid size-full place-items-center p-2 text-center text-sm text-mute">{m.title}</div>
                )}
              </div>
              <div className="absolute right-1 top-1 rounded-full bg-black/55 backdrop-blur">
                <Menu>
                  <form action={moveMovie.bind(null, m.id, other)}>
                    <SubmitButton className="menu-item">{list === "watchlist" ? "✓ La vi → Favoritas" : "Mover a Por ver"}</SubmitButton>
                  </form>
                  {m.imdb_id && (
                    <a href={`https://www.imdb.com/title/${m.imdb_id}/`} target="_blank" rel="noreferrer" className="menu-item">Ver en IMDb</a>
                  )}
                  <form action={deleteMovie.bind(null, m.id)}>
                    <SubmitButton className="menu-item danger">Eliminar</SubmitButton>
                  </form>
                </Menu>
              </div>
              <p className="mt-1.5 truncate text-sm">{m.title}</p>
              {m.year && <p className="text-xs text-mute">{m.year}</p>}
            </li>
          ))}
        </ul>
      ) : (
        <p className="glass animate-rise p-8 text-center text-sm text-mute">
          {list === "favorite" ? "Aún no hay favoritas." : "Tu lista de por ver está vacía."} Toca + para buscar una película.
        </p>
      )}
    </div>
  );
}
