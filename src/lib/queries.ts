import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth, type AppRole } from "@/lib/auth";
import { setEquipo } from "@/lib/equipo";
import type {
  Tarea,
  Entrega,
  Proyecto,
  Cliente,
  Comentario,
  Actividad,
  Notificacion,
  Miembro,
} from "@/types/database";

// ---------- helpers de mapeo BD -> interfaces internas ----------

function mapCliente(row: Record<string, unknown>): Cliente {
  const pmPrincipal = (row.pm_principal_id as string | null) ?? "";
  return {
    id: row.id as string,
    nombre: (row.nombre as string) ?? "",
    sector: (row.sector as string) ?? "",
    pm_id: pmPrincipal,
    pm_principal_id: pmPrincipal || undefined,
    pm_secundario_id: (row.pm_secundario_id as string | null) ?? null,
    web: (row.web as string | undefined) ?? undefined,
    slack: (row.slack as string | undefined) ?? undefined,
    salud: ((row.salud as Cliente["salud"]) ?? "verde"),
    activo: (row.activo as boolean) ?? true,
  };
}

function rolEtiqueta(grupos: AppRole[]): string {
  if (grupos.includes("director")) return "Director";
  if (grupos.includes("pm")) return "PM";
  if (grupos.length === 0) return "Ejecutor";
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  return grupos.map(cap).join(" · ");
}

// ---------- queries ----------

export const useTareas = () => {
  const { user } = useAuth();
  return useQuery<Tarea[]>({
    queryKey: ["tareas"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tareas")
        .select("*")
        .order("fecha_fin_max", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Tarea[];
    },
  });
};

export const useEntregas = () => {
  const { user } = useAuth();
  return useQuery<Entrega[]>({
    queryKey: ["entregas"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("entregas")
        .select("*")
        .order("fecha_fin", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Entrega[];
    },
  });
};

export const useProyectos = () => {
  const { user } = useAuth();
  return useQuery<Proyecto[]>({
    queryKey: ["proyectos"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("proyectos").select("*");
      if (error) throw error;
      return (data ?? []) as Proyecto[];
    },
  });
};

export const useClientes = () => {
  const { user } = useAuth();
  return useQuery<Cliente[]>({
    queryKey: ["clientes"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clientes")
        .select("id,nombre,sector,pm_principal_id,pm_secundario_id,web,slack,salud,activo")
        .order("nombre");
      if (error) throw error;
      return (data ?? []).map(mapCliente);
    },
  });
};

export const useEquipo = () => {
  const { user } = useAuth();
  return useQuery<Miembro[]>({
    queryKey: ["equipo"],
    enabled: !!user,
    queryFn: async () => {
      const [{ data: profiles, error: e1 }, { data: roles, error: e2 }] = await Promise.all([
        supabase
          .from("profiles")
          .select("id,nombre,iniciales,email,avatar_url,activo")
          .eq("activo", true),
        supabase.from("user_roles").select("user_id,role"),
      ]);
      if (e1) throw e1;
      if (e2) throw e2;
      const rolesPorUser = new Map<string, AppRole[]>();
      for (const r of (roles ?? []) as { user_id: string; role: AppRole }[]) {
        const arr = rolesPorUser.get(r.user_id) ?? [];
        arr.push(r.role);
        rolesPorUser.set(r.user_id, arr);
      }
      const miembros: Miembro[] = ((profiles ?? []) as Array<Record<string, unknown>>).map((p) => {
        const grupos = (rolesPorUser.get(p.id as string) ?? []) as AppRole[];
        const gruposFiltrados = grupos.filter((g) => g !== "ejecutor");
        return {
          id: p.id as string,
          nombre: ((p.nombre as string) ?? (p.email as string) ?? "Sin nombre"),
          iniciales: ((p.iniciales as string) ?? "??").toUpperCase().slice(0, 2),
          rol: rolEtiqueta(grupos),
          email: (p.email as string) ?? undefined,
          grupos: gruposFiltrados as Miembro["grupos"],
          activo: (p.activo as boolean) ?? true,
        };
      });
      // Hidrata el array sincrónico que usan PersonaChip y otros consumidores.
      setEquipo(miembros);
      return miembros;
    },
  });
};

export const useComentarios = (tareaId?: string) => {
  const { user } = useAuth();
  return useQuery<Comentario[]>({
    queryKey: ["comentarios", tareaId],
    enabled: !!user && !!tareaId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comentarios")
        .select("*")
        .eq("tarea_id", tareaId!)
        .order("fecha", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Comentario[];
    },
  });
};

export const useActividad = () => {
  const { user } = useAuth();
  return useQuery<Actividad[]>({
    queryKey: ["actividad"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("actividad")
        .select("*")
        .order("fecha", { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data ?? []) as Actividad[];
    },
  });
};

export const useNotificaciones = () => {
  const { user } = useAuth();
  return useQuery<Notificacion[]>({
    queryKey: ["notificaciones"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notificaciones")
        .select("*")
        .order("fecha", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as Notificacion[];
    },
  });
};

// ---------- vistas derivadas ("mis…") ----------

export const useMisTareas = () => {
  const { user } = useAuth();
  return useQuery<Tarea[]>({
    queryKey: ["mis-tareas", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tareas")
        .select("*")
        .eq("responsable_id", user!.id)
        .order("fecha_fin_max", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Tarea[];
    },
  });
};

export const useMisEntregas = () => {
  const { user } = useAuth();
  return useQuery<Entrega[]>({
    queryKey: ["mis-entregas", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("entregas")
        .select("*")
        .eq("pm_id", user!.id)
        .order("fecha_fin", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Entrega[];
    },
  });
};
