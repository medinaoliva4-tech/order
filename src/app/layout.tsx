import "./globals.css";
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "./actions";

export const metadata: Metadata = { title: "Order", description: "Gestión de pedidos" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return (
    <html lang="es">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <header className="border-b bg-white">
          <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
            <Link href="/" className="text-lg font-semibold">Order</Link>
            {user && (
              <div className="flex items-center gap-3 text-sm">
                <span className="hidden text-slate-500 sm:inline">{user.email}</span>
                <form action={signOut}>
                  <button className="rounded-md border px-3 py-1.5 hover:bg-slate-100">Salir</button>
                </form>
              </div>
            )}
          </div>
        </header>
        <main className="mx-auto max-w-4xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
