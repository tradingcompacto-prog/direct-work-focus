import { differenceInCalendarDays, parseISO, isWithinInterval } from "date-fns";

export type UrgenciaTono = "rojo" | "amarillo" | "azul" | "neutro";

export const urgenciaTarea = (
  fecha_fin_min: string,
  fecha_fin_max: string,
  hoy: Date = new Date(),
): UrgenciaTono => {
  const min = parseISO(fecha_fin_min);
  const max = parseISO(fecha_fin_max);
  const h = new Date(hoy);
  h.setHours(12, 0, 0, 0);
  if (max < h && differenceInCalendarDays(h, max) > 0) return "rojo";
  if (isWithinInterval(h, { start: min, end: max })) return "amarillo";
  return "azul";
};

export const etiquetaFechaRelativa = (fecha_fin_max: string): string => {
  const d = parseISO(fecha_fin_max);
  const hoy = new Date();
  hoy.setHours(12, 0, 0, 0);
  const diff = differenceInCalendarDays(d, hoy);
  if (diff < 0) return `vencido hace ${Math.abs(diff)} d`;
  if (diff === 0) return "vence hoy";
  if (diff === 1) return "vence mañana";
  return `vence en ${diff} d`;
};

export const tiempoRelativo = (iso: string): string => {
  const d = parseISO(iso);
  const ms = Date.now() - d.getTime();
  const min = Math.round(ms / 60000);
  if (min < 1) return "ahora";
  if (min < 60) return `hace ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `hace ${h}h`;
  const days = Math.round(h / 24);
  return `hace ${days}d`;
};

export const saludoSegunHora = (d: Date = new Date()) => {
  const h = d.getHours();
  if (h < 6) return "Buenas noches";
  if (h < 13) return "Buenos días";
  if (h < 21) return "Buenas tardes";
  return "Buenas noches";
};
