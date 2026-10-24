"use client";
import { useState } from "react";
import { createSpot } from "@/app/spots/actions";
import { SheetForm } from "@/components/Sheet";
import { SubmitButton } from "@/components/ui";

type Cat = { value: string; label: string; icon: string };

// New-spot form; trips get ticket and stay (Airbnb) links instead of a Waze address.
export default function SpotForm({ cats, countries, initial }: { cats: Cat[]; countries: string[]; initial: string }) {
  const [category, setCategory] = useState(initial);
  const trip = category === "trip";
  return (
    <SheetForm action={createSpot} className="grid gap-3">
      <input name="name" required placeholder={trip ? "Destino (Tulum, Kioto…)" : "Nombre (Parque del Retiro, Ana…)"} className="field" />
      <div className="grid grid-cols-2 gap-3">
        <select name="category" value={category} onChange={(e) => setCategory(e.target.value)} className="field">
          {cats.map((k) => <option key={k.value} value={k.value}>{k.icon} {k.label}</option>)}
        </select>
        <input name="country" list="spot-countries" placeholder="País" className="field" />
        <datalist id="spot-countries">
          {countries.map((c) => <option key={c} value={c} />)}
        </datalist>
      </div>
      {trip ? (
        <>
          <input name="ticket_link" type="url" placeholder="Enlace al boleto / vuelo" className="field" />
          <input name="stay_link" type="url" placeholder="Enlace al Airbnb / hotel" className="field" />
          <input name="detail" placeholder="Notas (fechas, presupuesto…)" className="field" />
        </>
      ) : (
        <>
          <input name="detail" placeholder="Dirección (para Waze) o nota" className="field" />
          <input name="link" type="url" placeholder="Enlace extra (opcional)" className="field" />
        </>
      )}
      <SubmitButton className="btn btn-accent">Guardar</SubmitButton>
    </SheetForm>
  );
}
