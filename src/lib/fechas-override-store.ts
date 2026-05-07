import * as React from "react";

export type Override = { inicio?: string; fin_min?: string; fin_max?: string };
const tareas = new Map<string, Override>();
const entregas = new Map<string, Override>();
const responsables = new Map<string, string>();
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function setTareaFechas(id: string, o: Override) {
  const cur = tareas.get(id) ?? {};
  tareas.set(id, { ...cur, ...o });
  emit();
}
export function getTareaOverride(id: string) {
  return tareas.get(id);
}
export function setEntregaFechas(id: string, o: Override) {
  const cur = entregas.get(id) ?? {};
  entregas.set(id, { ...cur, ...o });
  emit();
}
export function getEntregaOverride(id: string) {
  return entregas.get(id);
}
export function setResponsable(tareaId: string, personaId: string) {
  responsables.set(tareaId, personaId);
  emit();
}
export function getResponsable(tareaId: string) {
  return responsables.get(tareaId);
}

export function useOverrides() {
  const [, force] = React.useReducer((x: number) => x + 1, 0);
  React.useEffect(() => {
    listeners.add(force);
    return () => {
      listeners.delete(force);
    };
  }, []);
}
