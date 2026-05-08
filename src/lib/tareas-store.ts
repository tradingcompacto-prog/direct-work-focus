import * as React from "react";
import { TAREAS_MOCK } from "./mock-tareas";
import type { Tarea } from "@/types/database";

// Store reactivo para mutaciones en memoria de TAREAS_MOCK.
// Las vistas que muestran tareas pueden suscribirse con useTareasVersion()
// para re-renderizar cuando cambia el estado / horas de una tarea.

const listeners = new Set<() => void>();
let version = 0;
const emit = () => {
  version++;
  listeners.forEach((l) => l());
};

export function setEstadoTarea(id: string, estado: Tarea["estado"]) {
  const t = TAREAS_MOCK.find((x) => x.id === id);
  if (!t) return;
  if (t.estado === estado) return;
  t.estado = estado;
  emit();
}

export function setHorasReales(id: string, horas: number | null) {
  const t = TAREAS_MOCK.find((x) => x.id === id);
  if (!t) return;
  t.horas_reales = horas ?? undefined;
  emit();
}

export function notifyTareasChanged() {
  emit();
}

export function useTareasVersion() {
  const [, force] = React.useReducer((x: number) => x + 1, 0);
  React.useEffect(() => {
    listeners.add(force);
    return () => {
      listeners.delete(force);
    };
  }, []);
  return version;
}