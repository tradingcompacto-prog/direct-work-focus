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
  /** Timestamp ISO de la última devolución del PM al responsable. */
  devuelta_at?: string | null;
  /** Motivo escrito por el PM al devolver la tarea. */
  motivo_devolucion?: string | null;
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
  entrega_id?: UUID;
  cliente_id?: UUID;
  fecha: string;
  hora?: string | null;
  tipo: "reel" | "post" | "carrusel" | "story";
  formato: "solo_copy" | "copy_imagen" | "solo_imagen" | "slide";
  plataformas: Array<"ig" | "fb" | "tt" | "li">;
  briefing?: string | null;
  copy_final?: string | null;
  recursos_visuales?: Array<{
    url: string;
    tipo?: "imagen" | "video";
    descripcion?: string;
  }>;
  slides?: Array<{ texto?: string; imagen_url?: string }>;
  estado?:
    | "activa"
    | "haciendola"
    | "pausada"
    | "revision"
    | "completada";
  responsable_diseno_id?: UUID | null;
  responsable_copy_id?: UUID | null;
  impresiones?: number | null;
  alcance?: number | null;
  interacciones?: number | null;
  ctr?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface PublicacionReferencia {
  id: string;
  publicacion_id: UUID;
  url: string;
  descripcion?: string | null;
  created_by?: UUID | null;
  created_at: string;
}

export interface PublicacionComentario {
  id: string;
  publicacion_id: UUID;
  user_id: UUID;
  contenido: string;
  created_at: string;
  updated_at: string;
}

export const TIPO_LABEL: Record<PublicacionRRSS["tipo"], string> = {
  post: "Post",
  reel: "Reel",
  carrusel: "Carrusel",
  story: "Story",
};

export const TIPO_TOOLTIP: Record<PublicacionRRSS["tipo"], string> = {
  post: "Pieza estática en el feed",
  reel: "Vídeo vertical corto",
  carrusel: "Múltiples slides deslizables",
  story: "Pieza efímera 24h",
};

export const FORMATO_LABEL: Record<PublicacionRRSS["formato"], string> = {
  solo_copy: "Solo copy",
  copy_imagen: "Copy + imagen",
  solo_imagen: "Solo imagen",
  slide: "Slides",
};

export const FORMATO_TOOLTIP: Record<PublicacionRRSS["formato"], string> = {
  solo_copy: "Solo texto, sin imagen",
  copy_imagen: "Texto + 1 imagen",
  solo_imagen: "Solo imagen, sin copy",
  slide: "Carrusel de varios slides (texto + imagen cada uno)",
};

export const ESTADO_PUB_LABEL: Record<NonNullable<PublicacionRRSS["estado"]>, string> = {
  activa: "Activa",
  haciendola: "Haciéndola",
  pausada: "Pausada",
  revision: "Revisión",
  completada: "Completada",
};

export const ESTADO_PUB_TOOLTIP: Record<NonNullable<PublicacionRRSS["estado"]>, string> = {
  activa: "Sin empezar, esperando que alguien la haga",
  haciendola: "En producción ahora mismo",
  pausada: "Detenida temporalmente",
  revision: "Pendiente de aprobación del PM",
  completada: "Aprobada y cerrada",
};

export const ESTADO_PUB_COLOR: Record<NonNullable<PublicacionRRSS["estado"]>, string> = {
  activa: "bg-blue-100 text-blue-800 border-blue-200",
  haciendola: "bg-amber-100 text-amber-800 border-amber-200",
  pausada: "bg-zinc-100 text-zinc-700 border-zinc-200",
  revision: "bg-purple-100 text-purple-800 border-purple-200",
  completada: "bg-green-100 text-green-800 border-green-200",
};

export type EstadoEntrega = "en_curso" | "completada";

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
}

export interface ClienteCategoria {
  cliente_id: UUID;
  categoria: CategoriaEntrega;
  habilitada_at: string;
  habilitada_por?: UUID;
  notas?: string;
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

export type TipoActividad =
  | "creada"
  | "empezada"
  | "pausada"
  | "reanudada"
  | "mandada_revision"
  | "devuelta_revision"
  | "reasignada"
  | "completada"
  | "reabierta"
  | "comentada";

export const nombreActividad: Record<TipoActividad, string> = {
  creada: "creó la tarea",
  empezada: "empezó la tarea",
  pausada: "pausó la tarea",
  reanudada: "reanudó la tarea",
  mandada_revision: "mandó a revisión",
  devuelta_revision: "devolvió de revisión",
  reasignada: "reasignó la tarea",
  completada: "completó la tarea",
  reabierta: "reabrió la tarea",
  comentada: "comentó la tarea",
};

export interface TareaEnlace {
  id: UUID;
  tarea_id: UUID;
  url: string;
  descripcion?: string | null;
  created_at: string;
}

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
