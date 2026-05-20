import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { invalidateKeys } from "@/lib/qc";
import { toast } from "sonner";
import type { PublicacionComentario } from "@/types/database";

function fail(op: string, err: unknown) {
  const msg = err instanceof Error ? err.message : String(err);
  console.error(`[pub-com:${op}]`, err);
  toast.error(`No se pudo ${op}: ${msg}`);
}

export function usePublicacionComentarios(publicacionId?: string | null) {
  return useQuery<PublicacionComentario[]>({
    queryKey: ["pub-comentarios", publicacionId],
    enabled: !!publicacionId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("publicacion_comentarios")
        .select("*")
        .eq("publicacion_id", publicacionId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as PublicacionComentario[];
    },
  });
}

export async function addComentario(publicacionId: string, contenido: string) {
  const txt = contenido.trim();
  if (!txt) return;
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) {
    toast.error("Necesitas iniciar sesión");
    return;
  }
  const { error } = await supabase.from("publicacion_comentarios").insert({
    publicacion_id: publicacionId,
    user_id: u.user.id,
    contenido: txt,
  });
  if (error) return fail("añadir comentario", error);
  invalidateKeys(["pub-comentarios", publicacionId]);
}

export async function updateComentario(
  publicacionId: string,
  comentarioId: string,
  contenido: string,
) {
  const { error } = await supabase
    .from("publicacion_comentarios")
    .update({ contenido: contenido.trim() })
    .eq("id", comentarioId);
  if (error) return fail("editar comentario", error);
  invalidateKeys(["pub-comentarios", publicacionId]);
}

export async function removeComentario(publicacionId: string, comentarioId: string) {
  const { error } = await supabase
    .from("publicacion_comentarios")
    .delete()
    .eq("id", comentarioId);
  if (error) return fail("borrar comentario", error);
  invalidateKeys(["pub-comentarios", publicacionId]);
}