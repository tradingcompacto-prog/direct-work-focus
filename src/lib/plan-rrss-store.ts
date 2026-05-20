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
    entrega_id: (r.entrega_id as string | undefined) ?? undefined,
    cliente_id: (r.cliente_id as string | undefined) ?? undefined,
    fecha: (r.fecha as string) ?? "",
    hora: (r.hora as string | null) ?? null,
    tipo: r.tipo as PublicacionRRSS["tipo"],
    formato: r.formato as PublicacionRRSS["formato"],
    plataformas: (r.plataformas as PublicacionRRSS["plataformas"]) ?? [],
    briefing: (r.briefing as string | null | undefined) ?? null,
    copy_final: (r.copy_final as string | null | undefined) ?? null,
    recursos_visuales:
      (r.recursos_visuales as PublicacionRRSS["recursos_visuales"]) ?? [],
    slides: (r.slides as Array<{ texto?: string; imagen_url?: string }> | undefined) ?? undefined,
    estado: (r.estado as PublicacionRRSS["estado"]) ?? "borrador",
    responsable_diseno_id: (r.responsable_diseno_id as string | null | undefined) ?? null,
    responsable_copy_id: (r.responsable_copy_id as string | null | undefined) ?? null,
    impresiones: (r.impresiones as number | null | undefined) ?? null,
    alcance: (r.alcance as number | null | undefined) ?? null,
    interacciones: (r.interacciones as number | null | undefined) ?? null,
    ctr: (r.ctr as number | null | undefined) ?? null,
    created_at: (r.created_at as string | undefined) ?? undefined,
    updated_at: (r.updated_at as string | undefined) ?? undefined,
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

/** Hook: una sola publicación por id (para PublicacionPanel). */
export function usePublicacion(publicacionId?: string | null) {
  return useQuery<PublicacionRRSS | null>({
    queryKey: ["plan-rrss-pub", publicacionId],
    enabled: !!publicacionId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("publicaciones_rrss")
        .select("*")
        .eq("id", publicacionId!)
        .maybeSingle();
      if (error) throw error;
      return data ? rowToPub(data as Record<string, unknown>) : null;
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
    responsable_diseno_id: pub.responsable_diseno_id ?? null,
    responsable_copy_id: pub.responsable_copy_id ?? null,
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
    estado: "borrador",
    responsable_diseno_id: (orig.responsable_diseno_id as string | null) ?? null,
    responsable_copy_id: (orig.responsable_copy_id as string | null) ?? null,
  };
  const { error: e2 } = await supabase.from("publicaciones_rrss").insert(row);
  if (e2) fail("duplicar publicación", e2);
  else done();
}

export function setPublicacionEstado(id: string, estado: NonNullable<PublicacionRRSS["estado"]>) {
  supabase
    .from("publicaciones_rrss")
    .update({ estado })
    .eq("id", id)
    .then(({ error }) => (error ? fail("cambiar estado", error) : done()));
}

export function setPublicacionResponsable(
  id: string,
  tipo: "diseno" | "copy",
  userId: string | null,
) {
  const patch =
    tipo === "diseno"
      ? { responsable_diseno_id: userId }
      : { responsable_copy_id: userId };
  supabase
    .from("publicaciones_rrss")
    .update(patch)
    .eq("id", id)
    .then(({ error }) => (error ? fail("asignar responsable", error) : done()));
}

export function setPublicacionCopy(id: string, copy_final: string | null) {
  supabase
    .from("publicaciones_rrss")
    .update({ copy_final: copy_final?.trim() || null })
    .eq("id", id)
    .then(({ error }) => (error ? fail("guardar copy", error) : done()));
}

export function setPublicacionRecursos(
  id: string,
  recursos: NonNullable<PublicacionRRSS["recursos_visuales"]>,
) {
  supabase
    .from("publicaciones_rrss")
    .update({ recursos_visuales: recursos })
    .eq("id", id)
    .then(({ error }) => (error ? fail("guardar recursos", error) : done()));
}

export async function addRecursoVisual(
  id: string,
  recurso: NonNullable<PublicacionRRSS["recursos_visuales"]>[number],
) {
  const { data, error } = await supabase
    .from("publicaciones_rrss")
    .select("recursos_visuales")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return fail("añadir recurso", error);
  const arr = (data.recursos_visuales as NonNullable<PublicacionRRSS["recursos_visuales"]>) ?? [];
  setPublicacionRecursos(id, [...arr, recurso]);
}

export async function removeRecursoVisual(id: string, index: number) {
  const { data, error } = await supabase
    .from("publicaciones_rrss")
    .select("recursos_visuales")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return fail("quitar recurso", error);
  const arr = (data.recursos_visuales as NonNullable<PublicacionRRSS["recursos_visuales"]>) ?? [];
  setPublicacionRecursos(id, arr.filter((_, i) => i !== index));
}

export async function bulkUpdatePublicaciones(
  ids: string[],
  patch: Partial<PublicacionRRSS>,
) {
  if (ids.length === 0) return;
  const row: Record<string, unknown> = { ...patch };
  delete row.id;
  delete row.tarea_id;
  const { error } = await supabase
    .from("publicaciones_rrss")
    .update(row)
    .in("id", ids);
  if (error) fail("actualizar publicaciones", error);
  else done();
}

export async function bulkShiftFechas(ids: string[], dias: number) {
  if (ids.length === 0 || dias === 0) return;
  const { data, error } = await supabase
    .from("publicaciones_rrss")
    .select("id, fecha")
    .in("id", ids);
  if (error || !data) {
    fail("desplazar fechas", error);
    return;
  }
  await Promise.all(
    data.map(async (r: { id: string; fecha: string }) => {
      const d = new Date(r.fecha);
      d.setDate(d.getDate() + dias);
      const iso = d.toISOString().slice(0, 10);
      await supabase.from("publicaciones_rrss").update({ fecha: iso }).eq("id", r.id);
    }),
  );
  done();
}