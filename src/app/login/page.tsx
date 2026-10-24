"use client";
import { useActionState } from "react";
import { signIn } from "../actions";

export default function Login() {
  const [error, action, pending] = useActionState(signIn, null);
  return (
    <form action={action} className="glass mx-auto mt-24 max-w-sm space-y-4 p-7">
      <h1 className="text-2xl font-light">Entra a <span className="text-accent">Order</span></h1>
      <input name="email" type="email" required placeholder="Email" className="field" />
      <input name="password" type="password" required minLength={6} placeholder="Contraseña" className="field" />
      {error && <p className="text-sm text-red-400">{error}</p>}
      <div className="flex gap-2">
        <button name="mode" value="signin" disabled={pending} className="btn btn-accent flex-1 disabled:opacity-50">Entrar</button>
        <button name="mode" value="signup" disabled={pending} className="btn flex-1 disabled:opacity-50">Crear cuenta</button>
      </div>
    </form>
  );
}
