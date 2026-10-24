"use client";
import { createContext, useContext, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";

const SheetCtx = createContext<() => void>(() => {});

// Bottom sheet (centered dialog on wide screens) opened from a header button.
export function Sheet({
  title, trigger, triggerClassName, label, children,
}: { title: string; trigger: React.ReactNode; triggerClassName: string; label: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  const close = () => ref.current?.close();
  return (
    <SheetCtx.Provider value={close}>
      <button type="button" aria-label={label} onClick={() => ref.current?.showModal()} className={triggerClassName}>
        {trigger}
      </button>
      <dialog ref={ref} className="sheet" onClick={(e) => e.target === ref.current && close()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg">{title}</h2>
          <button type="button" onClick={close} className="text-sm text-mute transition hover:text-white">Cancelar</button>
        </div>
        {children}
      </dialog>
    </SheetCtx.Provider>
  );
}

function CloseWhenDone() {
  const close = useContext(SheetCtx);
  const { pending } = useFormStatus();
  const was = useRef(false);
  useEffect(() => {
    if (was.current && !pending) close();
    was.current = pending;
  }, [pending, close]);
  return null;
}

// Form inside a Sheet: the sheet closes once the server action finishes.
export function SheetForm({ action, className, children }: { action: (form: FormData) => void | Promise<void>; className?: string; children: React.ReactNode }) {
  return (
    <form action={action} className={className}>
      {children}
      <CloseWhenDone />
    </form>
  );
}

export const addButton =
  "grid size-10 shrink-0 place-items-center rounded-full bg-accent text-2xl leading-none text-[#1a1700] shadow-[0_0_24px_rgba(232,215,122,0.25)] transition active:scale-90";
