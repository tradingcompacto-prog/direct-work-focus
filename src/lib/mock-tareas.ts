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
  { id: "pry-nanami", nombre: "Nanami", cliente_id: "cli-nanami", pm_id: PAULA, estado: "activo", fecha_inicio: dias(-60) },
  { id: "pry-nimbo", nombre: "Nimbo Móvil", cliente_id: "cli-nimbo", pm_id: NEREA, estado: "activo", fecha_inicio: dias(-90) },
  { id: "pry-territorio", nombre: "Territorio Trading", cliente_id: "cli-territorio", pm_id: PAULA, estado: "activo", fecha_inicio: dias(-40) },
  { id: "pry-rentalmode", nombre: "Rental Mode", cliente_id: "cli-rentalmode", pm_id: EDU, estado: "activo", fecha_inicio: dias(-90) },
  { id: "pry-fim", nombre: "FIM Institute", cliente_id: "cli-fim", pm_id: NEREA, estado: "activo", fecha_inicio: dias(-50) },
  { id: "pry-dehesa", nombre: "La Dehesa Experiences", cliente_id: "cli-dehesa", pm_id: PAULA, estado: "activo", fecha_inicio: dias(-30) },
  { id: "pry-sa", nombre: "Social Advisor", cliente_id: "cli-sa", pm_id: DANI, estado: "activo", fecha_inicio: dias(-200) },
  { id: "pry-atipico", nombre: "Atipico", cliente_id: "cli-atipico", pm_id: NEREA, estado: "activo", fecha_inicio: dias(-90) },
  { id: "pry-activtrades", nombre: "ActivTrades", cliente_id: "cli-activtrades", pm_id: EDU, estado: "activo", fecha_inicio: dias(-30) },
];

// ─── Entregas ─────────────────────────────────────────────
export const ENTREGAS_MOCK: Entrega[] = [
  { id: "ent-001", nombre: "Plan trimestral", cliente_id: "cli-nanami", proyecto_id: "pry-nanami", pm_id: PAULA, categoria: "plan_marketing", estado: "en_curso", fecha_inicio: dias(-7), fecha_fin: dias(2) },
  { id: "ent-002", nombre: "Landing v2", cliente_id: "cli-territorio", proyecto_id: "pry-territorio", pm_id: PAULA, categoria: "web", estado: "en_curso", fecha_inicio: dias(-5), fecha_fin: dias(3) },
  { id: "ent-003", nombre: "Sesión inicial", cliente_id: "cli-fim", proyecto_id: "pry-fim", pm_id: NEREA, categoria: "plan_marketing", estado: "en_curso", fecha_inicio: dias(-2), fecha_fin: dias(4) },
  { id: "ent-004", nombre: "Key visual verano", cliente_id: "cli-rentalmode", proyecto_id: "pry-rentalmode", pm_id: EDU, categoria: "diseno", estado: "en_curso", fecha_inicio: dias(-3), fecha_fin: dias(5) },
  { id: "ent-005", nombre: "Setup GA4", cliente_id: "cli-activtrades", proyecto_id: "pry-activtrades", pm_id: EDU, categoria: "web", estado: "en_curso", fecha_inicio: dias(-1), fecha_fin: dias(6) },
  { id: "ent-006", nombre: "Piezas RRSS otoño", cliente_id: "cli-dehesa", proyecto_id: "pry-dehesa", pm_id: PAULA, categoria: "redes_sociales", estado: "en_curso", fecha_inicio: dias(-4), fecha_fin: dias(5) },
  { id: "ent-007", nombre: "Brief BF", cliente_id: "cli-nimbo", proyecto_id: "pry-nimbo", pm_id: NEREA, categoria: "campana", estado: "en_curso", fecha_inicio: dias(-2), fecha_fin: dias(2) },
  { id: "ent-008", nombre: "Informe mensual", cliente_id: "cli-atipico", proyecto_id: "pry-atipico", pm_id: NEREA, categoria: "informe_mensual", estado: "en_curso", fecha_inicio: dias(-3), fecha_fin: dias(7) },
  { id: "ent-009", nombre: "Templates RRSS Nanami", cliente_id: "cli-nanami", proyecto_id: "pry-nanami", pm_id: PAULA, categoria: "redes_sociales", estado: "en_curso", fecha_inicio: dias(-6), fecha_fin: dias(5) },
  { id: "ent-010", nombre: "Banners ActivTrades", cliente_id: "cli-activtrades", proyecto_id: "pry-activtrades", pm_id: EDU, categoria: "anuncios", estado: "en_curso", fecha_inicio: dias(-2), fecha_fin: dias(1) },
  { id: "ent-011", nombre: "Calendario editorial", cliente_id: "cli-territorio", proyecto_id: "pry-territorio", pm_id: NEREA, categoria: "redes_sociales", estado: "en_curso", fecha_inicio: dias(-1), fecha_fin: dias(8) },
  { id: "ent-012", nombre: "Migración workspace", cliente_id: "cli-sa", proyecto_id: "pry-sa", pm_id: DANI, categoria: "web", estado: "en_curso", fecha_inicio: dias(-2), fecha_fin: dias(3) },
  { id: "ent-013", nombre: "Optimización SEM", cliente_id: "cli-rentalmode", proyecto_id: "pry-rentalmode", pm_id: EDU, categoria: "campanas_activas", estado: "en_curso", fecha_inicio: dias(-3), fecha_fin: dias(6) },
  { id: "ent-014", nombre: "Setup campaña Meta", cliente_id: "cli-atipico", proyecto_id: "pry-atipico", pm_id: NEREA, categoria: "campanas_activas", estado: "en_curso", fecha_inicio: dias(0), fecha_fin: dias(10) },
  { id: "ent-015", nombre: "Auditoría SEO", cliente_id: "cli-nanami", proyecto_id: "pry-nanami", pm_id: PAULA, categoria: "seo", estado: "en_curso", fecha_inicio: dias(-3), fecha_fin: dias(7) },
  { id: "ent-016", nombre: "Posts blog", cliente_id: "cli-nimbo", proyecto_id: "pry-nimbo", pm_id: NEREA, categoria: "seo", estado: "en_curso", fecha_inicio: dias(-4), fecha_fin: dias(13) },
  { id: "ent-017", nombre: "Plan estratégico FIM", cliente_id: "cli-fim", proyecto_id: "pry-fim", pm_id: DANI, categoria: "plan_marketing", estado: "en_curso", fecha_inicio: dias(-5), fecha_fin: dias(6) },
  { id: "ent-018", nombre: "Shooting día 1", cliente_id: "cli-fim", proyecto_id: "pry-fim", pm_id: EDU, categoria: "fotografia", estado: "en_curso", fecha_inicio: dias(2), fecha_fin: dias(8) },
  { id: "ent-019", nombre: "Contrato Atipico", cliente_id: "cli-sa", proyecto_id: "pry-sa", pm_id: DANI, categoria: "product_brief", estado: "cerrada", fecha_inicio: dias(-15), fecha_fin: dias(-2), fecha_cierre: dias(-1) },
  { id: "ent-020", nombre: "Revisión presupuestos", cliente_id: "cli-sa", proyecto_id: "pry-sa", pm_id: DANI, categoria: "plan_marketing", estado: "en_curso", fecha_inicio: dias(-1), fecha_fin: dias(13) },
  { id: "ent-021", nombre: "Branding inicial", cliente_id: "cli-nanami", proyecto_id: "pry-nanami", pm_id: PAULA, categoria: "diseno", estado: "cerrada", fecha_inicio: dias(-40), fecha_fin: dias(-5), fecha_cierre: dias(-3) },
];

