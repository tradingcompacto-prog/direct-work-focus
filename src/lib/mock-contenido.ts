import { CLIENTES_MOCK } from "./mock-tareas";

export type Plataforma = "ig" | "fb" | "tt" | "li";
export type TipoPub = "post" | "story" | "reel" | "carrusel";
export type EstadoPub =
  | "idea"
  | "diseno"
  | "copy"
  | "revision"
  | "listo"
  | "programado"
  | "publicado";

export interface Publicacion {
  id: string;
  cliente_id: string;
  fecha: string; // YYYY-MM-DD
  hora: string; // HH:mm
  tipo: TipoPub;
  plataformas: Plataforma[];
  estado: EstadoPub;
  titulo: string;
  copy: string;
  responsable_diseno: string;
  responsable_copy: string;
  metricas?: { impresiones: number; alcance: number; interacciones: number; ctr: number };
}

const tipos: TipoPub[] = ["post", "story", "reel", "carrusel"];
const estados: EstadoPub[] = [
  "idea", "diseno", "copy", "revision", "listo", "programado", "publicado",
];
const plats: Plataforma[][] = [["ig"], ["ig", "fb"], ["ig", "tt"], ["li"], ["ig", "fb", "li"], ["tt"]];
const horas = ["09:00", "11:30", "13:00", "16:00", "18:30", "20:00"];
const SANDRA = "55555555-5555-5555-5555-555555555555";
const ANDREA = "66666666-6666-6666-6666-666666666666";
const PABLO = "99999999-9999-9999-9999-999999999999";
const NEREA = "33333333-3333-3333-3333-333333333333";
const disenadores = [SANDRA, ANDREA];
const copies = [PABLO, NEREA];

function pad(n: number) { return n < 10 ? `0${n}` : `${n}`; }

export const PUBLICACIONES_MOCK: Publicacion[] = (() => {
  const out: Publicacion[] = [];
  const hoy = new Date();
  const año = hoy.getFullYear();
  const mes = hoy.getMonth();
  const diasMes = new Date(año, mes + 1, 0).getDate();
  let i = 0;
  for (const c of CLIENTES_MOCK.slice(0, 18)) {
    const n = 2 + (i % 3);
    for (let k = 0; k < n; k++) {
      const dia = 1 + ((i * 3 + k * 5) % (diasMes - 1));
      const fecha = `${año}-${pad(mes + 1)}-${pad(dia)}`;
      const tipo = tipos[(i + k) % tipos.length];
      const estado = estados[(i + k * 2) % estados.length];
      const platf = plats[(i + k) % plats.length];
      const publicado = estado === "publicado";
      out.push({
        id: `pub-${i}-${k}`,
        cliente_id: c.id,
        fecha,
        hora: horas[(i + k) % horas.length],
        tipo,
        plataformas: platf,
        estado,
        titulo: `${c.nombre} · ${tipo} ${k + 1}`,
        copy: `Copy de ejemplo para ${c.nombre}. #${tipo}`,
        responsable_diseno: disenadores[(i + k) % 2],
        responsable_copy: copies[(i + k) % 2],
        metricas: publicado
          ? {
              impresiones: 1000 + ((i * 173 + k * 91) % 12000),
              alcance: 500 + ((i * 91 + k * 73) % 8000),
              interacciones: 20 + ((i * 13 + k * 7) % 600),
              ctr: Math.round(((i + k + 1) % 10) * 0.4 * 10) / 10,
            }
          : undefined,
      });
      i++;
    }
  }
  return out;
})();

export const PLATAFORMA_LABEL: Record<Plataforma, string> = {
  ig: "Instagram", fb: "Facebook", tt: "TikTok", li: "LinkedIn",
};
export const ESTADO_LABEL: Record<EstadoPub, string> = {
  idea: "Idea", diseno: "Diseño", copy: "Copy", revision: "Revisión",
  listo: "Listo programar", programado: "Programado", publicado: "Publicado",
};
export const ESTADO_COLOR: Record<EstadoPub, string> = {
  idea: "bg-zinc-100 text-zinc-700",
  diseno: "bg-purple-100 text-purple-800",
  copy: "bg-amber-100 text-amber-800",
  revision: "bg-orange-100 text-orange-800",
  listo: "bg-blue-100 text-blue-800",
  programado: "bg-cyan-100 text-cyan-800",
  publicado: "bg-green-100 text-green-800",
};