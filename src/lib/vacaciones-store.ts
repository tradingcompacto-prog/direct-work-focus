import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { invalidateKeys } from "@/lib/qc";
import { useAuth } from "@/lib/auth";
import type { Vacacion, Tarea, Miembro } from "@/types/database";
import { useTareas, useEquipo } from "@/lib/queries";

export const useMisVacaciones = () => {
  const { user } = useAuth();
  return useQuery<Vacacion[]>({
    queryKey: ["vacaciones", "mias", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vacaciones")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Vacacion[];
    },
  });
};

export const useVacacionesPorAprobar = () => {
  const { user } = useAuth();
  return useQuery<Vacacion[]>({
    queryKey: ["vacaciones", "por-aprobar"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vacaciones")
        .select("*")
        .eq("estado", "pendiente")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Vacacion[];
    },
  });
};

export const useVacacionesAprobadas = () => {
  const { user } = useAuth();
  return useQuery<Vacacion[]>({
    queryKey: ["vacaciones", "aprobadas"],
    enabled: !!user,
    queryFn: async () => {
      const hoy = new Date().toISOString().slice(0, 10);
      const { data, error } = await supabase
        .from("vacaciones")
        .select("*")
        .eq("estado", "aprobada")
        .gte("fecha_fin", hoy)
        .order("fecha_inicio", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Vacacion[];
    },
  });
};

function invalidarVacaciones() {
  invalidateKeys(
    ["vacaciones", "mias"],
    ["vacaciones", "por-aprobar"],
    ["vacaciones", "aprobadas"],
  );
}

export async function solicitarVacaciones(
  fechaInicio: string,
  fechaFin: string,
  motivo?: string,
) {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) throw new Error("Sesión no disponible");
  const { error } = await supabase.from("vacaciones").insert({
    user_id: u.user.id,
    fecha_inicio: fechaInicio,
    fecha_fin: fechaFin,
    motivo: motivo ?? null,
    estado: "pendiente",
  });
  if (error) throw error;
  invalidarVacaciones();
}

export async function aprobarVacacion(id: string) {
  const { data: u } = await supabase.auth.getUser();
  const { error } = await supabase
    .from("vacaciones")
    .update({
      estado: "aprobada",
      aprobado_por: u.user?.id ?? null,
      aprobado_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw error;
  invalidarVacaciones();
}

export async function rechazarVacacion(id: string, motivoRechazo: string) {
  const { data: u } = await supabase.auth.getUser();
  const { error } = await supabase
    .from("vacaciones")
    .update({
      estado: "rechazada",
      motivo_rechazo: motivoRechazo,
      aprobado_por: u.user?.id ?? null,
      aprobado_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw error;
  invalidarVacaciones();
}

export async function cancelarVacacion(id: string) {
  const { error } = await supabase
    .from("vacaciones")
    .update({ estado: "cancelada" })
    .eq("id", id);
  if (error) throw error;
  invalidarVacaciones();
}

export function diasEntre(fechaInicio: string, fechaFin: string): number {
  const a = new Date(fechaInicio).getTime();
  const b = new Date(fechaFin).getTime();
  if (isNaN(a) || isNaN(b) || b < a) return 0;
  return Math.round((b - a) / 86_400_000) + 1;
}

// ---------- Detección de conflictos con tareas ----------

export function fechaEnRango(fecha: string, inicio: string, fin: string): boolean {
  return fecha >= inicio && fecha <= fin;
}

/**
 * Devuelve la vacación aprobada que solapa con la fecha dada para un
 * usuario, o null si no hay conflicto.
 */
export const useVacacionConflicto = (
  userId: string | null | undefined,
  fecha: string | null | undefined,
) => {
  const { data: aprobadas = [] } = useVacacionesAprobadas();
  return useMemo(() => {
    if (!userId || !fecha) return null;
    return (
      aprobadas.find(
        (v) => v.user_id === userId && fechaEnRango(fecha, v.fecha_inicio, v.fecha_fin),
      ) ?? null
    );
  }, [aprobadas, userId, fecha]);
};

/**
 * Map<userId, Vacacion> para todas las personas con conflicto en la fecha dada.
 */
export const useVacacionConflictoBatch = (
  userIds: string[],
  fecha: string | null | undefined,
) => {
  const { data: aprobadas = [] } = useVacacionesAprobadas();
  const key = userIds.join(",");
  return useMemo(() => {
    const map = new Map<string, Vacacion>();
    if (!fecha || userIds.length === 0) return map;
    for (const uid of userIds) {
      const v = aprobadas.find(
        (vv) => vv.user_id === uid && fechaEnRango(fecha, vv.fecha_inicio, vv.fecha_fin),
      );
      if (v) map.set(uid, v);
    }
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aprobadas, key, fecha]);
};

/**
 * Cruza tareas activas (responsable) con vacaciones aprobadas.
 * v1: solo responsables. Colaboradores se detectan in-situ en modales.
 */
export const useConflictosTareasVacaciones = () => {
  const { data: aprobadas = [] } = useVacacionesAprobadas();
  const { data: tareas = [] } = useTareas();
  const { data: equipo = [] } = useEquipo();
  return useMemo(() => {
    const conflictos: Array<{
      tarea: Tarea;
      persona: Miembro;
      vacacion: Vacacion;
      rol: "responsable" | "colaborador";
    }> = [];
    const activas = tareas.filter((t) => t.estado !== "completada");
    for (const t of activas) {
      if (!t.fecha_fin_max || !t.responsable_id) continue;
      const vac = aprobadas.find(
        (v) =>
          v.user_id === t.responsable_id &&
          fechaEnRango(t.fecha_fin_max, v.fecha_inicio, v.fecha_fin),
      );
      if (!vac) continue;
      const persona = equipo.find((p) => p.id === t.responsable_id);
      if (!persona) continue;
      conflictos.push({ tarea: t, persona, vacacion: vac, rol: "responsable" });
    }
    return conflictos;
  }, [aprobadas, tareas, equipo]);
};