// ─── Auto-completar entregas: cada cliente debe tener una entrega por cada categoría ───
(() => {
  const TODAS_CATEGORIAS: Array<import("@/types/database").CategoriaEntrega> = [
    "redes_sociales", "web", "campana", "informe_mensual", "seo", "diseno",
    "anuncios", "fotografia", "product_brief", "plan_marketing", "campanas_activas",
  ];
  const NOMBRE_POR_CAT: Record<string, string> = {
    redes_sociales: "Plan RRSS",
    web: "Mantenimiento web",
    campana: "Campaña estacional",
    informe_mensual: "Informe mensual",
    seo: "SEO orgánico",
    diseno: "Piezas de diseño",
    anuncios: "Anuncios display",
    fotografia: "Producción fotográfica",
    product_brief: "Product brief",
    plan_marketing: "Plan de marketing",
    campanas_activas: "Campañas activas",
  };
  let contador = 100;
  for (const cli of CLIENTES_MOCK) {
    const pry = PROYECTOS_MOCK.find((p) => p.cliente_id === cli.id);
    if (!pry) continue;
    const existentes = new Set(
      ENTREGAS_MOCK.filter((e) => e.cliente_id === cli.id).map((e) => e.categoria),
    );
    for (const cat of TODAS_CATEGORIAS) {
      if (existentes.has(cat)) continue;
      contador += 1;
      ENTREGAS_MOCK.push({
        id: `ent-${contador}`,
        nombre: `${NOMBRE_POR_CAT[cat]} — ${cli.nombre}`,
        cliente_id: cli.id,
        proyecto_id: pry.id,
        pm_id: cli.pm_id,
        categoria: cat,
        estado: "en_curso",
        fecha_inicio: dias(-5),
        fecha_fin: dias(15),
      });
    }
  }
})();

