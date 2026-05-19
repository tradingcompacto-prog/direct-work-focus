// Antes: store en memoria de "overrides" sobre fechas/responsables.
// Ahora: las mutaciones persisten en Supabase y React Query refresca.
// Mantenemos las mismas firmas para no romper consumidores; los getters
// devuelven `undefined` (la BD ya es la fuente de verdad).

import { supabase } from "@/lib/supabase";
import { invalidateKeys } from "@/lib/qc";
import { toast } from "sonner";

export type Override = { inicio?: string; fin_min?: string; fin_max?: string };

function fail(op: string, err: unknown) {
  const msg = err instanceof Error ? err.message : String(err);
  console.error(`[fechas:${op}]`, err);
  toast.error(`No se pudo ${op}: ${msg}`);
}

function patchTarea(o: Override): Record<string, string> {
  const p: Record<string, string> = {};
  if (o.inicio !== undefined) p.fecha_inicio = o.inicio;
  if (o.fin_min !== undefined) p.fecha_fin_min = o.fin_min;
  if (o.fin_max !== undefined) p.fecha_fin_max = o.fin_max;
  return p;
}

function patchEntrega(o: Override): Record<string, string> {
  const p: Record<string, string> = {};
  if (o.inicio !== undefined) p.fecha_inicio = o.inicio;
  // En `entregas` la fecha de fin se llama `fecha_fin`. Tomamos fin_max.
  if (o.fin_max !== undefined) p.fecha_fin = o.fin_max;
  return p;
}

export function setTareaFechas(id: string, o: Override) {
  const patch = patchTarea(o);
  if (Object.keys(patch).length === 0) return;
  supabase
    .from("tareas")
    .update(patch)
    .eq("id", id)
    .then(({ error }) => {
      if (error) fail("guardar fechas de tarea", error);
      else invalidateKeys(["tareas"], ["mis-tareas"]);
    });
}

export function setEntregaFechas(id: string, o: Override) {
  const patch = patchEntrega(o);
  if (Object.keys(patch).length === 0) return;
  supabase
    .from("entregas")
    .update(patch)
    .eq("id", id)
    .then(({ error }) => {
      if (error) fail("guardar fechas de entrega", error);
      else invalidateKeys(["entregas"], ["mis-entregas"]);
    });
}

export function setResponsable(tareaId: string, personaId: string) {
  supabase
    .from("tareas")
    .update({ responsable_id: personaId })
    .eq("id", tareaId)
    .then(({ error }) => {
      if (error) fail("reasignar responsable", error);
      else invalidateKeys(["tareas"], ["mis-tareas"]);
    });
}

// Getters de compatibilidad: ya no hay overrides; la BD es la fuente.
export function getTareaOverride(_id: string): Override | undefined {
  return undefined;
}
export function getEntregaOverride(_id: string): Override | undefined {
  return undefined;
}
export function getResponsable(_tareaId: string): string | undefined {
  return undefined;
}

/** Compat: era un subscriber a los emits internos; ahora no-op. */
export function useOverrides(): void {
  // React Query (y Realtime) ya disparan re-render al cambiar los datos.
}
