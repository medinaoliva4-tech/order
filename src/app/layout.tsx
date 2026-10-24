import "./globals.css";
import type { Metadata, Viewport } from "next";
import { createClient } from "@/lib/supabase/server";
import Nav from "@/components/Nav";
import { signOut } from "./actions";

export const metadata: Metadata = {
  title: "Order",
  description: "Hábitos, planes, proyectos y spots",
  appleWebApp: { capable: true, title: "Order", statusBarStyle: "black-translucent" },
  icons: { icon: "/icon-192.png", apple: "/apple-touch-icon.png" },
};
export const viewport: Viewport = { themeColor: "#0a0a0c", viewportFit: "cover" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return (
    <html lang="es">
      <body className="min-h-screen antialiased">
        <header className="mx-auto flex max-w-3xl items-center justify-between px-5 pt-[max(1.5rem,env(safe-area-inset-top))]">
          <span className="text-sm tracking-[0.35em] text-mute">ORDER</span>
          {user && (
            <form action={signOut}>
              <button className="text-xs text-mute hover:text-white">Salir</button>
            </form>
          )}
        </header>
        <main className="mx-auto max-w-3xl px-5 pb-[calc(8rem+env(safe-area-inset-bottom))] pt-4">{children}</main>
        {user && <Nav />}
      </body>
    </html>
  );
}
