import type {
  Cliente,
  Proyecto,
  Entrega,
  Tarea,
  Comentario,
  Actividad,
  Notificacion,
  UUID,
} from "@/types/database";

const dias = (n: number) => {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};
const horasAtras = (h: number) => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - h * 60);
  return d.toISOString();
};

// IDs equipo
const DANI = "11111111-1111-1111-1111-111111111111";
const PAULA = "22222222-2222-2222-2222-222222222222";
const NEREA = "33333333-3333-3333-3333-333333333333";
const EDU = "44444444-4444-4444-4444-444444444444";
const SANDRA = "55555555-5555-5555-5555-555555555555";
const ANDREA = "66666666-6666-6666-6666-666666666666";
const MARTIN = "77777777-7777-7777-7777-777777777777";
const RUBEN = "88888888-8888-8888-8888-888888888888";
const PABLO = "99999999-9999-9999-9999-999999999999";

// ─── Clientes ─────────────────────────────────────────────
export const CLIENTES_MOCK: Cliente[] = [
  { id: "cli-nanami", nombre: "Nanami", sector: "Cosmética", pm_id: PAULA, web: "nanami.es", slack: "#cli-nanami", salud: "verde", activo: true },
  { id: "cli-nimbo", nombre: "Nimbo Móvil", sector: "Telco", pm_id: NEREA, web: "nimbomovil.com", slack: "#cli-nimbo", salud: "amarillo", activo: true },
  { id: "cli-territorio", nombre: "Territorio Trading", sector: "Fintech", pm_id: PAULA, web: "territoriotrading.com", slack: "#cli-territorio", salud: "verde", activo: true },
  { id: "cli-rentalmode", nombre: "Rental Mode", sector: "Movilidad", pm_id: EDU, web: "rentalmode.com", slack: "#cli-rentalmode", salud: "rojo", activo: true },
  { id: "cli-fim", nombre: "FIM Institute", sector: "Educación", pm_id: NEREA, web: "fiminstitute.org", slack: "#cli-fim", salud: "verde", activo: true },
  { id: "cli-dehesa", nombre: "La Dehesa Experiences", sector: "Turismo", pm_id: PAULA, web: "ladehesa.com", slack: "#cli-dehesa", salud: "amarillo", activo: true },
  { id: "cli-sa", nombre: "Social Advisor", sector: "Interno", pm_id: DANI, web: "socialadvisor.es", slack: "#general", salud: "verde", activo: true },
  { id: "cli-atipico", nombre: "Atipico", sector: "Lifestyle", pm_id: NEREA, web: "atipico.es", slack: "#cli-atipico", salud: "verde", activo: true },
  { id: "cli-activtrades", nombre: "ActivTrades", sector: "Fintech", pm_id: EDU, web: "activtrades.com", slack: "#cli-activtrades", salud: "amarillo", activo: true },
];

