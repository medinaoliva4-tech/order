# Order

Organizador personal: **hábitos** (heatmap anual), **películas** (favoritas y por ver, con pósters de IMDb)
y **spots** guardados (correr, citas, amigos…, abren en Waze). Next.js 15 + Supabase + Vercel.

## Setup

1. **Supabase**: ejecuta en el SQL Editor, en orden, los archivos de `supabase/migrations/`
   (las tablas de pedidos, planes y proyectos ya no las usa la interfaz).
2. **Variables**: copia `.env.example` a `.env.local` con `NEXT_PUBLIC_SUPABASE_URL` y
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. **Local**: `npm install && npm run dev`.
4. **Vercel**: importa el repo y añade las mismas variables; cada push a `main` despliega.

CI (`.github/workflows/ci.yml`) ejecuta typecheck y build en cada push/PR.
