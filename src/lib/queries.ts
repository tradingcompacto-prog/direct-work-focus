import { useMemo } from "react";
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
  CategoriaEntrega,
  TareaEnlace,
  PublicacionRRSS,
} from "@/types/database";
import { TIPO_LABEL } from "@/types/database";

// ---------- helpers de mapeo BD -> interfaces internas ----------

function mapCliente(row: Record<string, unknown>): Cliente {
  const pmPrincipal = (row.pm_principal_id as string | null) ?? "";
  const prio = row.prioridad as number | null | undefined;
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
    prioridad: prio === 1 || prio === 2 || prio === 3 ? (prio as 1 | 2 | 3) : 2,
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
        .select("id,nombre,sector,pm_principal_id,pm_secundario_id,web:sitio_web,slack:canal_slack,salud,activo,prioridad")
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
        .select("id,tarea_id,autor_id,texto,fecha:created_at")
        .eq("tarea_id", tareaId!)
        .order("created_at", { ascending: true });
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
        .select("id,tarea_id,entrega_id,actor_id,tipo,texto:descripcion,fecha:created_at")
        .order("created_at", { ascending: false })
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
        .select("id,texto,leida,ruta,icono,categoria,fecha:created_at")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as Notificacion[];
    },
  });
};

// Categorías habilitadas para un cliente. Devuelve las categorías disponibles
// para el selector de "+ Tarea" y para la sección "Categorías habilitadas"
// de la ficha del cliente.
export const useCategoriasHabilitadas = (clienteId: string | null | undefined) => {
  const { user } = useAuth();
  return useQuery<CategoriaEntrega[]>({
    queryKey: ["cliente_categorias", clienteId],
    enabled: !!user && !!clienteId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cliente_categorias")
        .select("categoria")
        .eq("cliente_id", clienteId!)
        .order("categoria");
      if (error) throw error;
      return (data ?? []).map((d) => d.categoria as CategoriaEntrega);
    },
  });
};

export const useColaboradores = (tareaId?: string) => {
  const { user } = useAuth();
  return useQuery<string[]>({
    queryKey: ["colaboradores", tareaId],
    enabled: !!user && !!tareaId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tarea_colaboradores")
        .select("user_id")
        .eq("tarea_id", tareaId!);
      if (error) throw error;
      const rows = (data ?? []) as Array<{ user_id: string }>;
      if (rows.length === 0) {
        // eslint-disable-next-line no-console
        console.log("[useColaboradores] 0 rows for", tareaId);
      }
      return rows.map((r) => r.user_id);
    },
  });
};

export const useColaboradoresPorTareas = (tareaIds: string[]) => {
  const { user } = useAuth();
  const key = [...tareaIds].sort().join(",");
  return useQuery<Map<string, string[]>>({
    queryKey: ["colaboradores-por-tareas", key],
    enabled: !!user && tareaIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tarea_colaboradores")
        .select("tarea_id, user_id")
        .in("tarea_id", tareaIds);
      if (error) throw error;
      const map = new Map<string, string[]>();
      for (const r of (data ?? []) as { tarea_id: string; user_id: string }[]) {
        const arr = map.get(r.tarea_id) ?? [];
        arr.push(r.user_id);
        map.set(r.tarea_id, arr);
      }
      return map;
    },
  });
};

