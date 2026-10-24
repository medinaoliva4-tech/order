import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge, STATUSES, money } from "@/lib/status";
import { deleteOrder, setStatus, type Status } from "@/app/actions";

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: order } = await supabase
    .from("orders")
    .select("id, customer, notes, status, created_at, order_items(id, name, quantity, unit_price)")
    .eq("id", id)
    .maybeSingle();
  if (!order) notFound();
  const items = order.order_items as { id: string; name: string; quantity: number; unit_price: number }[];
  const total = items.reduce((s, i) => s + i.quantity * i.unit_price, 0);

  return (
    <div className="space-y-6">
      <Link href="/" className="text-sm text-slate-500">← Pedidos</Link>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{order.customer}</h1>
          <p className="text-sm text-slate-500">{new Date(order.created_at).toLocaleString("es-ES")}</p>
        </div>
        <StatusBadge status={order.status as Status} />
      </div>
      <ul className="divide-y rounded-xl border bg-white">
        {items.map((i) => (
          <li key={i.id} className="flex justify-between p-4">
            <span>{i.quantity} × {i.name}</span>
            <span>{money(i.quantity * i.unit_price)}</span>
          </li>
        ))}
        <li className="flex justify-between p-4 font-semibold"><span>Total</span><span>{money(total)}</span></li>
      </ul>
      {order.notes && <p className="rounded-xl border bg-white p-4 text-sm">{order.notes}</p>}
      <div className="flex flex-wrap gap-2">
        {STATUSES.filter((s) => s.value !== order.status).map((s) => (
          <form key={s.value} action={setStatus.bind(null, order.id, s.value)}>
            <button className="rounded-md border bg-white px-3 py-1.5 text-sm hover:bg-slate-100">Marcar {s.label.toLowerCase()}</button>
          </form>
        ))}
        <form action={deleteOrder.bind(null, order.id)} className="ml-auto">
          <button className="rounded-md border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50">Eliminar</button>
        </form>
      </div>
    </div>
  );
}
