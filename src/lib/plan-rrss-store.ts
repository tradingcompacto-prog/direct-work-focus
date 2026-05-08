import * as React from "react";
import type { PublicacionRRSS } from "@/types/database";

// Store en memoria (mock de sesión) para el Plan de Contenido RRSS por entrega.
const planes = new Map<string, PublicacionRRSS[]>();
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

const dias = (off: number) => {
  const d = new Date();
  d.setDate(d.getDate() + off);
  return d.toISOString().slice(0, 10);
};

// Seeds iniciales para que se vea contenido en demo.
planes.set("ent-006", [
  { id: "pub-006-1", fecha: dias(1), tipo: "post", formato: "copy_imagen", plataformas: ["ig", "fb"], briefing: "Lanzamiento colección otoño · vibe cálido" },
  { id: "pub-006-2", fecha: dias(3), tipo: "reel", formato: "solo_imagen", plataformas: ["ig", "tt"], briefing: "Behind the scenes rodaje" },
  { id: "pub-006-3", fecha: dias(5), tipo: "carrusel", formato: "slide", plataformas: ["ig"], briefing: "Top 5 prendas favoritas", slides: ["Intro", "Prenda 1", "Prenda 2", "Prenda 3", "CTA"] },
]);
planes.set("ent-009", [
  { id: "pub-009-1", fecha: dias(0), tipo: "story", formato: "solo_imagen", plataformas: ["ig"], briefing: "Recordatorio promo" },
  { id: "pub-009-2", fecha: dias(2), tipo: "post", formato: "copy_imagen", plataformas: ["ig", "li"], briefing: "Caso de éxito cliente" },
]);
planes.set("ent-011", [
  { id: "pub-011-1", fecha: dias(1), tipo: "post", formato: "solo_copy", plataformas: ["li"], briefing: "Reflexión semanal" },
  { id: "pub-011-2", fecha: dias(4), tipo: "reel", formato: "solo_imagen", plataformas: ["ig", "tt"], briefing: "Tip rápido sector" },
  { id: "pub-011-3", fecha: dias(7), tipo: "carrusel", formato: "slide", plataformas: ["ig"], briefing: "Resumen del mes", slides: ["Hook", "Dato 1", "Dato 2", "Dato 3", "CTA"] },
]);

export function getPlan(entregaId: string): PublicacionRRSS[] {
  return planes.get(entregaId) ?? [];
}

export function addPublicacion(entregaId: string, pub: Omit<PublicacionRRSS, "id">) {
  const list = planes.get(entregaId) ?? [];
  const id = `pub-${entregaId}-${Date.now()}`;
  planes.set(entregaId, [...list, { ...pub, id }]);
  emit();
}

export function updatePublicacion(entregaId: string, id: string, patch: Partial<PublicacionRRSS>) {
  const list = planes.get(entregaId);
  if (!list) return;
  planes.set(entregaId, list.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  emit();
}

export function removePublicacion(entregaId: string, id: string) {
  const list = planes.get(entregaId);
  if (!list) return;
  planes.set(entregaId, list.filter((p) => p.id !== id));
  emit();
}

export function duplicarPublicacion(entregaId: string, id: string) {
  const list = planes.get(entregaId);
  if (!list) return;
  const orig = list.find((p) => p.id === id);
  if (!orig) return;
  const nuevo: PublicacionRRSS = { ...orig, id: `pub-${entregaId}-${Date.now()}` };
  planes.set(entregaId, [...list, nuevo]);
  emit();
}

export function usePlanRRSS(entregaId: string): PublicacionRRSS[] {
  const [, setV] = React.useState(0);
  React.useEffect(() => {
    const l = () => setV((x) => x + 1);
    listeners.add(l);
    return () => { listeners.delete(l); };
  }, []);
  return getPlan(entregaId);
}