// ─── Proyectos ────────────────────────────────────────────
export const PROYECTOS_MOCK: Proyecto[] = [
  { id: "pry-nanami-est", nombre: "Estrategia 2026", cliente_id: "cli-nanami", pm_id: PAULA, estado: "activo", fecha_inicio: dias(-30) },
  { id: "pry-nanami-id", nombre: "Identidad", cliente_id: "cli-nanami", pm_id: PAULA, estado: "activo", fecha_inicio: dias(-60) },
  { id: "pry-nanami-seo", nombre: "SEO 2026", cliente_id: "cli-nanami", pm_id: PAULA, estado: "activo", fecha_inicio: dias(-15) },
  { id: "pry-territorio-web", nombre: "Web institucional", cliente_id: "cli-territorio", pm_id: PAULA, estado: "activo", fecha_inicio: dias(-20) },
  { id: "pry-territorio-cont", nombre: "Contenidos", cliente_id: "cli-territorio", pm_id: NEREA, estado: "activo", fecha_inicio: dias(-40) },
  { id: "pry-fim-onb", nombre: "Onboarding", cliente_id: "cli-fim", pm_id: NEREA, estado: "activo", fecha_inicio: dias(-10) },
  { id: "pry-fim-prod", nombre: "Producción", cliente_id: "cli-fim", pm_id: EDU, estado: "activo", fecha_inicio: dias(-25) },
  { id: "pry-fim-est", nombre: "Estrategia", cliente_id: "cli-fim", pm_id: DANI, estado: "activo", fecha_inicio: dias(-50) },
  { id: "pry-rental-verano", nombre: "Campaña verano", cliente_id: "cli-rentalmode", pm_id: EDU, estado: "activo", fecha_inicio: dias(-20) },
  { id: "pry-rental-sem", nombre: "SEM", cliente_id: "cli-rentalmode", pm_id: EDU, estado: "activo", fecha_inicio: dias(-90) },
  { id: "pry-activ-track", nombre: "Tracking 2026", cliente_id: "cli-activtrades", pm_id: EDU, estado: "activo", fecha_inicio: dias(-12) },
  { id: "pry-activ-aw", nombre: "Awareness", cliente_id: "cli-activtrades", pm_id: EDU, estado: "activo", fecha_inicio: dias(-30) },
  { id: "pry-dehesa-otono", nombre: "Lanzamiento otoño", cliente_id: "cli-dehesa", pm_id: PAULA, estado: "activo", fecha_inicio: dias(-15) },
  { id: "pry-nimbo-bf", nombre: "BF 2026", cliente_id: "cli-nimbo", pm_id: NEREA, estado: "activo", fecha_inicio: dias(-7) },
  { id: "pry-nimbo-seo", nombre: "Contenidos SEO", cliente_id: "cli-nimbo", pm_id: NEREA, estado: "activo", fecha_inicio: dias(-30) },
  { id: "pry-atipico-ao", nombre: "Always-on", cliente_id: "cli-atipico", pm_id: NEREA, estado: "activo", fecha_inicio: dias(-90) },
  { id: "pry-atipico-lan", nombre: "Lanzamiento", cliente_id: "cli-atipico", pm_id: NEREA, estado: "activo", fecha_inicio: dias(-20) },
  { id: "pry-sa-ops", nombre: "Operaciones", cliente_id: "cli-sa", pm_id: DANI, estado: "activo", fecha_inicio: dias(-180) },
  { id: "pry-sa-it", nombre: "IT interno", cliente_id: "cli-sa", pm_id: DANI, estado: "activo", fecha_inicio: dias(-60) },
  { id: "pry-sa-fin", nombre: "Finanzas", cliente_id: "cli-sa", pm_id: DANI, estado: "activo", fecha_inicio: dias(-200) },
];

