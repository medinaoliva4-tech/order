import "./globals.css";
import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Nav from "@/components/Nav";
import Menu from "@/components/Menu";
import { SubmitButton } from "@/components/ui";
import { signOut } from "./actions";

export const metadata: Metadata = {
  title: "Order",
  description: "Hábitos, películas, spots y dream",
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
        <header className="mx-auto flex max-w-xl items-center justify-between px-4 pt-[max(1.5rem,env(safe-area-inset-top))]">
          <span className="text-sm tracking-[0.35em] text-mute">ORDER</span>
          {user && (
            <Menu label="Ajustes">
              <Link href="/widget" className="menu-item">Widget de iPhone</Link>
              <form action={signOut}>
                <SubmitButton className="menu-item danger">Cerrar sesión</SubmitButton>
              </form>
            </Menu>
          )}
        </header>
        <main className="mx-auto max-w-xl px-4 pb-[calc(8rem+env(safe-area-inset-bottom))] pt-4">{children}</main>
        {user && <Nav />}
      </body>
    </html>
  );
}
