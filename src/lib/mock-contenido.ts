import { CLIENTES_MOCK } from "./mock-tareas";
import type { UUID } from "@/types/database";

export type EstadoPost = "idea" | "redaccion" | "diseno" | "revision" | "programado" | "publicado";
export type CanalPost = "instagram" | "linkedin" | "tiktok" | "blog" | "newsletter" | "x";

export interface Post {
  id: string;
  titulo: string;
  cliente_id: UUID;
  canal: CanalPost;
  estado: EstadoPost;
  responsable_id: UUID;
  fecha: string; // ISO yyyy-MM-dd para programados/publicados
  alcance?: number;
  interacciones?: number;
  clics?: number;
}

const dias = (n: number) => {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

const ANDREA = "66666666-6666-6666-6666-666666666666";
const PABLO = "99999999-9999-9999-9999-999999999999";
const SANDRA = "55555555-5555-5555-5555-555555555555";
const NEREA = "33333333-3333-3333-3333-333333333333";
const PAULA = "22222222-2222-2222-2222-222222222222";

const titulos: Record<CanalPost, string[]> = {
  instagram: ["Carrusel producto", "Reel detrás de cámaras", "Story testimonio", "Post lifestyle", "Carrusel tips"],
  linkedin: ["Caso de estudio", "Anuncio de equipo", "Artículo opinión", "Publicación logro", "Encuesta sector"],
  tiktok: ["Reto viral", "Tutorial 30s", "POV cliente", "Trending audio"],
  blog: ["Guía completa SEO", "10 tips para…", "Caso éxito cliente", "Tendencias del mes"],
  newsletter: ["Edición mensual", "Highlights semana", "Nuevos lanzamientos"],
  x: ["Hilo opinión", "Tweet anuncio", "Encuesta rápida"],
};

const estados: EstadoPost[] = ["idea", "redaccion", "diseno", "revision", "programado", "publicado"];
const canales: CanalPost[] = ["instagram", "linkedin", "tiktok", "blog", "newsletter", "x"];
const responsables = [ANDREA, PABLO, SANDRA, NEREA, PAULA];
const clientes = CLIENTES_MOCK.map((c) => c.id);

function rand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export const POSTS_MOCK: Post[] = (() => {
  const r = rand(42);
  const out: Post[] = [];
  for (let i = 0; i < 60; i++) {
    const canal = canales[Math.floor(r() * canales.length)];
    const estado = estados[Math.floor(r() * estados.length)];
    const cliente_id = clientes[Math.floor(r() * clientes.length)];
    const responsable_id = responsables[Math.floor(r() * responsables.length)];
    const tArr = titulos[canal];
    const titulo = tArr[Math.floor(r() * tArr.length)];
    // fecha: publicados/programados con offset según estado
    const offset =
      estado === "publicado" ? -Math.floor(r() * 21) - 1 :
      estado === "programado" ? Math.floor(r() * 14) + 1 :
      Math.floor(r() * 14) - 2;
    const post: Post = {
      id: `post-${i + 1}`,
      titulo,
      cliente_id,
      canal,
      estado,
      responsable_id,
      fecha: dias(offset),
    };
    if (estado === "publicado") {
      post.alcance = Math.floor(r() * 18000) + 800;
      post.interacciones = Math.floor(r() * 1200) + 30;
      post.clics = Math.floor(r() * 400) + 10;
    }
    out.push(post);
  }
  return out;
})();

export const ESTADO_LABEL: Record<EstadoPost, string> = {
  idea: "Idea",
  redaccion: "Redacción",
  diseno: "Diseño",
  revision: "Revisión",
  programado: "Programado",
  publicado: "Publicado",
};

export const CANAL_LABEL: Record<CanalPost, string> = {
  instagram: "Instagram",
  linkedin: "LinkedIn",
  tiktok: "TikTok",
  blog: "Blog",
  newsletter: "Newsletter",
  x: "X",
};

export const CANAL_COLOR: Record<CanalPost, string> = {
  instagram: "#e1306c",
  linkedin: "#0a66c2",
  tiktok: "#000000",
  blog: "#16a34a",
  newsletter: "#f59e0b",
  x: "#1f2937",
};
