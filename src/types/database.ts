export type UUID = string;

export type Rol = "director" | "pm" | "diseno" | "contenidos" | "campanas" | "seo" | "it";

export interface Miembro {
  id: UUID;
  nombre: string;
  iniciales: string;
  rol: string;
  email?: string;
  grupos: Rol[];
  activo: boolean;
}

export type EstadoTarea = "activa" | "haciendola" | "esperando" | "completada";
export type Prioridad = "baja" | "media" | "alta" | "critica";
export type TipoTarea = "diseno" | "copy" | "web" | "campanas" | "seo" | "estrategia" | "otro";

export interface Tarea {
  id: UUID;
  titulo: string;
  descripcion?: string;
  cliente_id: UUID;
  proyecto_id: UUID;
  entrega_id: UUID;
  responsable_id: UUID;
  solicitante_id: UUID;
  estado: EstadoTarea;
  prioridad: Prioridad;
  tipo: TipoTarea;
  fecha_inicio: string;
  fecha_fin_min: string;
  fecha_fin_max: string;
  bloqueada_por_id?: UUID | null;
  desbloquea_id?: UUID | null;
  horas_estimadas?: number | null;
  horas_reales?: number | null;
}

export type EstadoEntrega = "en_curso" | "cerrada";

export interface Entrega {
  id: UUID;
  nombre: string;
  cliente_id: UUID;
  proyecto_id: UUID;
  pm_id: UUID;
  estado: EstadoEntrega;
  fecha_inicio: string;
  fecha_fin: string;
  fecha_cierre?: string | null;
}

export type EstadoProyecto = "activo" | "cerrado";

export interface Proyecto {
  id: UUID;
  nombre: string;
  cliente_id: UUID;
  pm_id: UUID;
  estado: EstadoProyecto;
  fecha_inicio: string;
  fecha_fin?: string | null;
}

export type SaludCliente = "verde" | "amarillo" | "rojo";

export interface Cliente {
  id: UUID;
  nombre: string;
  sector: string;
  pm_id: UUID;
  web?: string;
  slack?: string;
  salud: SaludCliente;
  activo: boolean;
}

export interface Comentario {
  id: UUID;
  tarea_id: UUID;
  autor_id: UUID;
  texto: string;
  fecha: string; // ISO datetime
}

export type TipoActividad = "creada" | "empezada" | "cerrada" | "reabierta" | "asignada" | "comentada";

export interface Actividad {
  id: UUID;
  tarea_id?: UUID;
  entrega_id?: UUID;
  actor_id: UUID;
  tipo: TipoActividad;
  texto: string;
  fecha: string;
}

export interface Notificacion {
  id: UUID;
  texto: string;
  fecha: string;
  leida: boolean;
  ruta?: string;
  icono?: "check" | "play" | "user-plus" | "message" | "alert";
}