// ─── Entregas ─────────────────────────────────────────────
export const ENTREGAS_MOCK: Entrega[] = [
  { id: "ent-001", nombre: "Plan trimestral", cliente_id: "cli-nanami", proyecto_id: "pry-nanami-est", pm_id: PAULA, estado: "en_curso", fecha_inicio: dias(-7), fecha_fin: dias(2) },
  { id: "ent-002", nombre: "Landing v2", cliente_id: "cli-territorio", proyecto_id: "pry-territorio-web", pm_id: PAULA, estado: "en_curso", fecha_inicio: dias(-5), fecha_fin: dias(3) },
  { id: "ent-003", nombre: "Sesión inicial", cliente_id: "cli-fim", proyecto_id: "pry-fim-onb", pm_id: NEREA, estado: "en_curso", fecha_inicio: dias(-2), fecha_fin: dias(4) },
  { id: "ent-004", nombre: "Key visual verano", cliente_id: "cli-rentalmode", proyecto_id: "pry-rental-verano", pm_id: EDU, estado: "en_curso", fecha_inicio: dias(-3), fecha_fin: dias(5) },
  { id: "ent-005", nombre: "Setup GA4", cliente_id: "cli-activtrades", proyecto_id: "pry-activ-track", pm_id: EDU, estado: "en_curso", fecha_inicio: dias(-1), fecha_fin: dias(6) },
  { id: "ent-006", nombre: "Piezas RRSS otoño", cliente_id: "cli-dehesa", proyecto_id: "pry-dehesa-otono", pm_id: PAULA, estado: "en_curso", fecha_inicio: dias(-4), fecha_fin: dias(5) },
  { id: "ent-007", nombre: "Brief BF", cliente_id: "cli-nimbo", proyecto_id: "pry-nimbo-bf", pm_id: NEREA, estado: "en_curso", fecha_inicio: dias(-2), fecha_fin: dias(2) },
  { id: "ent-008", nombre: "Informe mensual", cliente_id: "cli-atipico", proyecto_id: "pry-atipico-ao", pm_id: NEREA, estado: "en_curso", fecha_inicio: dias(-3), fecha_fin: dias(7) },
  { id: "ent-009", nombre: "Templates RRSS Nanami", cliente_id: "cli-nanami", proyecto_id: "pry-nanami-id", pm_id: PAULA, estado: "en_curso", fecha_inicio: dias(-6), fecha_fin: dias(5) },
  { id: "ent-010", nombre: "Banners ActivTrades", cliente_id: "cli-activtrades", proyecto_id: "pry-activ-aw", pm_id: EDU, estado: "en_curso", fecha_inicio: dias(-2), fecha_fin: dias(1) },
  { id: "ent-011", nombre: "Calendario editorial", cliente_id: "cli-territorio", proyecto_id: "pry-territorio-cont", pm_id: NEREA, estado: "en_curso", fecha_inicio: dias(-1), fecha_fin: dias(8) },
  { id: "ent-012", nombre: "Migración workspace", cliente_id: "cli-sa", proyecto_id: "pry-sa-it", pm_id: DANI, estado: "en_curso", fecha_inicio: dias(-2), fecha_fin: dias(3) },
  { id: "ent-013", nombre: "Optimización SEM", cliente_id: "cli-rentalmode", proyecto_id: "pry-rental-sem", pm_id: EDU, estado: "en_curso", fecha_inicio: dias(-3), fecha_fin: dias(6) },
  { id: "ent-014", nombre: "Setup campaña Meta", cliente_id: "cli-atipico", proyecto_id: "pry-atipico-lan", pm_id: NEREA, estado: "en_curso", fecha_inicio: dias(0), fecha_fin: dias(10) },
  { id: "ent-015", nombre: "Auditoría SEO", cliente_id: "cli-nanami", proyecto_id: "pry-nanami-seo", pm_id: PAULA, estado: "en_curso", fecha_inicio: dias(-3), fecha_fin: dias(7) },
  { id: "ent-016", nombre: "Posts blog", cliente_id: "cli-nimbo", proyecto_id: "pry-nimbo-seo", pm_id: NEREA, estado: "en_curso", fecha_inicio: dias(-4), fecha_fin: dias(13) },
  { id: "ent-017", nombre: "Plan estratégico FIM", cliente_id: "cli-fim", proyecto_id: "pry-fim-est", pm_id: DANI, estado: "en_curso", fecha_inicio: dias(-5), fecha_fin: dias(6) },
  { id: "ent-018", nombre: "Shooting día 1", cliente_id: "cli-fim", proyecto_id: "pry-fim-prod", pm_id: EDU, estado: "en_curso", fecha_inicio: dias(2), fecha_fin: dias(8) },
  { id: "ent-019", nombre: "Contrato Atipico", cliente_id: "cli-sa", proyecto_id: "pry-sa-ops", pm_id: DANI, estado: "cerrada", fecha_inicio: dias(-15), fecha_fin: dias(-2), fecha_cierre: dias(-1) },
  { id: "ent-020", nombre: "Revisión presupuestos", cliente_id: "cli-sa", proyecto_id: "pry-sa-fin", pm_id: DANI, estado: "en_curso", fecha_inicio: dias(-1), fecha_fin: dias(13) },
  { id: "ent-021", nombre: "Branding inicial", cliente_id: "cli-nanami", proyecto_id: "pry-nanami-id", pm_id: PAULA, estado: "cerrada", fecha_inicio: dias(-40), fecha_fin: dias(-5), fecha_cierre: dias(-3) },
];

