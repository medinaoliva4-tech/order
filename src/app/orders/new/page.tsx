"use client";
import { useState } from "react";
import { createOrder } from "@/app/actions";

export default function NewOrder() {
  const [rows, setRows] = useState([0]);
  const [next, setNext] = useState(1);
  const input = "rounded-md border px-3 py-2";
  return (
    <form action={createOrder} className="space-y-4 rounded-xl border bg-white p-6">
      <h1 className="text-xl font-semibold">Nuevo pedido</h1>
      <input name="customer" required placeholder="Cliente" className={`${input} w-full`} />
      <div className="space-y-2">
        {rows.map((k) => (
          <div key={k} className="flex gap-2">
            <input name="name" placeholder="Producto" className={`${input} flex-1`} />
            <input name="quantity" type="number" min={1} defaultValue={1} className={`${input} w-20`} />
            <input name="unit_price" type="number" min={0} step="0.01" defaultValue={0} className={`${input} w-28`} />
            {rows.length > 1 && (
              <button type="button" onClick={() => setRows(rows.filter((r) => r !== k))} className="px-2 text-slate-400 hover:text-red-600">✕</button>
            )}
          </div>
        ))}
        <button type="button" onClick={() => { setRows([...rows, next]); setNext(next + 1); }} className="text-sm text-blue-600">+ Añadir producto</button>
      </div>
      <textarea name="notes" placeholder="Notas (opcional)" className={`${input} w-full`} rows={2} />
      <button className="rounded-md bg-slate-900 px-4 py-2 text-white">Crear pedido</button>
    </form>
  );
}
