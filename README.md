# Order

App de gestión de pedidos: Next.js 15 + Supabase (Postgres, Auth, RLS) + Vercel.

## Setup

1. **Supabase**: crea un proyecto en https://supabase.com, abre *SQL Editor* y ejecuta
   `supabase/migrations/0001_init.sql` (o `supabase db push` con la CLI).
   En *Authentication → Providers → Email* desactiva "Confirm email" si quieres entrar al instante.
2. **Variables**: copia `.env.example` a `.env.local` y rellena `NEXT_PUBLIC_SUPABASE_URL` y
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` (*Project Settings → API*).
3. **Local**: `npm install && npm run dev`.
4. **Vercel**: *Add New → Project*, importa este repo de GitHub, añade las mismas dos variables
   de entorno y despliega. Cada push a `main` despliega a producción; cada PR crea un preview.
   En Supabase, *Authentication → URL Configuration*, añade tu dominio de Vercel como Site URL.

CI (`.github/workflows/ci.yml`) ejecuta typecheck y build en cada push/PR.