// ─── Tareas ───────────────────────────────────────────────
export const TAREAS_MOCK: Tarea[] = [
  { id: "t-001", titulo: "Revisar plan de medios Q2", descripcion: "Repasar mix de canales y presupuestos.", cliente_id: "cli-nanami", proyecto_id: "pry-nanami-est", entrega_id: "ent-001", responsable_id: PAULA, solicitante_id: DANI, estado: "haciendola", prioridad: "alta", tipo: "estrategia", fecha_inicio: dias(-3), fecha_fin_min: dias(-1), fecha_fin_max: dias(-1) },
  { id: "t-002", titulo: "Validar copy para landing principal", cliente_id: "cli-territorio", proyecto_id: "pry-territorio-web", entrega_id: "ent-002", responsable_id: PAULA, solicitante_id: PAULA, estado: "activa", prioridad: "media", tipo: "copy", fecha_inicio: dias(-1), fecha_fin_min: dias(0), fecha_fin_max: dias(0) },
  { id: "t-003", titulo: "Reunión kickoff con cliente", cliente_id: "cli-fim", proyecto_id: "pry-fim-onb", entrega_id: "ent-003", responsable_id: PAULA, solicitante_id: NEREA, estado: "activa", prioridad: "media", tipo: "estrategia", fecha_inicio: dias(1), fecha_fin_min: dias(2), fecha_fin_max: dias(3) },
  { id: "t-004", titulo: "Diseñar key visual campaña verano", cliente_id: "cli-rentalmode", proyecto_id: "pry-rental-verano", entrega_id: "ent-004", responsable_id: SANDRA, solicitante_id: PAULA, estado: "haciendola", prioridad: "alta", tipo: "diseno", fecha_inicio: dias(-2), fecha_fin_min: dias(1), fecha_fin_max: dias(2) },
  { id: "t-005", titulo: "Configurar conversiones GA4", cliente_id: "cli-activtrades", proyecto_id: "pry-activ-track", entrega_id: "ent-005", responsable_id: MARTIN, solicitante_id: PAULA, estado: "activa", prioridad: "media", tipo: "web", fecha_inicio: dias(2), fecha_fin_min: dias(4), fecha_fin_max: dias(5) },
  { id: "t-006", titulo: "Aprobar piezas finales", cliente_id: "cli-dehesa", proyecto_id: "pry-dehesa-otono", entrega_id: "ent-006", responsable_id: PAULA, solicitante_id: DANI, estado: "esperando", prioridad: "alta", tipo: "diseno", fecha_inicio: dias(2), fecha_fin_min: dias(3), fecha_fin_max: dias(4), bloqueada_por_id: "t-099" },
  { id: "t-099", titulo: "Maquetar piezas Instagram", cliente_id: "cli-dehesa", proyecto_id: "pry-dehesa-otono", entrega_id: "ent-006", responsable_id: ANDREA, solicitante_id: PAULA, estado: "haciendola", prioridad: "alta", tipo: "diseno", fecha_inicio: dias(0), fecha_fin_min: dias(2), fecha_fin_max: dias(3), desbloquea_id: "t-006" },
  { id: "t-010", titulo: "Brief campaña Black Friday", cliente_id: "cli-nimbo", proyecto_id: "pry-nimbo-bf", entrega_id: "ent-007", responsable_id: NEREA, solicitante_id: DANI, estado: "haciendola", prioridad: "alta", tipo: "estrategia", fecha_inicio: dias(-1), fecha_fin_min: dias(0), fecha_fin_max: dias(1) },
  { id: "t-011", titulo: "Reporting mensual", cliente_id: "cli-atipico", proyecto_id: "pry-atipico-ao", entrega_id: "ent-008", responsable_id: NEREA, solicitante_id: DANI, estado: "activa", prioridad: "media", tipo: "estrategia", fecha_inicio: dias(2), fecha_fin_min: dias(5), fecha_fin_max: dias(6) },
  { id: "t-012", titulo: "Revisar contrato cliente", cliente_id: "cli-sa", proyecto_id: "pry-sa-ops", entrega_id: "ent-019", responsable_id: EDU, solicitante_id: DANI, estado: "activa", prioridad: "critica", tipo: "otro", fecha_inicio: dias(-4), fecha_fin_min: dias(-2), fecha_fin_max: dias(-1) },
  { id: "t-013", titulo: "Coordinar shooting", cliente_id: "cli-fim", proyecto_id: "pry-fim-prod", entrega_id: "ent-018", responsable_id: EDU, solicitante_id: PAULA, estado: "activa", prioridad: "media", tipo: "otro", fecha_inicio: dias(4), fecha_fin_min: dias(7), fecha_fin_max: dias(8) },
  { id: "t-014", titulo: "Plantillas RRSS", cliente_id: "cli-nanami", proyecto_id: "pry-nanami-id", entrega_id: "ent-009", responsable_id: SANDRA, solicitante_id: NEREA, estado: "activa", prioridad: "media", tipo: "diseno", fecha_inicio: dias(0), fecha_fin_min: dias(2), fecha_fin_max: dias(4) },
  { id: "t-015", titulo: "Banners display", cliente_id: "cli-activtrades", proyecto_id: "pry-activ-aw", entrega_id: "ent-010", responsable_id: SANDRA, solicitante_id: RUBEN, estado: "haciendola", prioridad: "alta", tipo: "diseno", fecha_inicio: dias(-2), fecha_fin_min: dias(0), fecha_fin_max: dias(0) },
  { id: "t-016", titulo: "Calendario editorial mes", cliente_id: "cli-territorio", proyecto_id: "pry-territorio-cont", entrega_id: "ent-011", responsable_id: ANDREA, solicitante_id: NEREA, estado: "activa", prioridad: "media", tipo: "copy", fecha_inicio: dias(3), fecha_fin_min: dias(6), fecha_fin_max: dias(7) },
  { id: "t-017", titulo: "Migración correos workspace", cliente_id: "cli-sa", proyecto_id: "pry-sa-it", entrega_id: "ent-012", responsable_id: MARTIN, solicitante_id: DANI, estado: "haciendola", prioridad: "alta", tipo: "otro", fecha_inicio: dias(-1), fecha_fin_min: dias(1), fecha_fin_max: dias(2) },
  { id: "t-018", titulo: "Optimización pujas Google Ads", cliente_id: "cli-rentalmode", proyecto_id: "pry-rental-sem", entrega_id: "ent-013", responsable_id: RUBEN, solicitante_id: PAULA, estado: "activa", prioridad: "media", tipo: "campanas", fecha_inicio: dias(0), fecha_fin_min: dias(3), fecha_fin_max: dias(5) },
  { id: "t-019", titulo: "Setup campaña Meta", cliente_id: "cli-atipico", proyecto_id: "pry-atipico-lan", entrega_id: "ent-014", responsable_id: RUBEN, solicitante_id: NEREA, estado: "activa", prioridad: "media", tipo: "campanas", fecha_inicio: dias(5), fecha_fin_min: dias(8), fecha_fin_max: dias(9) },
  { id: "t-020", titulo: "Auditoría SEO técnica", cliente_id: "cli-nanami", proyecto_id: "pry-nanami-seo", entrega_id: "ent-015", responsable_id: PABLO, solicitante_id: PAULA, estado: "haciendola", prioridad: "alta", tipo: "seo", fecha_inicio: dias(-1), fecha_fin_min: dias(4), fecha_fin_max: dias(6) },
  { id: "t-021", titulo: "Artículos blog (3)", cliente_id: "cli-nimbo", proyecto_id: "pry-nimbo-seo", entrega_id: "ent-016", responsable_id: PABLO, solicitante_id: NEREA, estado: "activa", prioridad: "baja", tipo: "copy", fecha_inicio: dias(7), fecha_fin_min: dias(10), fecha_fin_max: dias(12) },
  { id: "t-022", titulo: "Plan estratégico anual", cliente_id: "cli-fim", proyecto_id: "pry-fim-est", entrega_id: "ent-017", responsable_id: DANI, solicitante_id: DANI, estado: "haciendola", prioridad: "alta", tipo: "estrategia", fecha_inicio: dias(-2), fecha_fin_min: dias(2), fecha_fin_max: dias(5) },
  { id: "t-023", titulo: "Revisión presupuestos", cliente_id: "cli-sa", proyecto_id: "pry-sa-fin", entrega_id: "ent-020", responsable_id: DANI, solicitante_id: DANI, estado: "activa", prioridad: "media", tipo: "otro", fecha_inicio: dias(8), fecha_fin_min: dias(11), fecha_fin_max: dias(13) },
  { id: "t-024", titulo: "Kickoff campaña Meta", cliente_id: "cli-atipico", proyecto_id: "pry-atipico-lan", entrega_id: "ent-014", responsable_id: PAULA, solicitante_id: NEREA, estado: "activa", prioridad: "media", tipo: "estrategia", fecha_inicio: dias(4), fecha_fin_min: dias(6), fecha_fin_max: dias(7) },
  { id: "t-025", titulo: "Briefing creativo banners", cliente_id: "cli-activtrades", proyecto_id: "pry-activ-aw", entrega_id: "ent-010", responsable_id: PAULA, solicitante_id: RUBEN, estado: "completada", prioridad: "media", tipo: "estrategia", fecha_inicio: dias(-7), fecha_fin_min: dias(-5), fecha_fin_max: dias(-5) },
  { id: "t-026", titulo: "Maquetar landing v2", cliente_id: "cli-territorio", proyecto_id: "pry-territorio-web", entrega_id: "ent-002", responsable_id: SANDRA, solicitante_id: PAULA, estado: "activa", prioridad: "alta", tipo: "diseno", fecha_inicio: dias(1), fecha_fin_min: dias(3), fecha_fin_max: dias(3) },
  { id: "t-027", titulo: "Setup tag manager", cliente_id: "cli-activtrades", proyecto_id: "pry-activ-track", entrega_id: "ent-005", responsable_id: MARTIN, solicitante_id: EDU, estado: "completada", prioridad: "media", tipo: "web", fecha_inicio: dias(-6), fecha_fin_min: dias(-3), fecha_fin_max: dias(-3) },
];

