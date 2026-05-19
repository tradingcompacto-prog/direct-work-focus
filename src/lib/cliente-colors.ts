import type { CSSProperties } from "react";

// Paleta de 12 colores pastel (oklch para coherencia con el design system).
// Cada cliente recibe uno de forma estable según un hash de su id.
const PALETA = [
  { bg: "oklch(0.93 0.06 25)", border: "oklch(0.65 0.16 25)", text: "oklch(0.4 0.13 25)" },   // rojo coral
  { bg: "oklch(0.94 0.07 50)", border: "oklch(0.7 0.15 50)", text: "oklch(0.42 0.12 50)" },   // naranja
  { bg: "oklch(0.95 0.08 90)", border: "oklch(0.75 0.13 90)", text: "oklch(0.42 0.1 90)" },   // amarillo
  { bg: "oklch(0.94 0.07 145)", border: "oklch(0.65 0.15 145)", text: "oklch(0.38 0.12 145)" }, // verde
  { bg: "oklch(0.93 0.06 175)", border: "oklch(0.65 0.13 175)", text: "oklch(0.38 0.1 175)" },  // teal
  { bg: "oklch(0.93 0.06 220)", border: "oklch(0.65 0.15 220)", text: "oklch(0.4 0.14 220)" },  // azul
  { bg: "oklch(0.93 0.07 265)", border: "oklch(0.65 0.16 265)", text: "oklch(0.42 0.15 265)" }, // índigo
  { bg: "oklch(0.94 0.06 305)", border: "oklch(0.65 0.16 305)", text: "oklch(0.42 0.14 305)" }, // magenta
  { bg: "oklch(0.94 0.06 345)", border: "oklch(0.7 0.14 345)", text: "oklch(0.42 0.13 345)" },  // rosa
  { bg: "oklch(0.92 0.05 65)", border: "oklch(0.6 0.1 65)", text: "oklch(0.38 0.08 65)" },     // marrón cálido
  { bg: "oklch(0.93 0.05 195)", border: "oklch(0.6 0.11 195)", text: "oklch(0.38 0.09 195)" }, // cian
  { bg: "oklch(0.93 0.05 130)", border: "oklch(0.6 0.12 130)", text: "oklch(0.38 0.1 130)" },  // verde lima
];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function colorCliente(clienteId: string) {
  if (!clienteId) return PALETA[0];
  return PALETA[hash(clienteId) % PALETA.length];
}

/** Estilo en línea para borde izquierdo coloreado de la tarjeta */
export function bordeIzqCliente(clienteId: string): CSSProperties {
  return { borderLeftColor: colorCliente(clienteId).border, borderLeftWidth: 4 };
}

/** Punto de color para anteponer a un nombre de cliente */
export function puntoCliente(clienteId: string): CSSProperties {
  return { backgroundColor: colorCliente(clienteId).border };
}