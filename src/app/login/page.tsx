"use client";
import { useActionState } from "react";
import { signIn } from "../actions";

export default function Login() {
  const [error, action, pending] = useActionState(signIn, null);
  return (
    <form action={action} className="mx-auto mt-16 max-w-sm space-y-4 rounded-xl border bg-white p-6 shadow-sm">
      <h1 className="text-xl font-semibold">Accede a Order</h1>
      <input name="email" type="email" required placeholder="Email" className="w-full rounded-md border px-3 py-2" />
      <input name="password" type="password" required minLength={6} placeholder="Contraseña" className="w-full rounded-md border px-3 py-2" />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button name="mode" value="signin" disabled={pending} className="flex-1 rounded-md bg-slate-900 py-2 text-white disabled:opacity-50">Entrar</button>
        <button name="mode" value="signup" disabled={pending} className="flex-1 rounded-md border py-2 disabled:opacity-50">Crear cuenta</button>
      </div>
    </form>
  );
}