// ─── Comentarios ──────────────────────────────────────────
export const COMENTARIOS_MOCK: Comentario[] = [
  { id: "c-1", tarea_id: "t-001", autor_id: ANDREA, texto: "Listo, pasado a Paula para revisión", fecha: horasAtras(2) },
  { id: "c-2", tarea_id: "t-001", autor_id: PAULA, texto: "Le doy una vuelta esta tarde", fecha: horasAtras(1) },
  { id: "c-3", tarea_id: "t-004", autor_id: SANDRA, texto: "Tengo dos rutas creativas, te paso enlaces", fecha: horasAtras(5) },
  { id: "c-4", tarea_id: "t-006", autor_id: PAULA, texto: "Esperando que Andrea termine maquetación", fecha: horasAtras(3) },
];

// ─── Actividad ────────────────────────────────────────────
export const ACTIVIDAD_MOCK: Actividad[] = [
  { id: "a-1", tarea_id: "t-001", actor_id: ANDREA, tipo: "comentada", texto: "Andrea comentó en Revisar plan de medios Q2", fecha: horasAtras(2) },
  { id: "a-2", tarea_id: "t-027", actor_id: MARTIN, tipo: "cerrada", texto: "Martín cerró Setup tag manager", fecha: horasAtras(4) },
  { id: "a-3", tarea_id: "t-004", actor_id: SANDRA, tipo: "empezada", texto: "Sandra empezó Diseñar key visual campaña verano", fecha: horasAtras(20) },
  { id: "a-4", tarea_id: "t-010", actor_id: NEREA, tipo: "empezada", texto: "Nerea empezó Brief campaña Black Friday", fecha: horasAtras(8) },
  { id: "a-5", tarea_id: "t-026", actor_id: PAULA, tipo: "creada", texto: "Paula creó Maquetar landing v2", fecha: horasAtras(12) },
  { id: "a-6", tarea_id: "t-025", actor_id: PAULA, tipo: "cerrada", texto: "Paula cerró Briefing creativo banners", fecha: horasAtras(30) },
];

