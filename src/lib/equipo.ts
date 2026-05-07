import type { Miembro, UUID } from "@/types/database";

export const USUARIO_ACTUAL_ID: UUID = "22222222-2222-2222-2222-222222222222";

export const EQUIPO: Miembro[] = [
  { id: "11111111-1111-1111-1111-111111111111", nombre: "Dani", iniciales: "DA", rol: "Director", grupos: ["director", "pm"], activo: true, email: "dani@socialadvisor.es" },
  { id: "22222222-2222-2222-2222-222222222222", nombre: "Paula", iniciales: "PA", rol: "PM · Directora", grupos: ["director", "pm"], activo: true, email: "paula@socialadvisor.es" },
  { id: "33333333-3333-3333-3333-333333333333", nombre: "Nerea Fonte", iniciales: "NF", rol: "PM", grupos: ["pm"], activo: true, email: "nerea@socialadvisor.es" },
  { id: "44444444-4444-4444-4444-444444444444", nombre: "Edu", iniciales: "ED", rol: "PM", grupos: ["pm"], activo: true, email: "edu@socialadvisor.es" },
  { id: "55555555-5555-5555-5555-555555555555", nombre: "Sandra PH", iniciales: "SP", rol: "Diseño", grupos: ["diseno"], activo: true, email: "sandra@socialadvisor.es" },
  { id: "66666666-6666-6666-6666-666666666666", nombre: "Andrea Lestón", iniciales: "AL", rol: "Diseño · Contenidos", grupos: ["diseno", "contenidos"], activo: true, email: "andrea@socialadvisor.es" },
  { id: "77777777-7777-7777-7777-777777777777", nombre: "Martín", iniciales: "MA", rol: "IT", grupos: ["it"], activo: true, email: "martin@socialadvisor.es" },
  { id: "88888888-8888-8888-8888-888888888888", nombre: "Rubén González", iniciales: "RG", rol: "Campañas", grupos: ["campanas"], activo: true, email: "ruben@socialadvisor.es" },
  { id: "99999999-9999-9999-9999-999999999999", nombre: "Pablo Vega", iniciales: "PV", rol: "SEO · Contenidos", grupos: ["seo", "contenidos"], activo: true, email: "pablo@socialadvisor.es" },
];

export const miembroPorId = (id: UUID): Miembro | undefined => EQUIPO.find((m) => m.id === id);
export const nombrePorId = (id: UUID): string => miembroPorId(id)?.nombre ?? "—";
export const usuarioActual = (): Miembro => miembroPorId(USUARIO_ACTUAL_ID)!;
export const tienePermiso = (rol: "director" | "pm"): boolean =>
  usuarioActual().grupos.includes(rol);