// ─── Tareas ───────────────────────────────────────────────
export const TAREAS_MOCK: Tarea[] = [
  { id: "t-001", titulo: "Revisar plan de medios Q2", descripcion: "Repasar mix de canales y presupuestos.", cliente_id: "cli-nanami", proyecto_id: "pry-nanami", entrega_id: "ent-001", responsable_id: PAULA, solicitante_id: DANI, estado: "haciendola", prioridad: "alta", fecha_inicio: dias(-3), fecha_fin_min: dias(-1), fecha_fin_max: dias(-1) },
  { id: "t-002", titulo: "Validar copy para landing principal", cliente_id: "cli-territorio", proyecto_id: "pry-territorio", entrega_id: "ent-002", responsable_id: PAULA, solicitante_id: PAULA, estado: "activa", prioridad: "media", fecha_inicio: dias(-1), fecha_fin_min: dias(0), fecha_fin_max: dias(0) },
  { id: "t-003", titulo: "Reunión kickoff con cliente", cliente_id: "cli-fim", proyecto_id: "pry-fim", entrega_id: "ent-003", responsable_id: PAULA, solicitante_id: NEREA, estado: "activa", prioridad: "media", fecha_inicio: dias(1), fecha_fin_min: dias(2), fecha_fin_max: dias(3) },
  { id: "t-004", titulo: "Diseñar key visual campaña verano", cliente_id: "cli-rentalmode", proyecto_id: "pry-rentalmode", entrega_id: "ent-004", responsable_id: SANDRA, solicitante_id: PAULA, estado: "haciendola", prioridad: "alta", fecha_inicio: dias(-2), fecha_fin_min: dias(1), fecha_fin_max: dias(2) },
  { id: "t-005", titulo: "Configurar conversiones GA4", cliente_id: "cli-activtrades", proyecto_id: "pry-activtrades", entrega_id: "ent-005", responsable_id: MARTIN, solicitante_id: PAULA, estado: "activa", prioridad: "media", fecha_inicio: dias(2), fecha_fin_min: dias(4), fecha_fin_max: dias(5) },
  { id: "t-006", titulo: "Aprobar piezas finales", cliente_id: "cli-dehesa", proyecto_id: "pry-dehesa", entrega_id: "ent-006", responsable_id: PAULA, solicitante_id: DANI, estado: "pausada", prioridad: "alta", fecha_inicio: dias(2), fecha_fin_min: dias(3), fecha_fin_max: dias(4) },
  { id: "t-099", titulo: "Maquetar piezas Instagram", cliente_id: "cli-dehesa", proyecto_id: "pry-dehesa", entrega_id: "ent-006", responsable_id: ANDREA, solicitante_id: PAULA, estado: "haciendola", prioridad: "alta", fecha_inicio: dias(0), fecha_fin_min: dias(2), fecha_fin_max: dias(3) },
  { id: "t-010", titulo: "Brief campaña Black Friday", cliente_id: "cli-nimbo", proyecto_id: "pry-nimbo", entrega_id: "ent-007", responsable_id: NEREA, solicitante_id: DANI, estado: "haciendola", prioridad: "alta", fecha_inicio: dias(-1), fecha_fin_min: dias(0), fecha_fin_max: dias(1) },
  { id: "t-011", titulo: "Reporting mensual", cliente_id: "cli-atipico", proyecto_id: "pry-atipico", entrega_id: "ent-008", responsable_id: NEREA, solicitante_id: DANI, estado: "activa", prioridad: "media", fecha_inicio: dias(2), fecha_fin_min: dias(5), fecha_fin_max: dias(6) },
  { id: "t-012", titulo: "Revisar contrato cliente", cliente_id: "cli-sa", proyecto_id: "pry-sa", entrega_id: "ent-019", responsable_id: EDU, solicitante_id: DANI, estado: "activa", prioridad: "critica", fecha_inicio: dias(-4), fecha_fin_min: dias(-2), fecha_fin_max: dias(-1) },
  { id: "t-013", titulo: "Coordinar shooting", cliente_id: "cli-fim", proyecto_id: "pry-fim", entrega_id: "ent-018", responsable_id: EDU, solicitante_id: PAULA, estado: "activa", prioridad: "media", fecha_inicio: dias(4), fecha_fin_min: dias(7), fecha_fin_max: dias(8) },
  { id: "t-014", titulo: "Plantillas RRSS", cliente_id: "cli-nanami", proyecto_id: "pry-nanami", entrega_id: "ent-009", responsable_id: SANDRA, solicitante_id: NEREA, estado: "activa", prioridad: "media", fecha_inicio: dias(0), fecha_fin_min: dias(2), fecha_fin_max: dias(4) },
  { id: "t-015", titulo: "Banners display", cliente_id: "cli-activtrades", proyecto_id: "pry-activtrades", entrega_id: "ent-010", responsable_id: SANDRA, solicitante_id: RUBEN, estado: "haciendola", prioridad: "alta", fecha_inicio: dias(-2), fecha_fin_min: dias(0), fecha_fin_max: dias(0) },
  { id: "t-016", titulo: "Calendario editorial mes", cliente_id: "cli-territorio", proyecto_id: "pry-territorio", entrega_id: "ent-011", responsable_id: ANDREA, solicitante_id: NEREA, estado: "activa", prioridad: "media", fecha_inicio: dias(3), fecha_fin_min: dias(6), fecha_fin_max: dias(7) },
  { id: "t-017", titulo: "Migración correos workspace", cliente_id: "cli-sa", proyecto_id: "pry-sa", entrega_id: "ent-012", responsable_id: MARTIN, solicitante_id: DANI, estado: "haciendola", prioridad: "alta", fecha_inicio: dias(-1), fecha_fin_min: dias(1), fecha_fin_max: dias(2) },
  { id: "t-018", titulo: "Optimización pujas Google Ads", cliente_id: "cli-rentalmode", proyecto_id: "pry-rentalmode", entrega_id: "ent-013", responsable_id: RUBEN, solicitante_id: PAULA, estado: "activa", prioridad: "media", fecha_inicio: dias(0), fecha_fin_min: dias(3), fecha_fin_max: dias(5) },
  { id: "t-019", titulo: "Setup campaña Meta", cliente_id: "cli-atipico", proyecto_id: "pry-atipico", entrega_id: "ent-014", responsable_id: RUBEN, solicitante_id: NEREA, estado: "activa", prioridad: "media", fecha_inicio: dias(5), fecha_fin_min: dias(8), fecha_fin_max: dias(9) },
  { id: "t-020", titulo: "Auditoría SEO técnica", cliente_id: "cli-nanami", proyecto_id: "pry-nanami", entrega_id: "ent-015", responsable_id: PABLO, solicitante_id: PAULA, estado: "haciendola", prioridad: "alta", fecha_inicio: dias(-1), fecha_fin_min: dias(4), fecha_fin_max: dias(6) },
  { id: "t-021", titulo: "Artículos blog (3)", cliente_id: "cli-nimbo", proyecto_id: "pry-nimbo", entrega_id: "ent-016", responsable_id: PABLO, solicitante_id: NEREA, estado: "activa", prioridad: "baja", fecha_inicio: dias(7), fecha_fin_min: dias(10), fecha_fin_max: dias(12) },
  { id: "t-022", titulo: "Plan estratégico anual", cliente_id: "cli-fim", proyecto_id: "pry-fim", entrega_id: "ent-017", responsable_id: DANI, solicitante_id: DANI, estado: "haciendola", prioridad: "alta", fecha_inicio: dias(-2), fecha_fin_min: dias(2), fecha_fin_max: dias(5) },
  { id: "t-023", titulo: "Revisión presupuestos", cliente_id: "cli-sa", proyecto_id: "pry-sa", entrega_id: "ent-020", responsable_id: DANI, solicitante_id: DANI, estado: "activa", prioridad: "media", fecha_inicio: dias(8), fecha_fin_min: dias(11), fecha_fin_max: dias(13) },
  { id: "t-024", titulo: "Kickoff campaña Meta", cliente_id: "cli-atipico", proyecto_id: "pry-atipico", entrega_id: "ent-014", responsable_id: PAULA, solicitante_id: NEREA, estado: "activa", prioridad: "media", fecha_inicio: dias(4), fecha_fin_min: dias(6), fecha_fin_max: dias(7) },
  { id: "t-025", titulo: "Briefing creativo banners", cliente_id: "cli-activtrades", proyecto_id: "pry-activtrades", entrega_id: "ent-010", responsable_id: PAULA, solicitante_id: RUBEN, estado: "completada", prioridad: "media", fecha_inicio: dias(-7), fecha_fin_min: dias(-5), fecha_fin_max: dias(-5) },
  // (horas se inyectan más abajo en bloque histórico)
  { id: "t-026", titulo: "Maquetar landing v2", cliente_id: "cli-territorio", proyecto_id: "pry-territorio", entrega_id: "ent-002", responsable_id: SANDRA, solicitante_id: PAULA, estado: "activa", prioridad: "alta", fecha_inicio: dias(1), fecha_fin_min: dias(3), fecha_fin_max: dias(3) },
  { id: "t-027", titulo: "Setup tag manager", cliente_id: "cli-activtrades", proyecto_id: "pry-activtrades", entrega_id: "ent-005", responsable_id: MARTIN, solicitante_id: EDU, estado: "completada", prioridad: "media", fecha_inicio: dias(-6), fecha_fin_min: dias(-3), fecha_fin_max: dias(-3) },
  { id: "t-100", titulo: "Plan editorial", cliente_id: "cli-dehesa", proyecto_id: "pry-dehesa", entrega_id: "ent-006", responsable_id: "22222222-2222-2222-2222-222222222222", solicitante_id: "22222222-2222-2222-2222-222222222222", estado: "haciendola", prioridad: "alta", fecha_inicio: dias(-8), fecha_fin_min: dias(-4), fecha_fin_max: dias(-3) },
  { id: "t-101", titulo: "Buyer persona", cliente_id: "cli-territorio", proyecto_id: "pry-territorio", entrega_id: "ent-002", responsable_id: "22222222-2222-2222-2222-222222222222", solicitante_id: "22222222-2222-2222-2222-222222222222", estado: "haciendola", prioridad: "critica", fecha_inicio: dias(-6), fecha_fin_min: dias(-2), fecha_fin_max: dias(-1) },
  { id: "t-102", titulo: "Maquetar piezas RRSS", cliente_id: "cli-nanami", proyecto_id: "pry-nanami", entrega_id: "ent-009", responsable_id: "22222222-2222-2222-2222-222222222222", solicitante_id: "22222222-2222-2222-2222-222222222222", estado: "pausada", prioridad: "critica", fecha_inicio: dias(0), fecha_fin_min: dias(3), fecha_fin_max: dias(4) },
  { id: "t-103", titulo: "Texto SEO categoría", cliente_id: "cli-territorio", proyecto_id: "pry-territorio", entrega_id: "ent-011", responsable_id: "22222222-2222-2222-2222-222222222222", solicitante_id: "22222222-2222-2222-2222-222222222222", estado: "pausada", prioridad: "alta", fecha_inicio: dias(2), fecha_fin_min: dias(5), fecha_fin_max: dias(6) },
  { id: "t-104", titulo: "Brief campaña", cliente_id: "cli-fim", proyecto_id: "pry-fim", entrega_id: "ent-003", responsable_id: "22222222-2222-2222-2222-222222222222", solicitante_id: "22222222-2222-2222-2222-222222222222", estado: "haciendola", prioridad: "baja", fecha_inicio: dias(-3), fecha_fin_min: dias(1), fecha_fin_max: dias(2) },
  { id: "t-105", titulo: "Plan editorial", cliente_id: "cli-atipico", proyecto_id: "pry-atipico", entrega_id: "ent-014", responsable_id: "22222222-2222-2222-2222-222222222222", solicitante_id: "22222222-2222-2222-2222-222222222222", estado: "activa", prioridad: "baja", fecha_inicio: dias(2), fecha_fin_min: dias(4), fecha_fin_max: dias(5) },
  { id: "t-106", titulo: "Branding stories", cliente_id: "cli-territorio", proyecto_id: "pry-territorio", entrega_id: "ent-002", responsable_id: "55555555-5555-5555-5555-555555555555", solicitante_id: "22222222-2222-2222-2222-222222222222", estado: "activa", prioridad: "alta", fecha_inicio: dias(-1), fecha_fin_min: dias(1), fecha_fin_max: dias(2) },
  { id: "t-107", titulo: "Branding stories", cliente_id: "cli-fim", proyecto_id: "pry-fim", entrega_id: "ent-003", responsable_id: "55555555-5555-5555-5555-555555555555", solicitante_id: "22222222-2222-2222-2222-222222222222", estado: "haciendola", prioridad: "media", fecha_inicio: dias(3), fecha_fin_min: dias(5), fecha_fin_max: dias(6) },
  { id: "t-108", titulo: "Branding stories", cliente_id: "cli-rentalmode", proyecto_id: "pry-rentalmode", entrega_id: "ent-004", responsable_id: "55555555-5555-5555-5555-555555555555", solicitante_id: "22222222-2222-2222-2222-222222222222", estado: "pausada", prioridad: "critica", fecha_inicio: dias(2), fecha_fin_min: dias(6), fecha_fin_max: dias(7) },
  { id: "t-109", titulo: "Adaptar key visual", cliente_id: "cli-activtrades", proyecto_id: "pry-activtrades", entrega_id: "ent-005", responsable_id: "55555555-5555-5555-5555-555555555555", solicitante_id: "22222222-2222-2222-2222-222222222222", estado: "activa", prioridad: "alta", fecha_inicio: dias(-7), fecha_fin_min: dias(-3), fecha_fin_max: dias(-2) },
  { id: "t-110", titulo: "Mockup landing", cliente_id: "cli-dehesa", proyecto_id: "pry-dehesa", entrega_id: "ent-006", responsable_id: "55555555-5555-5555-5555-555555555555", solicitante_id: "22222222-2222-2222-2222-222222222222", estado: "haciendola", prioridad: "critica", fecha_inicio: dias(0), fecha_fin_min: dias(4), fecha_fin_max: dias(5) },
  { id: "t-111", titulo: "Adaptar key visual", cliente_id: "cli-nimbo", proyecto_id: "pry-nimbo", entrega_id: "ent-007", responsable_id: "55555555-5555-5555-5555-555555555555", solicitante_id: "22222222-2222-2222-2222-222222222222", estado: "pausada", prioridad: "alta", fecha_inicio: dias(-5), fecha_fin_min: dias(-2), fecha_fin_max: dias(-1) },
  { id: "t-112", titulo: "Iconografía web", cliente_id: "cli-atipico", proyecto_id: "pry-atipico", entrega_id: "ent-008", responsable_id: "55555555-5555-5555-5555-555555555555", solicitante_id: "22222222-2222-2222-2222-222222222222", estado: "activa", prioridad: "baja", fecha_inicio: dias(-6), fecha_fin_min: dias(-2), fecha_fin_max: dias(-1) },
  { id: "t-113", titulo: "Adaptar key visual", cliente_id: "cli-nanami", proyecto_id: "pry-nanami", entrega_id: "ent-009", responsable_id: "55555555-5555-5555-5555-555555555555", solicitante_id: "22222222-2222-2222-2222-222222222222", estado: "haciendola", prioridad: "baja", fecha_inicio: dias(5), fecha_fin_min: dias(9), fecha_fin_max: dias(10) },
  { id: "t-114", titulo: "Iconografía web", cliente_id: "cli-activtrades", proyecto_id: "pry-activtrades", entrega_id: "ent-010", responsable_id: "55555555-5555-5555-5555-555555555555", solicitante_id: "22222222-2222-2222-2222-222222222222", estado: "pausada", prioridad: "critica", fecha_inicio: dias(5), fecha_fin_min: dias(7), fecha_fin_max: dias(8) },
  { id: "t-115", titulo: "Mockup landing", cliente_id: "cli-territorio", proyecto_id: "pry-territorio", entrega_id: "ent-011", responsable_id: "55555555-5555-5555-5555-555555555555", solicitante_id: "22222222-2222-2222-2222-222222222222", estado: "activa", prioridad: "alta", fecha_inicio: dias(-5), fecha_fin_min: dias(-2), fecha_fin_max: dias(-1) },
  { id: "t-116", titulo: "Diseño banner display", cliente_id: "cli-sa", proyecto_id: "pry-sa", entrega_id: "ent-012", responsable_id: "55555555-5555-5555-5555-555555555555", solicitante_id: "22222222-2222-2222-2222-222222222222", estado: "haciendola", prioridad: "baja", fecha_inicio: dias(4), fecha_fin_min: dias(6), fecha_fin_max: dias(7) },
  { id: "t-117", titulo: "Diseño post carrusel", cliente_id: "cli-rentalmode", proyecto_id: "pry-rentalmode", entrega_id: "ent-013", responsable_id: "55555555-5555-5555-5555-555555555555", solicitante_id: "22222222-2222-2222-2222-222222222222", estado: "pausada", prioridad: "baja", fecha_inicio: dias(0), fecha_fin_min: dias(2), fecha_fin_max: dias(3) },
  { id: "t-118", titulo: "Maquetar piezas RRSS", cliente_id: "cli-rentalmode", proyecto_id: "pry-rentalmode", entrega_id: "ent-004", responsable_id: "66666666-6666-6666-6666-666666666666", solicitante_id: "22222222-2222-2222-2222-222222222222", estado: "activa", prioridad: "alta", fecha_inicio: dias(-2), fecha_fin_min: dias(0), fecha_fin_max: dias(1) },
  { id: "t-119", titulo: "Diseño banner display", cliente_id: "cli-activtrades", proyecto_id: "pry-activtrades", entrega_id: "ent-005", responsable_id: "66666666-6666-6666-6666-666666666666", solicitante_id: "22222222-2222-2222-2222-222222222222", estado: "haciendola", prioridad: "critica", fecha_inicio: dias(-1), fecha_fin_min: dias(2), fecha_fin_max: dias(3) },
  { id: "t-120", titulo: "Maquetar piezas RRSS", cliente_id: "cli-dehesa", proyecto_id: "pry-dehesa", entrega_id: "ent-006", responsable_id: "66666666-6666-6666-6666-666666666666", solicitante_id: "22222222-2222-2222-2222-222222222222", estado: "activa", prioridad: "critica", fecha_inicio: dias(2), fecha_fin_min: dias(5), fecha_fin_max: dias(6) },
  { id: "t-121", titulo: "Plantilla newsletter", cliente_id: "cli-nimbo", proyecto_id: "pry-nimbo", entrega_id: "ent-007", responsable_id: "66666666-6666-6666-6666-666666666666", solicitante_id: "22222222-2222-2222-2222-222222222222", estado: "haciendola", prioridad: "media", fecha_inicio: dias(-4), fecha_fin_min: dias(0), fecha_fin_max: dias(1) },
  { id: "t-122", titulo: "Maquetar piezas RRSS", cliente_id: "cli-atipico", proyecto_id: "pry-atipico", entrega_id: "ent-008", responsable_id: "66666666-6666-6666-6666-666666666666", solicitante_id: "22222222-2222-2222-2222-222222222222", estado: "activa", prioridad: "critica", fecha_inicio: dias(2), fecha_fin_min: dias(5), fecha_fin_max: dias(6) },
  { id: "t-123", titulo: "Brief campaña", cliente_id: "cli-fim", proyecto_id: "pry-fim", entrega_id: "ent-003", responsable_id: "33333333-3333-3333-3333-333333333333", solicitante_id: "22222222-2222-2222-2222-222222222222", estado: "activa", prioridad: "critica", fecha_inicio: dias(-2), fecha_fin_min: dias(2), fecha_fin_max: dias(3) },
  { id: "t-124", titulo: "Redacción artículo blog", cliente_id: "cli-rentalmode", proyecto_id: "pry-rentalmode", entrega_id: "ent-004", responsable_id: "33333333-3333-3333-3333-333333333333", solicitante_id: "22222222-2222-2222-2222-222222222222", estado: "haciendola", prioridad: "alta", fecha_inicio: dias(-5), fecha_fin_min: dias(-1), fecha_fin_max: dias(0) },
  { id: "t-125", titulo: "Workshop posicionamiento", cliente_id: "cli-activtrades", proyecto_id: "pry-activtrades", entrega_id: "ent-005", responsable_id: "33333333-3333-3333-3333-333333333333", solicitante_id: "22222222-2222-2222-2222-222222222222", estado: "pausada", prioridad: "baja", fecha_inicio: dias(4), fecha_fin_min: dias(7), fecha_fin_max: dias(8) },
  { id: "t-126", titulo: "Propuesta naming", cliente_id: "cli-dehesa", proyecto_id: "pry-dehesa", entrega_id: "ent-006", responsable_id: "33333333-3333-3333-3333-333333333333", solicitante_id: "22222222-2222-2222-2222-222222222222", estado: "activa", prioridad: "critica", fecha_inicio: dias(2), fecha_fin_min: dias(4), fecha_fin_max: dias(5) },
  { id: "t-127", titulo: "Plan editorial", cliente_id: "cli-nimbo", proyecto_id: "pry-nimbo", entrega_id: "ent-007", responsable_id: "33333333-3333-3333-3333-333333333333", solicitante_id: "22222222-2222-2222-2222-222222222222", estado: "haciendola", prioridad: "baja", fecha_inicio: dias(0), fecha_fin_min: dias(4), fecha_fin_max: dias(5) },
  { id: "t-128", titulo: "Redacción artículo blog", cliente_id: "cli-atipico", proyecto_id: "pry-atipico", entrega_id: "ent-008", responsable_id: "33333333-3333-3333-3333-333333333333", solicitante_id: "22222222-2222-2222-2222-222222222222", estado: "pausada", prioridad: "alta", fecha_inicio: dias(2), fecha_fin_min: dias(4), fecha_fin_max: dias(5) },
  { id: "t-129", titulo: "Coordinar shooting", cliente_id: "cli-activtrades", proyecto_id: "pry-activtrades", entrega_id: "ent-005", responsable_id: "44444444-4444-4444-4444-444444444444", solicitante_id: "22222222-2222-2222-2222-222222222222", estado: "activa", prioridad: "critica", fecha_inicio: dias(0), fecha_fin_min: dias(2), fecha_fin_max: dias(3) },
  { id: "t-130", titulo: "Integrar pixel Meta", cliente_id: "cli-dehesa", proyecto_id: "pry-dehesa", entrega_id: "ent-006", responsable_id: "44444444-4444-4444-4444-444444444444", solicitante_id: "22222222-2222-2222-2222-222222222222", estado: "haciendola", prioridad: "alta", fecha_inicio: dias(5), fecha_fin_min: dias(7), fecha_fin_max: dias(8) },
  { id: "t-131", titulo: "Reunión kickoff", cliente_id: "cli-nimbo", proyecto_id: "pry-nimbo", entrega_id: "ent-007", responsable_id: "44444444-4444-4444-4444-444444444444", solicitante_id: "22222222-2222-2222-2222-222222222222", estado: "activa", prioridad: "baja", fecha_inicio: dias(-2), fecha_fin_min: dias(0), fecha_fin_max: dias(1) },
  { id: "t-132", titulo: "Onboarding interno", cliente_id: "cli-atipico", proyecto_id: "pry-atipico", entrega_id: "ent-008", responsable_id: "44444444-4444-4444-4444-444444444444", solicitante_id: "22222222-2222-2222-2222-222222222222", estado: "haciendola", prioridad: "baja", fecha_inicio: dias(-4), fecha_fin_min: dias(0), fecha_fin_max: dias(1) },
  { id: "t-133", titulo: "QA cross-browser", cliente_id: "cli-nanami", proyecto_id: "pry-nanami", entrega_id: "ent-009", responsable_id: "44444444-4444-4444-4444-444444444444", solicitante_id: "22222222-2222-2222-2222-222222222222", estado: "activa", prioridad: "media", fecha_inicio: dias(-4), fecha_fin_min: dias(-1), fecha_fin_max: dias(0) },
  { id: "t-134", titulo: "Optimizar velocidad", cliente_id: "cli-dehesa", proyecto_id: "pry-dehesa", entrega_id: "ent-006", responsable_id: "77777777-7777-7777-7777-777777777777", solicitante_id: "22222222-2222-2222-2222-222222222222", estado: "activa", prioridad: "alta", fecha_inicio: dias(3), fecha_fin_min: dias(5), fecha_fin_max: dias(6) },
  { id: "t-135", titulo: "Optimizar velocidad", cliente_id: "cli-nimbo", proyecto_id: "pry-nimbo", entrega_id: "ent-007", responsable_id: "77777777-7777-7777-7777-777777777777", solicitante_id: "22222222-2222-2222-2222-222222222222", estado: "haciendola", prioridad: "media", fecha_inicio: dias(-1), fecha_fin_min: dias(3), fecha_fin_max: dias(4) },
  { id: "t-136", titulo: "Setup eventos GA4", cliente_id: "cli-atipico", proyecto_id: "pry-atipico", entrega_id: "ent-008", responsable_id: "77777777-7777-7777-7777-777777777777", solicitante_id: "22222222-2222-2222-2222-222222222222", estado: "activa", prioridad: "baja", fecha_inicio: dias(4), fecha_fin_min: dias(7), fecha_fin_max: dias(8) },
  { id: "t-137", titulo: "Crear conjunto anuncios", cliente_id: "cli-nimbo", proyecto_id: "pry-nimbo", entrega_id: "ent-007", responsable_id: "88888888-8888-8888-8888-888888888888", solicitante_id: "22222222-2222-2222-2222-222222222222", estado: "activa", prioridad: "critica", fecha_inicio: dias(-6), fecha_fin_min: dias(-2), fecha_fin_max: dias(-1) },
  { id: "t-138", titulo: "Lanzar campaña Meta", cliente_id: "cli-atipico", proyecto_id: "pry-atipico", entrega_id: "ent-008", responsable_id: "88888888-8888-8888-8888-888888888888", solicitante_id: "22222222-2222-2222-2222-222222222222", estado: "haciendola", prioridad: "baja", fecha_inicio: dias(1), fecha_fin_min: dias(5), fecha_fin_max: dias(6) },
  { id: "t-139", titulo: "Crear conjunto anuncios", cliente_id: "cli-nanami", proyecto_id: "pry-nanami", entrega_id: "ent-009", responsable_id: "88888888-8888-8888-8888-888888888888", solicitante_id: "22222222-2222-2222-2222-222222222222", estado: "activa", prioridad: "media", fecha_inicio: dias(2), fecha_fin_min: dias(5), fecha_fin_max: dias(6) },
  { id: "t-140", titulo: "Pausar campañas BF", cliente_id: "cli-activtrades", proyecto_id: "pry-activtrades", entrega_id: "ent-010", responsable_id: "88888888-8888-8888-8888-888888888888", solicitante_id: "22222222-2222-2222-2222-222222222222", estado: "haciendola", prioridad: "media", fecha_inicio: dias(3), fecha_fin_min: dias(7), fecha_fin_max: dias(8) },
  { id: "t-141", titulo: "Optimizar pujas Google", cliente_id: "cli-territorio", proyecto_id: "pry-territorio", entrega_id: "ent-011", responsable_id: "88888888-8888-8888-8888-888888888888", solicitante_id: "22222222-2222-2222-2222-222222222222", estado: "activa", prioridad: "alta", fecha_inicio: dias(4), fecha_fin_min: dias(7), fecha_fin_max: dias(8) },
  { id: "t-142", titulo: "Auditoría backlinks", cliente_id: "cli-atipico", proyecto_id: "pry-atipico", entrega_id: "ent-008", responsable_id: "99999999-9999-9999-9999-999999999999", solicitante_id: "22222222-2222-2222-2222-222222222222", estado: "activa", prioridad: "critica", fecha_inicio: dias(7), fecha_fin_min: dias(11), fecha_fin_max: dias(12) },
  { id: "t-143", titulo: "Auditoría backlinks", cliente_id: "cli-nanami", proyecto_id: "pry-nanami", entrega_id: "ent-009", responsable_id: "99999999-9999-9999-9999-999999999999", solicitante_id: "22222222-2222-2222-2222-222222222222", estado: "haciendola", prioridad: "baja", fecha_inicio: dias(7), fecha_fin_min: dias(9), fecha_fin_max: dias(10) },
  { id: "t-144", titulo: "Contenido pillar", cliente_id: "cli-activtrades", proyecto_id: "pry-activtrades", entrega_id: "ent-010", responsable_id: "99999999-9999-9999-9999-999999999999", solicitante_id: "22222222-2222-2222-2222-222222222222", estado: "activa", prioridad: "baja", fecha_inicio: dias(2), fecha_fin_min: dias(6), fecha_fin_max: dias(7) },
  { id: "t-145", titulo: "Schema markup", cliente_id: "cli-territorio", proyecto_id: "pry-territorio", entrega_id: "ent-011", responsable_id: "99999999-9999-9999-9999-999999999999", solicitante_id: "22222222-2222-2222-2222-222222222222", estado: "haciendola", prioridad: "baja", fecha_inicio: dias(-3), fecha_fin_min: dias(1), fecha_fin_max: dias(2) },
  { id: "t-146", titulo: "Workshop posicionamiento", cliente_id: "cli-nanami", proyecto_id: "pry-nanami", entrega_id: "ent-009", responsable_id: "11111111-1111-1111-1111-111111111111", solicitante_id: "22222222-2222-2222-2222-222222222222", estado: "activa", prioridad: "alta", fecha_inicio: dias(-2), fecha_fin_min: dias(2), fecha_fin_max: dias(3) },
  { id: "t-147", titulo: "Roadmap Q3", cliente_id: "cli-activtrades", proyecto_id: "pry-activtrades", entrega_id: "ent-010", responsable_id: "11111111-1111-1111-1111-111111111111", solicitante_id: "22222222-2222-2222-2222-222222222222", estado: "activa", prioridad: "baja", fecha_inicio: dias(5), fecha_fin_min: dias(8), fecha_fin_max: dias(9) },
  { id: "t-148", titulo: "Adaptar key visual", cliente_id: "cli-nanami", proyecto_id: "pry-nanami", entrega_id: "ent-001", responsable_id: "55555555-5555-5555-5555-555555555555", solicitante_id: "22222222-2222-2222-2222-222222222222", estado: "completada", prioridad: "media", fecha_inicio: dias(-5), fecha_fin_min: dias(-3), fecha_fin_max: dias(-2) },
  { id: "t-149", titulo: "Texto SEO categoría", cliente_id: "cli-territorio", proyecto_id: "pry-territorio", entrega_id: "ent-002", responsable_id: "66666666-6666-6666-6666-666666666666", solicitante_id: "22222222-2222-2222-2222-222222222222", estado: "completada", prioridad: "critica", fecha_inicio: dias(-8), fecha_fin_min: dias(-4), fecha_fin_max: dias(-3) },
  { id: "t-150", titulo: "Setup analítica", cliente_id: "cli-fim", proyecto_id: "pry-fim", entrega_id: "ent-003", responsable_id: "88888888-8888-8888-8888-888888888888", solicitante_id: "22222222-2222-2222-2222-222222222222", estado: "completada", prioridad: "critica", fecha_inicio: dias(-8), fecha_fin_min: dias(-5), fecha_fin_max: dias(-4) },
  { id: "t-151", titulo: "Reporte semanal Ads", cliente_id: "cli-rentalmode", proyecto_id: "pry-rentalmode", entrega_id: "ent-004", responsable_id: "99999999-9999-9999-9999-999999999999", solicitante_id: "22222222-2222-2222-2222-222222222222", estado: "completada", prioridad: "alta", fecha_inicio: dias(-9), fecha_fin_min: dias(-6), fecha_fin_max: dias(-5) },
  { id: "t-152", titulo: "Auditoría SEO técnica", cliente_id: "cli-activtrades", proyecto_id: "pry-activtrades", entrega_id: "ent-005", responsable_id: "77777777-7777-7777-7777-777777777777", solicitante_id: "22222222-2222-2222-2222-222222222222", estado: "completada", prioridad: "critica", fecha_inicio: dias(-11), fecha_fin_min: dias(-7), fecha_fin_max: dias(-6) },
  { id: "t-153", titulo: "Reunión kickoff", cliente_id: "cli-dehesa", proyecto_id: "pry-dehesa", entrega_id: "ent-006", responsable_id: "55555555-5555-5555-5555-555555555555", solicitante_id: "22222222-2222-2222-2222-222222222222", estado: "completada", prioridad: "baja", fecha_inicio: dias(-11), fecha_fin_min: dias(-8), fecha_fin_max: dias(-7) },
  { id: "t-154", titulo: "Migración cuentas", cliente_id: "cli-nimbo", proyecto_id: "pry-nimbo", entrega_id: "ent-007", responsable_id: "66666666-6666-6666-6666-666666666666", solicitante_id: "22222222-2222-2222-2222-222222222222", estado: "completada", prioridad: "baja", fecha_inicio: dias(-12), fecha_fin_min: dias(-9), fecha_fin_max: dias(-8) },
  { id: "t-155", titulo: "Branding stories", cliente_id: "cli-atipico", proyecto_id: "pry-atipico", entrega_id: "ent-008", responsable_id: "88888888-8888-8888-8888-888888888888", solicitante_id: "22222222-2222-2222-2222-222222222222", estado: "completada", prioridad: "baja", fecha_inicio: dias(-14), fecha_fin_min: dias(-10), fecha_fin_max: dias(-9) },

];

