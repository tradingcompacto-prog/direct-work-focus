import * as React from "react";
import type { Tarea } from "@/types/database";
import { supabase } from "@/lib/supabase";
import { invalidateKeys } from "@/lib/qc";
import { toast } from "sonner";

// Store de mutaciones de tareas contra Supabase.
// Las firmas siguen siendo síncronas (fire-and-forget) para no romper
// los onClick existentes. La reactividad llega vía React Query +
// Realtime (canal "hub-realtime" en AuthProvider).
// useTareasVersion() se mantiene como shim local — si algún componente
// no consume useTareas() directamente, igual emitimos un tick local.

const listeners = new Set<() => void>();
let version = 0;
const emit = () => {
  version++;
  listeners.forEach((l) => l());
  invalidateKeys(["tareas"], ["mis-tareas"], ["entregas"]);
};

function fail(op: string, err: unknown) {
  const msg = err instanceof Error ? err.message : String(err);
  console.error(`[tareas:${op}]`, err);
  toast.error(`No se pudo ${op}: ${msg}`);
}

async function updateTarea(id: string, patch: Record<string, unknown>) {
  const { error } = await supabase.from("tareas").update(patch).eq("id", id);
  if (error) throw error;
}

export function setEstadoTarea(id: string, estado: Tarea["estado"]) {
  updateTarea(id, { estado }).then(emit).catch((e) => fail("cambiar estado", e));
}

export function setHorasReales(id: string, horas: number | null) {
  updateTarea(id, { horas_reales: horas }).then(emit).catch((e) => fail("guardar horas", e));
}

export function marcarParaRevisar(id: string) {
  setEstadoTarea(id, "revision");
}

export function devolverAResponsable(id: string) {
  const hoy = new Date().toISOString().slice(0, 10);
  updateTarea(id, { fecha_fin_min: hoy, fecha_fin_max: hoy, estado: "haciendola" })
    .then(emit)
    .catch((e) => fail("devolver a responsable", e));
}

export function reasignarTarea(
  id: string,
  nuevoResponsable: string,
  fechaFin: string,
) {
  const hoy = new Date().toISOString().slice(0, 10);
  updateTarea(id, {
    responsable_id: nuevoResponsable,
    fecha_inicio: hoy,
    fecha_fin_min: fechaFin,
    fecha_fin_max: fechaFin,
    estado: "activa",
  })
    .then(emit)
    .catch((e) => fail("reasignar tarea", e));
}

export function completarTarea(id: string) {
  updateTarea(id, { estado: "completada", cerrado_at: new Date().toISOString() })
    .then(emit)
    .catch((e) => fail("completar tarea", e));
}

export async function eliminarTareas(ids: string[]) {
  if (ids.length === 0) return;
  const { error } = await supabase.from("tareas").delete().in("id", ids);
  if (error) {
    fail("eliminar tareas", error);
    return;
  }
  emit();
  toast.success(ids.length === 1 ? "Tarea eliminada" : `${ids.length} tareas eliminadas`);
}

export function eliminarTarea(id: string) {
  return eliminarTareas([id]);
}

export function notifyTareasChanged() {
  emit();
}

export function useTareasVersion() {
  const [, force] = React.useReducer((x: number) => x + 1, 0);
  React.useEffect(() => {
    listeners.add(force);
    return () => {
      listeners.delete(force);
    };
  }, []);
  return version;
}