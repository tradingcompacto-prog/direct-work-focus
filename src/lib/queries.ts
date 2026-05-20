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
        .select("id,nombre,sector,pm_principal_id,pm_secundario_id,web:sitio_web,slack:canal_slack,salud,activo")
        .order("nombre");
      if (error) {
        // eslint-disable-next-line no-console
        console.error("[useClientes] error:", error);
        throw error;
      }
      // eslint-disable-next-line no-console
      console.log("[useClientes] rows:", data?.length ?? 0);
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
        .from("tarea_comentarios")
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

// ---------- mega-hook: dataset completo + lookups ----------
// Sustituye a los antiguos arrays mock importados desde "@/lib/mock-tareas".
// Cada consumidor llama a useDataset() en su top-level y desestructura.

export interface Dataset {
  tareas: Tarea[];
  entregas: Entrega[];
  proyectos: Proyecto[];
  clientes: Cliente[];
  actividad: Actividad[];
  clientePorId: (id: string) => Cliente | undefined;
  proyectoPorId: (id: string) => Proyecto | undefined;
  entregaPorId: (id: string) => Entrega | undefined;
  tareaPorId: (id: string) => Tarea | undefined;
  nombreCliente: (id: string) => string;
  nombreProyecto: (id: string) => string;
  nombreEntrega: (id: string) => string;
  tituloTarea: (id: string) => string;
}

export function useDataset(): Dataset {
  const { data: tareas = [] } = useTareas();
  const { data: entregas = [] } = useEntregas();
  const { data: proyectos = [] } = useProyectos();
  const { data: clientes = [] } = useClientes();
  const { data: actividad = [] } = useActividad();
  const clientePorId = (id: string) => clientes.find((c) => c.id === id);
  const proyectoPorId = (id: string) => proyectos.find((p) => p.id === id);
  const entregaPorId = (id: string) => entregas.find((e) => e.id === id);
  const tareaPorId = (id: string) => tareas.find((t) => t.id === id);
  return {
    tareas, entregas, proyectos, clientes, actividad,
    clientePorId, proyectoPorId, entregaPorId, tareaPorId,
    nombreCliente: (id) => clientePorId(id)?.nombre ?? "—",
    nombreProyecto: (id) => proyectoPorId(id)?.nombre ?? "—",
    nombreEntrega: (id) => entregaPorId(id)?.nombre ?? "—",
    tituloTarea: (id) => tareaPorId(id)?.titulo ?? "—",
  };
}
