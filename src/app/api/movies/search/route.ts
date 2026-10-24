import { NextResponse } from "next/server";

export type MovieResult = { imdb_id: string | null; title: string; year: number | null; kind: string | null; poster: string | null };

const KINDS: Record<string, string> = { movie: "Película", tvMovie: "Película TV", tvSeries: "Serie", tvMiniSeries: "Miniserie" };
type Suggestion = { id?: string; l?: string; y?: number; qid?: string; i?: { imageUrl?: string } };

// Proxies IMDb's public title suggestions (no API key). Returns [] on any failure so the UI can fall back to manual entry.
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json([]);
  try {
    const res = await fetch(`https://v3.sg.media-imdb.com/suggestion/x/${encodeURIComponent(q.toLowerCase())}.json`, {
      next: { revalidate: 86400 },
    });
    const data: { d?: Suggestion[] } = await res.json();
    const results: MovieResult[] = (data.d ?? [])
      .filter((s) => s.qid && s.qid in KINDS && s.id?.startsWith("tt") && s.l)
      .slice(0, 8)
      .map((s) => ({
        imdb_id: s.id!,
        title: s.l!,
        year: s.y ?? null,
        kind: KINDS[s.qid!],
        poster: s.i?.imageUrl ? s.i.imageUrl.replace(/\._V1_.*\.jpg$/, "._V1_UX300_.jpg") : null,
      }));
    return NextResponse.json(results);
  } catch {
    return NextResponse.json([]);
  }
}
