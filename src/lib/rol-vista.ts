import * as React from "react";
import { usuarioActual } from "@/lib/equipo";

export type RolVista = "director" | "pm" | "ejecutor";
const KEY = "sa.home.rolVista";

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

let cache: RolVista | null = null;

function leer(): RolVista {
  if (cache) return cache;
  if (typeof window === "undefined") return defaultRol();
  const v = localStorage.getItem(KEY);
  if (v === "director" || v === "pm" || v === "ejecutor") {
    cache = v;
    return v;
  }
  cache = defaultRol();
  return cache;
}

function defaultRol(): RolVista {
  const u = usuarioActual();
  if (u.grupos.includes("director")) return "director";
  if (u.grupos.includes("pm")) return "pm";
  return "ejecutor";
}

export function rolesDisponibles(): RolVista[] {
  const u = usuarioActual();
  const r: RolVista[] = [];
  if (u.grupos.includes("director")) r.push("director");
  if (u.grupos.includes("pm") || u.grupos.includes("director")) r.push("pm");
  r.push("ejecutor");
  return r;
}

export function setRolVista(r: RolVista) {
  cache = r;
  try { localStorage.setItem(KEY, r); } catch {}
  emit();
}

export function useRolVista(): [RolVista, (r: RolVista) => void] {
  const [, force] = React.useReducer((x: number) => x + 1, 0);
  React.useEffect(() => {
    listeners.add(force);
    return () => { listeners.delete(force); };
  }, []);
  return [leer(), setRolVista];
}

export const ROL_LABEL: Record<RolVista, string> = {
  director: "Director",
  pm: "PM",
  ejecutor: "Ejecutor",
};
