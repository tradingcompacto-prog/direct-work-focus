import * as React from "react";

const KEY_SIDEBAR = "sa.sidebar.collapsed";
const KEY_LAST = "sa.lastView";
const KEY_DENSIDAD = "sa.densidad";

export type Densidad = "compacto" | "normal" | "comodo";
const listenersDensidad = new Set<() => void>();
let cacheDensidad: Densidad | null = null;

function leerDensidad(): Densidad {
  if (cacheDensidad) return cacheDensidad;
  if (typeof window === "undefined") return "normal";
  const v = localStorage.getItem(KEY_DENSIDAD);
  cacheDensidad = v === "compacto" || v === "comodo" ? v : "normal";
  return cacheDensidad;
}

export function setDensidad(d: Densidad) {
  cacheDensidad = d;
  try { localStorage.setItem(KEY_DENSIDAD, d); } catch {}
  if (typeof document !== "undefined") {
    document.documentElement.dataset.densidad = d;
  }
  listenersDensidad.forEach((l) => l());
}

export function useDensidad(): [Densidad, (d: Densidad) => void] {
  const [, force] = React.useReducer((x: number) => x + 1, 0);
  React.useEffect(() => {
    listenersDensidad.add(force);
    // Aplicar al cargar
    const d = leerDensidad();
    if (typeof document !== "undefined") document.documentElement.dataset.densidad = d;
    return () => { listenersDensidad.delete(force); };
  }, []);
  return [leerDensidad(), setDensidad];
}

export const usePrefSidebarCollapsed = () => {
  const [v, setV] = React.useState(false);
  React.useEffect(() => {
    const saved = localStorage.getItem(KEY_SIDEBAR);
    if (saved != null) setV(saved === "1");
  }, []);
  const set = React.useCallback((next: boolean) => {
    setV(next);
    localStorage.setItem(KEY_SIDEBAR, next ? "1" : "0");
  }, []);
  return [v, set] as const;
};

export const guardarUltimaVista = (path: string) => {
  try {
    localStorage.setItem(KEY_LAST, path);
  } catch {}
};
export const leerUltimaVista = (): string | null => {
  try {
    return localStorage.getItem(KEY_LAST);
  } catch {
    return null;
  }
};
