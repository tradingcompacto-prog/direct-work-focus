import * as React from "react";
import type { Entrega } from "@/types/database";
import { supabase } from "@/lib/supabase";
import { invalidateKeys } from "@/lib/qc";
import { toast } from "sonner";

// Mutaciones de entregas contra Supabase. Mantengo aplicarOverrides()
// como identidad para no romper consumidores que aún la llaman: ahora
// la BD es la fuente de verdad y las invalidaciones de React Query +
// Realtime se encargan de refrescar.

const listeners = new Set<() => void>();
const emit = () => {
  listeners.forEach((l) => l());
  invalidateKeys(["entregas"], ["mis-entregas"]);
};

function fail(op: string, err: unknown) {
  const msg = err instanceof Error ? err.message : String(err);
  console.error(`[entregas:${op}]`, err);
  toast.error(`No se pudo ${op}: ${msg}`);
}

async function updateEntrega(id: string, patch: Record<string, unknown>) {
  const { error } = await supabase.from("entregas").update(patch).eq("id", id);
  if (error) throw error;
}

/** Compat: la BD ya es la fuente de verdad, devolvemos el array sin tocar. */
export function aplicarOverrides(entregas: Entrega[]): Entrega[] {
  return entregas;
}

export function moverEntrega(
  id: string,
  destino: "en_curso" | "hoy" | "semana" | "mes" | "reabrir",
) {
  if (destino === "en_curso" || destino === "reabrir") {
    updateEntrega(id, { estado: "en_curso", fecha_cierre: null })
      .then(emit)
      .catch((e) => fail("reabrir entrega", e));
    return;
  }
  const today = new Date();
  const d = new Date(today);
  if (destino === "semana") d.setDate(today.getDate() - 2);
  if (destino === "mes") d.setDate(today.getDate() - 10);
  updateEntrega(id, { estado: "cerrada", fecha_cierre: d.toISOString().slice(0, 10) })
    .then(emit)
    .catch((e) => fail("mover entrega", e));
}

/** Cierre manual: marca la entrega como cerrada con la fecha actual. */
export function cerrarEntrega(id: string) {
  const today = new Date().toISOString().slice(0, 10);
  updateEntrega(id, { estado: "cerrada", fecha_cierre: today })
    .then(emit)
    .catch((e) => fail("cerrar entrega", e));
}

/** Reapertura: si se añade una tarea nueva a una entrega cerrada, vuelve a en curso. */
export function reabrirEntrega(id: string) {
  updateEntrega(id, { estado: "en_curso", fecha_cierre: null })
    .then(emit)
    .catch((e) => fail("reabrir entrega", e));
}

export function useEntregasOverridesVersion() {
  const [v, setV] = React.useState(0);
  React.useEffect(() => {
    const l = () => setV((x) => x + 1);
    listeners.add(l);
    return () => { listeners.delete(l); };
  }, []);
  return v;
}