// ─── Comentarios ──────────────────────────────────────────
export const COMENTARIOS_MOCK: Comentario[] = [
  { id: "c-1", tarea_id: "t-001", autor_id: ANDREA, texto: "Listo, pasado a Paula para revisión", fecha: horasAtras(2) },
  { id: "c-2", tarea_id: "t-001", autor_id: PAULA, texto: "Le doy una vuelta esta tarde", fecha: horasAtras(1) },
  { id: "c-3", tarea_id: "t-004", autor_id: SANDRA, texto: "Tengo dos rutas creativas, te paso enlaces", fecha: horasAtras(5) },
  { id: "c-4", tarea_id: "t-006", autor_id: PAULA, texto: "Esperando que Andrea termine maquetación", fecha: horasAtras(3) },
];

// ─── Horas históricas (estimadas/reales) ──────────────────
const HORAS_POR_TIPO: Record<string, number> = {
  diseno: 2.5,
  copy: 1.5,
  web: 4,
  campanas: 2,
  seo: 3,
  estrategia: 2.5,
  otro: 1.5,
};
const ruidoSeed = (id: string) => {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return 0.6 + (h % 100) / 125;
};
const horasReales = (tipo: string, id: string) =>
  Math.round((HORAS_POR_TIPO[tipo] ?? 2) * ruidoSeed(id) * 2) / 2;