export const useEnlaces = (tareaId?: string) => {
  const { user } = useAuth();
  return useQuery<TareaEnlace[]>({
    queryKey: ["enlaces", tareaId],
    enabled: !!user && !!tareaId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tarea_enlaces")
        .select("id,tarea_id,url,descripcion,created_at")
        .eq("tarea_id", tareaId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      const rows = (data ?? []) as TareaEnlace[];
      if (rows.length === 0) {
        // eslint-disable-next-line no-console
        console.log("[useEnlaces] 0 rows for", tareaId);
      }
      return rows;
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
      if (!user) return [];
      const respPromise = supabase
        .from("tareas")
        .select("*")
        .eq("responsable_id", user.id);
      const colabPromise = supabase
        .from("tarea_colaboradores")
        .select("tarea_id")
        .eq("user_id", user.id);
      const [respRes, colabRes] = await Promise.all([respPromise, colabPromise]);
      if (respRes.error) throw respRes.error;
      if (colabRes.error) throw colabRes.error;
      const tareasResp = (respRes.data ?? []) as Tarea[];
      const tareaIdsColab = ((colabRes.data ?? []) as { tarea_id: string }[]).map(
        (r) => r.tarea_id,
      );
      const yaIds = new Set(tareasResp.map((t) => t.id));
      const idsAFetch = tareaIdsColab.filter((id) => !yaIds.has(id));
      let tareasColab: Tarea[] = [];
      if (idsAFetch.length > 0) {
        const { data, error } = await supabase
          .from("tareas")
          .select("*")
          .in("id", idsAFetch);
        if (error) throw error;
        tareasColab = (data ?? []) as Tarea[];
      }
      return [...tareasResp, ...tareasColab].sort((a, b) =>
        (a.fecha_fin_max ?? "").localeCompare(b.fecha_fin_max ?? ""),
      );
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

// ---------- revisión y devoluciones ----------

/** Todas las tareas en estado=revision (solo útil para directores). */
export const useRevisionGlobal = () => {
  const { user } = useAuth();
  return useQuery<Tarea[]>({
    queryKey: ["revision-global"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tareas")
        .select("*")
        .eq("estado", "revision")
        .order("fecha_fin_max", { ascending: true });
      if (error) throw error;
      const rows = (data ?? []) as Tarea[];
      if (rows.length === 0) {
        // eslint-disable-next-line no-console
        console.log("[useRevisionGlobal] 0 rows");
      }
      return rows;
    },
  });
};

/**
 * Tareas en revisión de clientes donde el usuario es PM (principal o secundario).
 * Se calcula a partir de `useClientes()` y un IN sobre `tareas.cliente_id`.
 */
export const useMisRevisiones = () => {
  const { user } = useAuth();
  const { data: clientes = [] } = useClientes();
  const clientesPM = clientes
    .filter(
      (c) =>
        (c.pm_principal_id && c.pm_principal_id === user?.id) ||
        (c.pm_secundario_id && c.pm_secundario_id === user?.id),
    )
    .map((c) => c.id);
  const key = [...clientesPM].sort().join(",");
  return useQuery<Tarea[]>({
    queryKey: ["mis-revisiones", user?.id, key],
    enabled: !!user && clientesPM.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tareas")
        .select("*")
        .eq("estado", "revision")
        .in("cliente_id", clientesPM)
        .order("fecha_fin_max", { ascending: true });
      if (error) throw error;
      const rows = (data ?? []) as Tarea[];
      if (rows.length === 0) {
        // eslint-disable-next-line no-console
        console.log("[useMisRevisiones] 0 rows for PM", user?.id);
      }
      return rows;
    },
  });
};

/** Tareas que ME devolvieron (responsable_id=yo, devuelta_at no nula, sin completar). */
export const useMisDevoluciones = () => {
  const { user } = useAuth();
  return useQuery<Tarea[]>({
    queryKey: ["mis-devoluciones", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tareas")
        .select("*")
        .eq("responsable_id", user!.id)
        .not("devuelta_at", "is", null)
        .neq("estado", "completada")
        .order("devuelta_at", { ascending: false });
      if (error) throw error;
      const rows = (data ?? []) as Tarea[];
      if (rows.length === 0) {
        // eslint-disable-next-line no-console
        console.log("[useMisDevoluciones] 0 rows for user", user?.id);
      }
      return rows;
    },
  });
};

/** Roles del usuario indicado (lectura directa de user_roles). */
export const useUserRoles = (userId: string | undefined | null) => {
  const { user } = useAuth();
  return useQuery<AppRole[]>({
    queryKey: ["user-roles", userId],
    enabled: !!user && !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId!);
      if (error) throw error;
      return ((data ?? []) as { role: AppRole }[]).map((r) => r.role);
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

// ---------- helpers derivados ----------

/**
 * Map<tareaId, CategoriaEntrega>. La categoría se hereda de la entrega
 * a la que pertenece la tarea. Se usa para `estimar`/`estimarTarea` y
 * para colorear vistas por tipo de trabajo.
 */
export function useCategoriaPorTarea(): Map<string, CategoriaEntrega> {
  const { data: tareas = [] } = useTareas();
  const { data: entregas = [] } = useEntregas();
  const entregaCat = new Map<string, CategoriaEntrega>();
  for (const e of entregas) entregaCat.set(e.id, e.categoria);
  const m = new Map<string, CategoriaEntrega>();
  for (const t of tareas) {
    const c = entregaCat.get(t.entrega_id);
    if (c) m.set(t.id, c);
  }
  return m;
}

// ---------- Vista virtual: publicaciones del usuario como pseudo-tareas ----------

export interface PseudoTarea extends Tarea {
  __esPub: true;
  __rolPub: "diseno" | "copy";
  __publicacionId: string;
  __clienteNombre: string;
  __tipo: PublicacionRRSS["tipo"];
}

function transformarPubAPseudoTarea(pub: Record<string, unknown>, userId: string): PseudoTarea {
  const esDiseno = pub.responsable_diseno_id === userId;
  const tarea = (pub.tareas as { titulo?: string; proyecto_id?: string }) ?? {};
  const cliente = (pub.clientes as { nombre?: string }) ?? {};
  const nombreCliente = cliente.nombre ?? "—";
  const tipo = pub.tipo as PublicacionRRSS["tipo"];
  const fecha = (pub.fecha as string) ?? "";
  return {
    id: pub.id as string,
    titulo: `${esDiseno ? "Diseño" : "Copy"} · ${nombreCliente} · ${TIPO_LABEL[tipo]}`,
    descripcion: (pub.briefing as string | undefined) ?? undefined,
    cliente_id: (pub.cliente_id as string) ?? "",
    proyecto_id: tarea.proyecto_id ?? "",
    entrega_id: (pub.entrega_id as string) ?? "",
    responsable_id: userId,
    solicitante_id: userId,
    estado: (pub.estado as Tarea["estado"]) ?? "activa",
    prioridad: "media",
    fecha_inicio: fecha,
    fecha_fin_min: fecha,
    fecha_fin_max: fecha,
    horas_estimadas: null,
    horas_reales: null,
    devuelta_at: null,
    motivo_devolucion: null,
    __esPub: true,
    __rolPub: esDiseno ? "diseno" : "copy",
    __publicacionId: pub.id as string,
    __clienteNombre: nombreCliente,
    __tipo: tipo,
  };
}

/**
 * Publicaciones donde el usuario es responsable de diseño o copy,
 * en cualquier estado salvo `completada`, transformadas en pseudo-tareas
 * para mostrarse en Timeline/Tabla junto a las tareas reales.
 */
export const useMisPublicacionesComoTareas = () => {
  const { user } = useAuth();
  return useQuery<PseudoTarea[]>({
    queryKey: ["mis-pubs-pseudo-tareas", user?.id],
    enabled: !!user,
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("publicaciones_rrss")
        .select(
          `id, tarea_id, cliente_id, entrega_id, fecha, tipo,
           estado, briefing, copy_final,
           responsable_diseno_id, responsable_copy_id,
           tareas!inner(titulo, proyecto_id),
           clientes!inner(nombre)`,
        )
        .or(`responsable_diseno_id.eq.${user.id},responsable_copy_id.eq.${user.id}`)
        .neq("estado", "completada");
      if (error) throw error;
      return ((data ?? []) as Record<string, unknown>[]).map((p) =>
        transformarPubAPseudoTarea(p, user.id),
      );
    },
  });
};
