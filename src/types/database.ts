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

export type EstadoTarea =
  | "activa"
  | "haciendola"
  | "pausada"
  | "revision"
  | "completada";
export type Prioridad = "baja" | "media" | "alta" | "critica";

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
  fecha_inicio: string;
  fecha_fin_min: string;
  fecha_fin_max: string;
  horas_estimadas?: number | null;
  horas_reales?: number | null;
  cerrado_at?: string | null;
  /** Plan estructurado para entregas de redes sociales. */
  plan_rrss?: PublicacionRRSS[];
}

export type CategoriaEntrega =
  | "redes_sociales"
  | "web"
  | "campana"
  | "informe_mensual"
  | "seo"
  | "diseno"
  | "anuncios"
  | "fotografia"
  | "product_brief"
  | "plan_marketing"
  | "campanas_activas";

export interface PublicacionRRSS {
  id: string;
  /** Vínculo en BD: en producción cada publicación cuelga de una tarea. */
  tarea_id?: UUID;
  fecha: string;
  hora?: string | null;
  tipo: "reel" | "post" | "carrusel" | "story";
  formato: "solo_copy" | "copy_imagen" | "solo_imagen" | "slide";
  plataformas: Array<"ig" | "fb" | "tt" | "li">;
  briefing?: string;
  slides?: string[];
  estado?:
    | "borrador"
    | "diseno"
    | "copy"
    | "revision"
    | "listo"
    | "programado"
    | "publicado";
}

export type EstadoEntrega = "en_curso" | "cerrada";

export interface Entrega {
  id: UUID;
  nombre: string;
  descripcion?: string;
  cliente_id: UUID;
  proyecto_id: UUID;
  pm_id: UUID;
  categoria: CategoriaEntrega;
  estado: EstadoEntrega;
  fecha_inicio: string;
  fecha_fin: string;
  fecha_cierre?: string | null;
  /** Entrega por defecto creada al insertar un cliente. */
  es_trabajos_puntuales?: boolean;
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
  /** PM principal (en BD: pm_principal_id). Mapeado a pm_id para retrocompatibilidad. */
  pm_id: UUID;
  pm_principal_id?: UUID;
  pm_secundario_id?: UUID | null;
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
  categoria?: "urgente" | "importante" | "info";
}

export type TipoEvento = "efemeride" | "vacaciones";

export interface EventoCalendario {
  id: UUID;
  tipo: TipoEvento;
  titulo: string;
  fecha_inicio: string;
  fecha_fin: string;
  persona_id?: UUID;
  nota?: string;
  creado_por: UUID;
}
