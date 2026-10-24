import type { Status } from "@/app/actions";

export const STATUSES: { value: Status; label: string; color: string }[] = [
  { value: "pending", label: "Pendiente", color: "bg-amber-100 text-amber-800" },
  { value: "preparing", label: "En preparación", color: "bg-blue-100 text-blue-800" },
  { value: "ready", label: "Listo", color: "bg-violet-100 text-violet-800" },
  { value: "delivered", label: "Entregado", color: "bg-green-100 text-green-800" },
  { value: "cancelled", label: "Cancelado", color: "bg-slate-200 text-slate-600" },
];

export const statusInfo = (s: Status) => STATUSES.find((x) => x.value === s)!;
export const money = (n: number) => n.toLocaleString("es-ES", { style: "currency", currency: "EUR" });

export function StatusBadge({ status }: { status: Status }) {
  const s = statusInfo(status);
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${s.color}`}>{s.label}</span>;
}