// ─── Notificaciones ───────────────────────────────────────
export const NOTIFICACIONES_MOCK: Notificacion[] = [
  { id: "n-1", texto: "Sandra cerró Diseño piezas mayo", fecha: horasAtras(0.08), leida: false, ruta: "/tareas", icono: "check" },
  { id: "n-2", texto: "Tu tarea Aprobación calendario está activa", fecha: horasAtras(1), leida: false, ruta: "/tareas", icono: "play" },
  { id: "n-3", texto: "Rubén te asignó Banner promo Meta", fecha: horasAtras(2), leida: false, ruta: "/tareas", icono: "user-plus" },
  { id: "n-4", texto: "Andrea comentó en Revisar plan de medios Q2", fecha: horasAtras(3), leida: true, ruta: "/tareas", icono: "message" },
  { id: "n-5", texto: "Vence hoy: Banners display", fecha: horasAtras(5), leida: true, ruta: "/tareas", icono: "alert" },
  { id: "n-6", texto: "Martín cerró Setup tag manager", fecha: horasAtras(8), leida: true, ruta: "/tareas", icono: "check" },
];

// ─── Lookups ──────────────────────────────────────────────
export const clientePorId = (id: UUID) => CLIENTES_MOCK.find((c) => c.id === id);
export const proyectoPorId = (id: UUID) => PROYECTOS_MOCK.find((p) => p.id === id);
export const entregaPorId = (id: UUID) => ENTREGAS_MOCK.find((e) => e.id === id);
export const tareaPorId = (id: UUID) => TAREAS_MOCK.find((t) => t.id === id);

export const nombreCliente = (id: UUID) => clientePorId(id)?.nombre ?? "—";
export const nombreProyecto = (id: UUID) => proyectoPorId(id)?.nombre ?? "—";
export const nombreEntrega = (id: UUID) => entregaPorId(id)?.nombre ?? "—";
export const tituloTarea = (id: UUID) => tareaPorId(id)?.titulo ?? "—";
