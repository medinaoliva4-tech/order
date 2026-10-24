import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge, STATUSES, money } from "@/lib/status";
import type { Status } from "./actions";

type Row = {
  id: string; customer: string; status: Status; created_at: string;
  order_items: { quantity: number; unit_price: number }[];
};

export default async function Home({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select("id, customer, status, created_at, order_items(quantity, unit_price)")
    .order("created_at", { ascending: false })
    .returns<Row[]>();
  const all = data ?? [];
  const total = (r: Row) => r.order_items.reduce((s, i) => s + i.quantity * i.unit_price, 0);
  const rows = status ? all.filter((r) => r.status === status) : all;
  const open = all.filter((r) => r.status === "pending" || r.status === "preparing").length;
  const revenue = all.filter((r) => r.status !== "cancelled").reduce((s, r) => s + total(r), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Pedidos</h1>
        <Link href="/orders/new" className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white">+ Nuevo pedido</Link>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[["Total", all.length], ["Abiertos", open], ["Facturado", money(revenue)]].map(([l, v]) => (
          <div key={l as string} className="rounded-xl border bg-white p-4">
            <p className="text-xs text-slate-500">{l}</p>
            <p className="text-xl font-semibold">{v}</p>
          </div>
        ))}
      </div>
      <nav className="flex flex-wrap gap-2 text-sm">
        <Link href="/" className={`rounded-full border px-3 py-1 ${!status ? "bg-slate-900 text-white" : "bg-white"}`}>Todos</Link>
        {STATUSES.map((s) => (
          <Link key={s.value} href={`/?status=${s.value}`}
            className={`rounded-full border px-3 py-1 ${status === s.value ? "bg-slate-900 text-white" : "bg-white"}`}>{s.label}</Link>
        ))}
      </nav>
      <ul className="divide-y rounded-xl border bg-white">
        {rows.length === 0 && <li className="p-6 text-center text-slate-500">No hay pedidos.</li>}
        {rows.map((r) => (
          <li key={r.id}>
            <Link href={`/orders/${r.id}`} className="flex items-center justify-between gap-3 p-4 hover:bg-slate-50">
              <div>
                <p className="font-medium">{r.customer}</p>
                <p className="text-xs text-slate-500">{new Date(r.created_at).toLocaleString("es-ES")}</p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={r.status} />
                <span className="w-20 text-right font-medium">{money(total(r))}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
