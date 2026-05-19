import type { QueryClient } from "@tanstack/react-query";

// Registro global del QueryClient para que los stores de mutación
// (no-hook) puedan invalidar las queries de React Query.
// Se setea desde <AuthProvider /> con useQueryClient().
let _qc: QueryClient | null = null;

export function setQueryClient(qc: QueryClient) {
  _qc = qc;
}

export function getQueryClient(): QueryClient | null {
  return _qc;
}

/** Invalida varias keys (cada arg es un queryKey). */
export function invalidateKeys(...keys: ReadonlyArray<unknown>[]): void {
  if (!_qc) return;
  for (const key of keys) {
    _qc.invalidateQueries({ queryKey: key as unknown[] });
  }
}