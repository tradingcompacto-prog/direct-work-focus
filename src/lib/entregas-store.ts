import * as React from "react";
import { ENTREGAS_MOCK } from "./mock-tareas";
import type { Entrega } from "@/types/database";

// Store ligero en memoria para mover entregas entre columnas del Kanban.
// No persiste tras refresh: es un mock de sesión.
type Override = { estado: "en_curso" | "cerrada"; fecha_cierre?: string | null };
const overrides = new Map<string, Override>();
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function aplicarOverrides(entregas: Entrega[]): Entrega[] {
  if (overrides.size === 0) return entregas;
  return entregas.map((e) => {
    const o = overrides.get(e.id);
    return o ? { ...e, ...o } : e;
  });
}

export function moverEntrega(id: string, destino: "en_curso" | "hoy" | "semana" | "mes" | "reabrir") {
  const base = ENTREGAS_MOCK.find((e) => e.id === id);
  if (!base) return;
  if (destino === "en_curso" || destino === "reabrir") {
    overrides.set(id, { estado: "en_curso", fecha_cierre: null });
  } else {
    const today = new Date();
    let d = new Date(today);
    if (destino === "semana") d.setDate(today.getDate() - 2);
    if (destino === "mes") d.setDate(today.getDate() - 10);
    overrides.set(id, { estado: "cerrada", fecha_cierre: d.toISOString().slice(0, 10) });
  }
  emit();
}

export function useEntregasOverridesVersion() {
  const [v, setV] = React.useState(0);
  React.useEffect(() => {
    const l = () => setV((x) => x + 1);
    listeners.add(l);
    return () => { listeners.delete(l); };
  }, []);
  return v;
}
