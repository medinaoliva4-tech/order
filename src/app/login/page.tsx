"use client";
import { useActionState } from "react";
import { signIn } from "../actions";
import { SubmitButton } from "@/components/ui";

export default function Login() {
  const [error, action] = useActionState(signIn, null);
  return (
    <form action={action} className="glass mx-auto mt-24 max-w-sm animate-rise space-y-4 p-7">
      <h1 className="text-2xl font-light">Entra a <span className="text-accent">Order</span></h1>
      <input name="email" type="email" required placeholder="Email" className="field" />
      <input name="password" type="password" required minLength={6} placeholder="Contraseña" className="field" />
      {error && <p key={error} className="animate-rise text-sm text-red-400">{error}</p>}
      <div className="flex gap-2">
        <SubmitButton name="mode" value="signin" className="btn btn-accent flex-1">Entrar</SubmitButton>
        <SubmitButton name="mode" value="signup" className="btn flex-1">Crear cuenta</SubmitButton>
      </div>
    </form>
  );
}
