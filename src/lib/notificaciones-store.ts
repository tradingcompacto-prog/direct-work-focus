import type { Notificacion } from "@/types/database";
import { supabase } from "@/lib/supabase";
import { invalidateKeys, getQueryClient } from "@/lib/qc";
import { useNotificaciones as useNotificacionesQuery } from "@/lib/queries";
import { toast } from "sonner";

// Notificaciones: lectura via React Query (useNotificaciones), mutaciones
// directas a Supabase + invalidación. Compatibilidad con el TopBar.

function fail(op: string, err: unknown) {
  const msg = err instanceof Error ? err.message : String(err);
  console.error(`[notificaciones:${op}]`, err);
  toast.error(`No se pudo ${op}: ${msg}`);
}

export function marcarLeida(id: string) {
  supabase
    .from("notificaciones")
    .update({ leida: true })
    .eq("id", id)
    .then(({ error }) => {
      if (error) fail("marcar leída", error);
      else invalidateKeys(["notificaciones"]);
    });
}

export function marcarTodasLeidas() {
  // Solo las propias no leídas.
  supabase
    .from("notificaciones")
    .update({ leida: true })
    .eq("leida", false)
    .then(({ error }) => {
      if (error) fail("marcar todas leídas", error);
      else invalidateKeys(["notificaciones"]);
    });
}

export function agregarNotificacion(
  n: Omit<Notificacion, "id" | "fecha" | "leida"> &
    Partial<Pick<Notificacion, "leida" | "fecha">>,
) {
  const row = {
    texto: n.texto,
    ruta: n.ruta ?? null,
    icono: n.icono ?? null,
    categoria: n.categoria ?? null,
    fecha: n.fecha ?? new Date().toISOString(),
    leida: n.leida ?? false,
  };
  supabase
    .from("notificaciones")
    .insert(row)
    .then(({ error }) => {
      if (error) fail("crear notificación", error);
      else invalidateKeys(["notificaciones"]);
    });
}

/** Devuelve los datos actuales de la cache (síncrono) para callers no-hook. */
export function getNotificaciones(): Notificacion[] {
  const qc = getQueryClient();
  return (qc?.getQueryData<Notificacion[]>(["notificaciones"]) ?? []);
}

/** Compat con el TopBar: ahora delega en useNotificaciones() (React Query). */
export function useNotificacionesStore() {
  const q = useNotificacionesQuery();
  return { notificaciones: q.data ?? [], version: q.dataUpdatedAt };
}