const HISTORICAS: Tarea[] = (
  [
    ["h-001", "Diseño piezas RRSS", "cli-nanami", "ent-001", SANDRA, "diseno"],
    ["h-002", "Diseño piezas RRSS", "cli-nanami", "ent-009", SANDRA, "diseno"],
    ["h-003", "Diseño piezas RRSS", "cli-territorio", "ent-002", SANDRA, "diseno"],
    ["h-004", "Maquetar landing", "cli-territorio", "ent-002", SANDRA, "diseno"],
    ["h-005", "Maquetar landing", "cli-rentalmode", "ent-004", SANDRA, "diseno"],
    ["h-006", "Maquetar piezas RRSS", "cli-dehesa", "ent-006", ANDREA, "diseno"],
    ["h-007", "Maquetar piezas RRSS", "cli-nanami", "ent-009", ANDREA, "diseno"],
    ["h-008", "Maquetar piezas RRSS", "cli-atipico", "ent-008", ANDREA, "diseno"],
    ["h-009", "Plan editorial", "cli-dehesa", "ent-006", PAULA, "estrategia"],
    ["h-010", "Plan editorial", "cli-atipico", "ent-014", PAULA, "estrategia"],
    ["h-011", "Plan editorial", "cli-nimbo", "ent-007", NEREA, "estrategia"],
    ["h-012", "Buyer persona", "cli-territorio", "ent-002", PAULA, "estrategia"],
    ["h-013", "Brief campaña", "cli-fim", "ent-003", NEREA, "estrategia"],
    ["h-014", "Brief campaña", "cli-nimbo", "ent-007", NEREA, "estrategia"],
    ["h-015", "Texto SEO categoría", "cli-territorio", "ent-002", PABLO, "copy"],
    ["h-016", "Texto SEO categoría", "cli-nanami", "ent-009", PABLO, "copy"],
    ["h-017", "Redacción artículo blog", "cli-rentalmode", "ent-004", PABLO, "copy"],
    ["h-018", "Redacción artículo blog", "cli-atipico", "ent-008", PABLO, "copy"],
    ["h-019", "Auditoría SEO técnica", "cli-nanami", "ent-015", PABLO, "seo"],
    ["h-020", "Auditoría SEO técnica", "cli-activtrades", "ent-005", PABLO, "seo"],
    ["h-021", "Auditoría backlinks", "cli-nanami", "ent-009", PABLO, "seo"],
    ["h-022", "Setup analítica", "cli-fim", "ent-003", MARTIN, "web"],
    ["h-023", "Setup tag manager", "cli-activtrades", "ent-005", MARTIN, "web"],
    ["h-024", "Migración correos workspace", "cli-sa", "ent-012", MARTIN, "web"],
    ["h-025", "QA cross-browser", "cli-nanami", "ent-009", MARTIN, "web"],
    ["h-026", "Optimización pujas Google", "cli-rentalmode", "ent-013", RUBEN, "campanas"],
    ["h-027", "Setup campaña Meta", "cli-atipico", "ent-014", RUBEN, "campanas"],
    ["h-028", "Crear conjunto anuncios", "cli-nimbo", "ent-007", RUBEN, "campanas"],
    ["h-029", "Crear conjunto anuncios", "cli-nanami", "ent-009", RUBEN, "campanas"],
    ["h-030", "Reporte semanal Ads", "cli-rentalmode", "ent-004", RUBEN, "campanas"],
    ["h-031", "Briefing creativo banners", "cli-activtrades", "ent-010", PAULA, "estrategia"],
    ["h-032", "Reunión kickoff", "cli-fim", "ent-003", PAULA, "estrategia"],
    ["h-033", "Reunión kickoff", "cli-nimbo", "ent-007", EDU, "estrategia"],
  ] as const
).map(([id, titulo, cli, ent, resp, kind], i) => {
  const real = horasReales(kind, id);
  const estim = Math.round(((HORAS_POR_TIPO[kind] ?? 2) + (i % 3 === 0 ? 0.5 : 0)) * 2) / 2;
  return {
    id,
    titulo,
    cliente_id: cli,
    proyecto_id: PROYECTOS_MOCK.find((p) => p.cliente_id === cli)?.id ?? "pry-sa",
    entrega_id: ent,
    responsable_id: resp,
    solicitante_id: PAULA,
    estado: "completada",
    prioridad: "media",
    fecha_inicio: dias(-15 - (i % 10)),
    fecha_fin_min: dias(-10 - (i % 10)),
    fecha_fin_max: dias(-10 - (i % 10)),
    horas_estimadas: estim,
    horas_reales: real,
    cerrado_at: dias(-9 - (i % 10)),
  } satisfies Tarea;
});

