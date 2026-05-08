import type { CategoriaEntrega } from "@/types/database";

export const CATEGORIAS_ENTREGA: { value: CategoriaEntrega; label: string }[] = [
  { value: "redes_sociales", label: "Redes Sociales" },
  { value: "web", label: "Web" },
  { value: "campana", label: "Campaña" },
  { value: "informe_mensual", label: "Informe mensual" },
  { value: "seo", label: "SEO" },
  { value: "diseno", label: "Diseño" },
  { value: "anuncios", label: "Anuncios" },
  { value: "fotografia", label: "Fotografía" },
  { value: "product_brief", label: "Product Brief" },
  { value: "plan_marketing", label: "Plan de marketing" },
  { value: "campanas_activas", label: "Campañas Activas" },
];

export const labelCategoria = (c: CategoriaEntrega): string =>
  CATEGORIAS_ENTREGA.find((x) => x.value === c)?.label ?? c;

// Colores sutiles por categoría: clases tailwind para badge/border.
export const colorCategoria: Record<
  CategoriaEntrega,
  { badge: string; border: string; dot: string }
> = {
  redes_sociales: { badge: "bg-pink-100 text-pink-700 border-pink-200", border: "border-l-pink-400", dot: "bg-pink-400" },
  web: { badge: "bg-blue-100 text-blue-700 border-blue-200", border: "border-l-blue-400", dot: "bg-blue-400" },
  campana: { badge: "bg-amber-100 text-amber-700 border-amber-200", border: "border-l-amber-400", dot: "bg-amber-400" },
  informe_mensual: { badge: "bg-slate-100 text-slate-700 border-slate-200", border: "border-l-slate-400", dot: "bg-slate-400" },
  seo: { badge: "bg-violet-100 text-violet-700 border-violet-200", border: "border-l-violet-400", dot: "bg-violet-400" },
  diseno: { badge: "bg-rose-100 text-rose-700 border-rose-200", border: "border-l-rose-400", dot: "bg-rose-400" },
  anuncios: { badge: "bg-orange-100 text-orange-700 border-orange-200", border: "border-l-orange-400", dot: "bg-orange-400" },
  fotografia: { badge: "bg-teal-100 text-teal-700 border-teal-200", border: "border-l-teal-400", dot: "bg-teal-400" },
  product_brief: { badge: "bg-cyan-100 text-cyan-700 border-cyan-200", border: "border-l-cyan-400", dot: "bg-cyan-400" },
  plan_marketing: { badge: "bg-indigo-100 text-indigo-700 border-indigo-200", border: "border-l-indigo-400", dot: "bg-indigo-400" },
  campanas_activas: { badge: "bg-emerald-100 text-emerald-700 border-emerald-200", border: "border-l-emerald-400", dot: "bg-emerald-400" },
};