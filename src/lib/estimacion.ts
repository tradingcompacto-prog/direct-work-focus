import type { CategoriaEntrega, Tarea, UUID } from "@/types/database";

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

export function estimar(
  parcial: {
    titulo?: string;
    categoria?: CategoriaEntrega;
    cliente_id?: UUID;
    responsable_id?: UUID;
  },
  historico: Tarea[],
  categoriaPorTarea?: Map<UUID, CategoriaEntrega>,
): Estimacion {
  const cerradas = historico.filter(
    (t) => t.estado === "completada" && typeof t.horas_reales === "number",
  );
  if (cerradas.length === 0) return null;

  const candidatas = cerradas
    .map((t) => {
      let s = 0;
      const catT = categoriaPorTarea?.get(t.id);
      if (parcial.categoria && catT && catT === parcial.categoria) s += 5;
      if (parcial.cliente_id && t.cliente_id === parcial.cliente_id) s += 2;
      if (parcial.responsable_id && t.responsable_id === parcial.responsable_id) s += 2;
      if (parcial.titulo) s += similitud(parcial.titulo, t.titulo) * 2;
      return { t, s };
    })
    .filter((x) => x.s >= 5)
    .sort((a, b) => b.s - a.s)
    .slice(0, 10);

  if (candidatas.length < 3) return null;

  const horas =
    candidatas.reduce((acc, x) => acc + (x.t.horas_reales as number), 0) /
    candidatas.length;
  return {
    horas: Math.round(horas * 2) / 2,
    confianza: candidatas.length >= 5 ? "alta" : "baja",
    muestras: candidatas.length,
  };
}

export function estimarTarea(
  t: Tarea,
  historico: Tarea[],
  categoriaPorTarea?: Map<UUID, CategoriaEntrega>,
): Estimacion {
  if (typeof t.horas_estimadas === "number") {
    return { horas: t.horas_estimadas, confianza: "alta", muestras: 0 };
  }
  return estimar(
    {
      titulo: t.titulo,
      categoria: categoriaPorTarea?.get(t.id),
      cliente_id: t.cliente_id,
      responsable_id: t.responsable_id,
    },
    historico.filter((x) => x.id !== t.id),
    categoriaPorTarea,
  );
}

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