TAREAS_MOCK.push(...HISTORICAS);

// Inyecta horas en cerradas previas + parte de las activas (heurística por título)
function adivinarKind(titulo: string): keyof typeof HORAS_POR_TIPO {
  const t = titulo.toLowerCase();
  if (t.includes("dise") || t.includes("maqueta") || t.includes("banner") || t.includes("plant")) return "diseno";
  if (t.includes("copy") || t.includes("texto") || t.includes("blog") || t.includes("artícul")) return "copy";
  if (t.includes("seo") || t.includes("auditor")) return "seo";
  if (t.includes("setup") || t.includes("ga4") || t.includes("workspace") || t.includes("tag") || t.includes("web") || t.includes("landing")) return "web";
  if (t.includes("ads") || t.includes("meta") || t.includes("google") || t.includes("anunci") || t.includes("campañ")) return "campanas";
  return "estrategia";
}
for (const t of TAREAS_MOCK) {
  if (t.id.startsWith("h-")) continue;
  const kind = adivinarKind(t.titulo);
  if (t.estado === "completada" && t.horas_reales == null) {
    t.horas_reales = horasReales(kind, t.id);
    t.horas_estimadas = Math.round((HORAS_POR_TIPO[kind] ?? 2) * 2) / 2;
  } else if (t.estado !== "completada" && t.horas_estimadas == null) {
    if (ruidoSeed(t.id) <= 0.85) {
      t.horas_estimadas = Math.round((HORAS_POR_TIPO[kind] ?? 2) * 2) / 2;
    }
  }
}

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
  { id: "n-1", texto: "Vence en 2h: Banners display", fecha: horasAtras(0.5), leida: false, ruta: "/tareas", icono: "alert", categoria: "urgente" },
  { id: "n-2", texto: "Vencida ayer: Texto SEO categoría", fecha: horasAtras(20), leida: false, ruta: "/tareas", icono: "alert", categoria: "urgente" },
  { id: "n-3", texto: "Vence hoy: Adaptar key visual", fecha: horasAtras(2), leida: false, ruta: "/tareas", icono: "alert", categoria: "urgente" },
  { id: "n-4", texto: "Rubén te asignó Banner promo Meta", fecha: horasAtras(2), leida: false, ruta: "/tareas", icono: "user-plus", categoria: "importante" },
  { id: "n-5", texto: "Sandra cerró Diseño piezas mayo", fecha: horasAtras(0.08), leida: false, ruta: "/tareas", icono: "check", categoria: "importante" },
  { id: "n-6", texto: "Tu tarea Aprobación calendario está activa", fecha: horasAtras(1), leida: false, ruta: "/tareas", icono: "play", categoria: "importante" },
  { id: "n-7", texto: "Andrea comentó en Revisar plan de medios Q2", fecha: horasAtras(3), leida: true, ruta: "/tareas", icono: "message", categoria: "info" },
  { id: "n-8", texto: "Pablo comentó en Auditoría SEO", fecha: horasAtras(6), leida: true, ruta: "/tareas", icono: "message", categoria: "info" },
  { id: "n-9", texto: "Martín cerró Setup tag manager", fecha: horasAtras(8), leida: true, ruta: "/tareas", icono: "check", categoria: "importante" },
  { id: "n-10", texto: "Edu te mencionó en Coordinar shooting", fecha: horasAtras(14), leida: true, ruta: "/tareas", icono: "message", categoria: "info" },
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

