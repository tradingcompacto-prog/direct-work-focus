import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { invalidateKeys } from "@/lib/qc";
import { useAuth } from "@/lib/auth";
import type { FechaImportante, UUID } from "@/types/database";

export const useFechasImportantes = () => {
  const { user } = useAuth();
  return useQuery<FechaImportante[]>({
    queryKey: ["fechas-importantes"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fechas_importantes")
        .select("*")
        .order("fecha_inicio", { ascending: true });
      if (error) throw error;
      return (data ?? []) as FechaImportante[];
    },
  });
};

export const useFechasImportantesPorCliente = (clienteId?: UUID | null) => {
  const { user } = useAuth();
  return useQuery<FechaImportante[]>({
    queryKey: ["fechas-importantes", clienteId ?? "_all"],
    enabled: !!user && !!clienteId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fechas_importantes")
        .select("*")
        .or(`cliente_id.is.null,cliente_id.eq.${clienteId}`)
        .order("fecha_inicio", { ascending: true });
      if (error) throw error;
      return (data ?? []) as FechaImportante[];
    },
  });
};

export async function addFechaImportante(input: {
  titulo: string;
  descripcion?: string | null;
  fecha_inicio: string;
  fecha_fin?: string | null;
  tipo: FechaImportante["tipo"];
  cliente_id?: UUID | null;
}) {
  const { data: u } = await supabase.auth.getUser();
  const { error } = await supabase.from("fechas_importantes").insert({
    titulo: input.titulo,
    descripcion: input.descripcion ?? null,
    fecha_inicio: input.fecha_inicio,
    fecha_fin: input.fecha_fin ?? null,
    tipo: input.tipo,
    cliente_id: input.cliente_id ?? null,
    created_by: u.user?.id ?? null,
  });
  if (error) throw error;
  invalidateKeys(["fechas-importantes"]);
}

export async function updateFechaImportante(
  id: string,
  patch: Partial<Omit<FechaImportante, "id" | "created_at" | "created_by">>,
) {
  const { error } = await supabase.from("fechas_importantes").update(patch).eq("id", id);
  if (error) throw error;
  invalidateKeys(["fechas-importantes"]);
}

export async function removeFechaImportante(id: string) {
  const { error } = await supabase.from("fechas_importantes").delete().eq("id", id);
  if (error) throw error;
  invalidateKeys(["fechas-importantes"]);
}