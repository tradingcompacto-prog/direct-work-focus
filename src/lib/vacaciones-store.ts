import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { invalidateKeys } from "@/lib/qc";
import { useAuth } from "@/lib/auth";
import type { Vacacion } from "@/types/database";

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