// ─── Clientes extra (B11) — añadidos al final tras definirse todos los mocks ───
const EXTRA_CLIENTES_DEF: Array<[string, string, string, string, "verde" | "amarillo" | "rojo"]> = [
  ["cli-vega", "Vega Wines", "Bebidas", PAULA, "verde"],
  ["cli-luma", "Luma Studio", "Diseño", NEREA, "amarillo"],
  ["cli-orbi", "Orbi Travel", "Turismo", EDU, "verde"],
  ["cli-norte", "Norte Energy", "Energía", DANI, "rojo"],
  ["cli-paloma", "Paloma & Co", "Moda", PAULA, "verde"],
  ["cli-kael", "Kael Health", "Salud", NEREA, "amarillo"],
  ["cli-ferro", "Ferro Logística", "Logística", EDU, "verde"],
  ["cli-mapuche", "Mapuche Café", "Hostelería", PAULA, "verde"],
  ["cli-nestor", "Nestor Legal", "Legal", DANI, "amarillo"],
  ["cli-tundra", "Tundra Outdoor", "Deporte", NEREA, "verde"],
  ["cli-altea", "Altea Inmuebles", "Inmobiliario", EDU, "rojo"],
  ["cli-bruma", "Bruma Cosmetics", "Cosmética", PAULA, "verde"],
  ["cli-nordic", "Nordic Furniture", "Hogar", NEREA, "amarillo"],
  ["cli-pelayo", "Pelayo Seguros", "Seguros", DANI, "verde"],
  ["cli-iris", "Iris Optics", "Óptica", EDU, "verde"],
  ["cli-amaro", "Amaro Restaurantes", "Hostelería", PAULA, "amarillo"],
  ["cli-bow", "Bow Music", "Música", NEREA, "verde"],
  ["cli-lima", "Lima Foods", "Alimentación", EDU, "verde"],
  ["cli-adra", "Adra Pharma", "Farma", DANI, "amarillo"],
  ["cli-vento", "Vento Sport", "Deporte", PAULA, "verde"],
  ["cli-juno", "Juno Beauty", "Cosmética", NEREA, "verde"],
];
for (const [id, nombre, sector, pm, salud] of EXTRA_CLIENTES_DEF) {
  CLIENTES_MOCK.push({
    id, nombre, sector, pm_id: pm,
    web: `${nombre.toLowerCase().replace(/[^a-z]/g, "")}.com`,
    slack: `#${id}`, salud, activo: true,
  });
  PROYECTOS_MOCK.push({
    id: id.replace("cli-", "pry-"),
    nombre, cliente_id: id, pm_id: pm,
    estado: "activo", fecha_inicio: dias(-60),
  });
}
const PLANTILLAS_ENTREGA = ["Calendario mayo 2026", "Branding inicial", "Web nueva", "Campaña verano"];
let _entContador = 100;
for (const [cliId, , , pm] of EXTRA_CLIENTES_DEF) {
  const seed = cliId.charCodeAt(4) % 3;
  const n = 1 + seed;
  for (let i = 0; i < n; i++) {
    _entContador += 1;
    const catList: Array<import("@/types/database").CategoriaEntrega> = [
      "redes_sociales", "web", "campana", "informe_mensual", "seo", "diseno",
    ];
    ENTREGAS_MOCK.push({
      id: `ent-${_entContador}`,
      nombre: PLANTILLAS_ENTREGA[(i + seed) % PLANTILLAS_ENTREGA.length],
      cliente_id: cliId,
      proyecto_id: cliId.replace("cli-", "pry-"),
      pm_id: pm,
      categoria: catList[(i + seed) % catList.length],
      estado: "en_curso",
      fecha_inicio: dias(-5 - (i % 5)),
      fecha_fin: dias(5 + ((i * 3) % 12)),
    });
  }
}
