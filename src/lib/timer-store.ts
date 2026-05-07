import * as React from "react";

type TimerState = {
  started_at: number | null; // ms timestamp when current run began (null if paused/stopped)
  acumulado_ms: number; // accumulated time across pauses
};

const timers = new Map<string, TimerState>();
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function empezar(tareaId: string) {
  const cur = timers.get(tareaId) ?? { started_at: null, acumulado_ms: 0 };
  if (cur.started_at != null) return; // already running
  timers.set(tareaId, { ...cur, started_at: Date.now() });
  emit();
}

export function pausar(tareaId: string) {
  const cur = timers.get(tareaId);
  if (!cur || cur.started_at == null) return;
  const delta = Date.now() - cur.started_at;
  timers.set(tareaId, { started_at: null, acumulado_ms: cur.acumulado_ms + delta });
  emit();
}

export function detener(tareaId: string): number {
  const cur = timers.get(tareaId);
  if (!cur) return 0;
  const delta = cur.started_at != null ? Date.now() - cur.started_at : 0;
  const totalMs = cur.acumulado_ms + delta;
  timers.delete(tareaId);
  emit();
  return totalMs / 3600000; // horas
}

export function getEstadoTimer(tareaId: string) {
  const t = timers.get(tareaId);
  if (!t) return { corriendo: false, ms: 0 };
  const delta = t.started_at != null ? Date.now() - t.started_at : 0;
  return { corriendo: t.started_at != null, ms: t.acumulado_ms + delta };
}

export function useTimer(tareaId: string | null) {
  const [, force] = React.useReducer((x: number) => x + 1, 0);
  React.useEffect(() => {
    listeners.add(force);
    return () => {
      listeners.delete(force);
    };
  }, []);
  React.useEffect(() => {
    if (!tareaId) return;
    const t = timers.get(tareaId);
    if (!t || t.started_at == null) return;
    const id = setInterval(force, 1000);
    return () => clearInterval(id);
  }, [tareaId, timers.get(tareaId ?? "")?.started_at]);
  return tareaId ? getEstadoTimer(tareaId) : { corriendo: false, ms: 0 };
}

export function formatearMs(ms: number): string {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, "0")}m`;
  if (m > 0) return `${m}m ${String(sec).padStart(2, "0")}s`;
  return `${sec}s`;
}