import * as React from "react";
import { NOTIFICACIONES_MOCK } from "./mock-tareas";
import type { Notificacion } from "@/types/database";

// Sesión: copia mutable de los mocks. Permite marcar leídas y añadir nuevas.
let lista: Notificacion[] = NOTIFICACIONES_MOCK.map((n) => ({ ...n }));
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function getNotificaciones(): Notificacion[] {
  return lista;
}
export function marcarLeida(id: string) {
  lista = lista.map((n) => (n.id === id ? { ...n, leida: true } : n));
  emit();
}
export function marcarTodasLeidas() {
  lista = lista.map((n) => ({ ...n, leida: true }));
  emit();
}
export function agregarNotificacion(n: Omit<Notificacion, "id" | "fecha" | "leida"> & Partial<Pick<Notificacion, "leida" | "fecha">>) {
  lista = [
    {
      id: `n-${Date.now()}`,
      fecha: n.fecha ?? new Date().toISOString(),
      leida: n.leida ?? false,
      ...n,
    } as Notificacion,
    ...lista,
  ];
  emit();
}

export function useNotificacionesStore() {
  const [v, setV] = React.useState(0);
  React.useEffect(() => {
    const l = () => setV((x) => x + 1);
    listeners.add(l);
    return () => { listeners.delete(l); };
  }, []);
  return { notificaciones: lista, version: v };
}
