import { createClient } from "@/lib/supabase/server";
import DreamCalculator, { type Stream } from "@/components/DreamCalculator";
import PageHeader from "@/components/PageHeader";
import { Sheet, SheetForm, addButton } from "@/components/Sheet";
import { SubmitButton } from "@/components/ui";
import { addStream, saveSettings } from "./actions";

const CURRENCIES = ["USD", "MXN", "EUR"];

export default async function Dream() {
  const supabase = await createClient();
  const [{ data: streams }, { data: settings }] = await Promise.all([
    supabase.from("dream_streams").select("id, source, name, price, clients").order("created_at").returns<Stream[]>(),
    supabase.from("dream_settings").select("goal, currency").maybeSingle(),
  ]);
  const rows = (streams ?? []).map((s) => ({ ...s, price: Number(s.price) }));
  const goal = Number(settings?.goal ?? 0);
  const currency = settings?.currency ?? "USD";
  const sources = [...new Set(["Inherent", ...rows.map((s) => s.source)])];

  return (
    <div className="space-y-3">
      <PageHeader title="Dream">
        <Sheet title="Meta y moneda" label="Meta y moneda" trigger="Meta" triggerClassName="btn">
          <SheetForm action={saveSettings} className="grid gap-3">
            <label className="space-y-1.5 text-sm text-mute">
              <span>Salario soñado al mes</span>
              <input name="goal" type="number" min={0} step="1" defaultValue={goal || ""} placeholder="10000" className="field" />
            </label>
            <label className="space-y-1.5 text-sm text-mute">
              <span>Moneda</span>
              <select name="currency" defaultValue={currency} className="field">
                {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </label>
            <SubmitButton className="btn btn-accent">Guardar</SubmitButton>
          </SheetForm>
        </Sheet>
        <Sheet title="Nuevo ingreso" label="Nuevo ingreso" trigger="+" triggerClassName={addButton}>
          <SheetForm action={addStream} className="grid gap-3">
            <input name="source" list="dream-sources" defaultValue="Inherent" placeholder="Fuente (Inherent…)" className="field" />
            <datalist id="dream-sources">
              {sources.map((s) => <option key={s} value={s} />)}
            </datalist>
            <input name="name" required placeholder="Servicio (Web, Branding, Retainer…)" className="field" />
            <div className="grid grid-cols-2 gap-3">
              <input name="price" type="number" min={0} step="any" required placeholder={`Precio / mes (${currency})`} className="field" />
              <input name="clients" type="number" min={0} step="1" placeholder="Clientes" className="field" />
            </div>
            <SubmitButton className="btn btn-accent">Añadir</SubmitButton>
          </SheetForm>
        </Sheet>
      </PageHeader>
      <DreamCalculator streams={rows} goal={goal} currency={currency} />
    </div>
  );
}
