# Order

Organizador personal: **hábitos** (heatmap anual), **planes** (lugar, fecha, presupuesto, notas, tareas),
**proyectos** con tareas y **spots** guardados (correr, citas, amigos). Next.js 15 + Supabase + Vercel.

## Setup

1. **Supabase**: ejecuta en el SQL Editor, en orden, `supabase/migrations/0001_init.sql` y
   `supabase/migrations/0002_life.sql` (las tablas de pedidos de `0001` ya no se usan).
2. **Variables**: copia `.env.example` a `.env.local` con `NEXT_PUBLIC_SUPABASE_URL` y
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. **Local**: `npm install && npm run dev`.
4. **Vercel**: importa el repo y añade las mismas variables; cada push a `main` despliega.

CI (`.github/workflows/ci.yml`) ejecuta typecheck y build en cada push/PR.
