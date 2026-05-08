import type { EventoCalendario } from "@/types/database";

const dias = (n: number) => {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

const PAULA = "22222222-2222-2222-2222-222222222222";
const NEREA = "33333333-3333-3333-3333-333333333333";
const EDU = "44444444-4444-4444-4444-444444444444";
const DANI = "11111111-1111-1111-1111-111111111111";

export const FECHAS_IMPORTANTES_MOCK: EventoCalendario[] = [
  { id: "ef-1", tipo: "efemeride", titulo: "Black Friday", fecha_inicio: dias(15), fecha_fin: dias(15), creado_por: DANI, nota: "Pico campañas e-commerce" },
  { id: "ef-2", tipo: "efemeride", titulo: "Día de la Madre", fecha_inicio: dias(-10), fecha_fin: dias(-10), creado_por: DANI },
  { id: "ef-3", tipo: "efemeride", titulo: "San Valentín", fecha_inicio: dias(25), fecha_fin: dias(25), creado_por: DANI },
  { id: "ef-4", tipo: "efemeride", titulo: "Lanzamiento Nanami SS26", fecha_inicio: dias(8), fecha_fin: dias(8), creado_por: PAULA },
  { id: "vac-1", tipo: "vacaciones", titulo: "Vacaciones", fecha_inicio: dias(20), fecha_fin: dias(27), persona_id: PAULA, creado_por: PAULA },
  { id: "vac-2", tipo: "vacaciones", titulo: "Vacaciones", fecha_inicio: dias(3), fecha_fin: dias(5), persona_id: NEREA, creado_por: NEREA },
  { id: "vac-3", tipo: "vacaciones", titulo: "Vacaciones", fecha_inicio: dias(12), fecha_fin: dias(18), persona_id: EDU, creado_por: EDU },
];