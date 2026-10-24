import "./globals.css";
import type { Metadata, Viewport } from "next";
import { createClient } from "@/lib/supabase/server";
import Nav from "@/components/Nav";
import { signOut } from "./actions";

export const metadata: Metadata = { title: "Order", description: "Hábitos, planes, proyectos y spots" };
export const viewport: Viewport = { themeColor: "#0a0a0c" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return (
    <html lang="es">
      <body className="min-h-screen antialiased">
        <header className="mx-auto flex max-w-3xl items-center justify-between px-5 pt-6">
          <span className="text-sm tracking-[0.35em] text-mute">ORDER</span>
          {user && (
            <form action={signOut}>
              <button className="text-xs text-mute hover:text-white">Salir</button>
            </form>
          )}
        </header>
        <main className="mx-auto max-w-3xl px-5 pb-32 pt-4">{children}</main>
        {user && <Nav />}
      </body>
    </html>
  );
}
