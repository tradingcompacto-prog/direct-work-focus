import { useQuery } from "@tanstack/react-query";
import type { PublicacionRRSS } from "@/types/database";
import { supabase } from "@/lib/supabase";
import { invalidateKeys } from "@/lib/qc";
import { toast } from "sonner";

// Plan de Contenido RRSS: la tabla `publicaciones_rrss` cuelga de una
// TAREA SOMBRILLA (tarea_id). Ver decisión Tanda 6 del replanteo:
// 1 tarea "Plan contenido <mes>" + N filas en publicaciones_rrss.

function fail(op: string, err: unknown) {
  const msg = err instanceof Error ? err.message : String(err);
  console.error(`[plan-rrss:${op}]`, err);
  toast.error(`No se pudo ${op}: ${msg}`);
}

function done() {
  invalidateKeys(["plan-rrss"]);
}

function rowToPub(r: Record<string, unknown>): PublicacionRRSS {
  return {
    id: r.id as string,
    tarea_id: (r.tarea_id as string | undefined) ?? undefined,
    fecha: (r.fecha as string) ?? "",
    hora: (r.hora as string | null) ?? null,
    tipo: r.tipo as PublicacionRRSS["tipo"],
    formato: r.formato as PublicacionRRSS["formato"],
    plataformas: (r.plataformas as PublicacionRRSS["plataformas"]) ?? [],
    briefing: (r.briefing as string | undefined) ?? undefined,
    slides: (r.slides as string[] | undefined) ?? undefined,
    estado: (r.estado as PublicacionRRSS["estado"]) ?? "borrador",
  };
}

/** React Query hook: publicaciones de una tarea sombrilla. */
export function usePlanRRSS(tareaId?: string) {
  return useQuery<PublicacionRRSS[]>({
    queryKey: ["plan-rrss", tareaId],
    enabled: !!tareaId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("publicaciones_rrss")
        .select("*")
        .eq("tarea_id", tareaId!)
        .order("fecha", { ascending: true });
      if (error) throw error;
      return ((data ?? []) as Record<string, unknown>[]).map(rowToPub);
    },
  });
}

export function addPublicacion(
  ctx: { tareaId: string; entregaId: string; clienteId: string },
  pub: Omit<PublicacionRRSS, "id">,
) {
  const row = {
    tarea_id: ctx.tareaId,
    entrega_id: ctx.entregaId,
    cliente_id: ctx.clienteId,
    fecha: pub.fecha,
    hora: pub.hora ?? null,
    tipo: pub.tipo,
    formato: pub.formato,
    plataformas: pub.plataformas,
    briefing: pub.briefing ?? null,
    slides: pub.slides ?? null,
    estado: pub.estado ?? "borrador",
  };
  supabase
    .from("publicaciones_rrss")
    .insert(row)
    .then(({ error }) => (error ? fail("crear publicación", error) : done()));
}

export function updatePublicacion(
  _tareaId: string,
  id: string,
  patch: Partial<PublicacionRRSS>,
) {
  const row: Record<string, unknown> = { ...patch };
  delete row.id;
  delete row.tarea_id;
  supabase
    .from("publicaciones_rrss")
    .update(row)
    .eq("id", id)
    .then(({ error }) => (error ? fail("actualizar publicación", error) : done()));
}

export function removePublicacion(_tareaId: string, id: string) {
  supabase
    .from("publicaciones_rrss")
    .delete()
    .eq("id", id)
    .then(({ error }) => (error ? fail("eliminar publicación", error) : done()));
}

export async function duplicarPublicacion(
  ctx: { tareaId: string; entregaId: string; clienteId: string },
  id: string,
) {
  const { data, error } = await supabase
    .from("publicaciones_rrss")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) {
    fail("duplicar publicación", error ?? new Error("No encontrada"));
    return;
  }
  const orig = data as Record<string, unknown>;
  const row = {
    tarea_id: ctx.tareaId,
    entrega_id: (orig.entrega_id as string | null) ?? ctx.entregaId,
    cliente_id: (orig.cliente_id as string | null) ?? ctx.clienteId,
    fecha: orig.fecha,
    hora: orig.hora,
    tipo: orig.tipo,
    formato: orig.formato,
    plataformas: orig.plataformas,
    briefing: orig.briefing,
    slides: orig.slides,
    estado: orig.estado ?? "borrador",
  };
  const { error: e2 } = await supabase.from("publicaciones_rrss").insert(row);
  if (e2) fail("duplicar publicación", e2);
  else done();
}