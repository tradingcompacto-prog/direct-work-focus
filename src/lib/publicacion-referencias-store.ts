import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { invalidateKeys } from "@/lib/qc";
import { toast } from "sonner";
import type { PublicacionReferencia } from "@/types/database";

function fail(op: string, err: unknown) {
  const msg = err instanceof Error ? err.message : String(err);
  console.error(`[pub-ref:${op}]`, err);
  toast.error(`No se pudo ${op}: ${msg}`);
}

export function usePublicacionReferencias(publicacionId?: string | null) {
  return useQuery<PublicacionReferencia[]>({
    queryKey: ["pub-referencias", publicacionId],
    enabled: !!publicacionId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("publicacion_referencias")
        .select("*")
        .eq("publicacion_id", publicacionId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as PublicacionReferencia[];
    },
  });
}

export async function addReferencia(
  publicacionId: string,
  url: string,
  descripcion?: string,
) {
  const { data: u } = await supabase.auth.getUser();
  const { error } = await supabase.from("publicacion_referencias").insert({
    publicacion_id: publicacionId,
    url: url.trim(),
    descripcion: descripcion?.trim() || null,
    created_by: u.user?.id ?? null,
  });
  if (error) return fail("añadir referencia", error);
  invalidateKeys(["pub-referencias", publicacionId]);
}

export async function removeReferencia(publicacionId: string, refId: string) {
  const { error } = await supabase
    .from("publicacion_referencias")
    .delete()
    .eq("id", refId);
  if (error) return fail("quitar referencia", error);
  invalidateKeys(["pub-referencias", publicacionId]);
}

export async function updateReferencia(
  publicacionId: string,
  refId: string,
  patch: Partial<Pick<PublicacionReferencia, "url" | "descripcion">>,
) {
  const { error } = await supabase
    .from("publicacion_referencias")
    .update(patch)
    .eq("id", refId);
  if (error) return fail("actualizar referencia", error);
  invalidateKeys(["pub-referencias", publicacionId]);
}