import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { widgetScript } from "@/lib/widgetScript";
import CopyButton from "@/components/CopyButton";
import { resetWidgetToken } from "./actions";

export default async function WidgetPage() {
  const supabase = await createClient();
  let { data } = await supabase.from("widget_tokens").select("token").maybeSingle();
  if (!data) ({ data } = await supabase.from("widget_tokens").insert({}).select("token").single());
  const h = await headers();
  const appUrl = `https://${h.get("x-forwarded-host") ?? h.get("host")}`;

  if (!data) {
    return <p className="glass p-6 text-mute">No se pudo crear el token. ¿Ejecutaste <code>0003_widget.sql</code> en Supabase?</p>;
  }
  const script = widgetScript(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, data.token, appUrl);
  const steps = [
    "Instala Scriptable desde la App Store (gratis).",
    "Copia el script con el botón de abajo.",
    "En Scriptable toca +, pega el script y llámalo “Order”.",
    "En la pantalla de inicio mantén pulsado → Editar → Añadir widget → Scriptable (pequeño, mediano o grande).",
    "Mantén pulsado el widget → Editar widget → Script: Order.",
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-light">Widget</h1>
      <ol className="glass space-y-3 p-5 text-sm">
        {steps.map((s, i) => (
          <li key={i} className="flex gap-3">
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-white/10 text-xs text-accent">{i + 1}</span>
            <span>{s}</span>
          </li>
        ))}
      </ol>
      <CopyButton text={script} />
      <p className="text-xs text-mute">
        El script lleva un token personal que solo permite leer el resumen del widget (hábitos, tareas abiertas y próximo plan).
        Tocar el widget abre la app.
      </p>
      <form action={resetWidgetToken}>
        <button className="text-xs text-mute hover:text-red-400">Regenerar token (el widget actual dejará de funcionar)</button>
      </form>
    </div>
  );
}
