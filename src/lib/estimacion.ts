import type { Tarea, TipoTarea, UUID } from "@/types/database";

export type Estimacion = {
  horas: number;
  confianza: "alta" | "baja";
  muestras: number;
} | null;

const tokens = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 3);

function similitud(a: string, b: string) {
  const ta = new Set(tokens(a));
  const tb = new Set(tokens(b));
  if (!ta.size || !tb.size) return 0;
  let m = 0;
  for (const t of ta) if (tb.has(t)) m++;
  return m / Math.max(ta.size, tb.size);
}

/** Calcula estimación basada en histórico de tareas cerradas con horas_reales. */
export function estimar(
  parcial: { titulo?: string; tipo?: TipoTarea; cliente_id?: UUID; responsable_id?: UUID },
  historico: Tarea[],
): Estimacion {
  const cerradas = historico.filter((t) => t.estado === "completada" && typeof t.horas_reales === "number");
  if (!cerradas.length) return null;

  // Score: tipo (3) + cliente (2) + responsable (2) + similitud título (0..3)
  const candidatas = cerradas
    .map((t) => {
      let s = 0;
      if (parcial.tipo && t.tipo === parcial.tipo) s += 3;
      if (parcial.cliente_id && t.cliente_id === parcial.cliente_id) s += 2;
      if (parcial.responsable_id && t.responsable_id === parcial.responsable_id) s += 2;
      if (parcial.titulo) s += similitud(parcial.titulo, t.titulo) * 3;
      return { t, s };
    })
    .filter((x) => x.s >= 2)
    .sort((a, b) => b.s - a.s)
    .slice(0, 8);

  if (!candidatas.length) return null;
  const horas = candidatas.reduce((acc, x) => acc + (x.t.horas_reales as number), 0) / candidatas.length;
  const r = Math.round(horas * 2) / 2; // a medias horas
  return {
    horas: r,
    confianza: candidatas.length >= 3 ? "alta" : "baja",
    muestras: candidatas.length,
  };
}

/** Estimación para una tarea ya creada (usa sus campos). */
export function estimarTarea(t: Tarea, historico: Tarea[]): Estimacion {
  if (typeof t.horas_estimadas === "number") {
    return { horas: t.horas_estimadas, confianza: "alta", muestras: 0 };
  }
  return estimar(
    { titulo: t.titulo, tipo: t.tipo, cliente_id: t.cliente_id, responsable_id: t.responsable_id },
    historico.filter((x) => x.id !== t.id),
  );
}

/** Precisión global de las estimaciones de una persona (0..1). */
export function precisionPersona(persona_id: UUID, tareas: Tarea[]): number | null {
  const c = tareas.filter(
    (t) =>
      t.responsable_id === persona_id &&
      t.estado === "completada" &&
      typeof t.horas_reales === "number" &&
      typeof t.horas_estimadas === "number",
  );
  if (c.length < 5) return null;
  const errores = c.map((t) => {
    const e = t.horas_estimadas as number;
    const r = t.horas_reales as number;
    if (!e || !r) return 0;
    return 1 - Math.min(1, Math.abs(e - r) / Math.max(e, r));
  });
  return errores.reduce((a, b) => a + b, 0) / errores.length;
}

/** Promedios por tipo de una persona. */
export function promediosPorTipo(persona_id: UUID, tareas: Tarea[]): Record<string, number> {
  const c = tareas.filter(
    (t) =>
      t.responsable_id === persona_id &&
      t.estado === "completada" &&
      typeof t.horas_reales === "number",
  );
  const acc: Record<string, { sum: number; n: number }> = {};
  for (const t of c) {
    acc[t.tipo] ??= { sum: 0, n: 0 };
    acc[t.tipo].sum += t.horas_reales as number;
    acc[t.tipo].n += 1;
  }
  const out: Record<string, number> = {};
  for (const k of Object.keys(acc)) out[k] = Math.round((acc[k].sum / acc[k].n) * 10) / 10;
  return out;
}

export const tipoLabel: Record<TipoTarea, string> = {
  diseno: "Diseño",
  copy: "Copy",
  web: "Web",
  campanas: "Campañas",
  seo: "SEO",
  estrategia: "Estrategia",
  otro: "Otro",
};
