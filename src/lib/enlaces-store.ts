import { supabase } from "@/lib/supabase";
import { invalidateKeys } from "@/lib/qc";
import { toast } from "sonner";

function fail(op: string, err: unknown) {
  const msg = err instanceof Error ? err.message : String(err);
  // eslint-disable-next-line no-console
  console.error(`[enlaces:${op}]`, err);
  toast.error(`No se pudo ${op}: ${msg}`);
}

export async function addEnlace(tareaId: string, url: string, descripcion?: string) {
  const { error } = await supabase
    .from("tarea_enlaces")
    .insert({ tarea_id: tareaId, url, descripcion: descripcion?.trim() || null });
  if (error) {
    fail("añadir enlace", error);
    return;
  }
  invalidateKeys(["enlaces", tareaId], ["enlaces"]);
  toast.success("Enlace añadido");
}

export async function removeEnlace(enlaceId: string, tareaId?: string) {
  const { error } = await supabase.from("tarea_enlaces").delete().eq("id", enlaceId);
  if (error) {
    fail("quitar enlace", error);
    return;
  }
  invalidateKeys(["enlaces", tareaId], ["enlaces"]);
  toast.success("Enlace eliminado");
}