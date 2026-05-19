import type {
  Cliente,
  Proyecto,
  Entrega,
  Tarea,
  Comentario,
  Actividad,
  Notificacion,
  UUID,
} from "@/types/database";

// Estos arrays empiezan vacíos y se hidratan en tiempo de ejecución desde
// React Query (ver <DataSync /> en AppLayout). Las funciones de lookup
// leen siempre del contenido vigente, así que basta con mutar en sitio
// para que todos los consumidores vean los datos reales tras cada cambio.
// Mantienen las firmas de exportación originales para no tocar a los
// múltiples componentes que las importan.

export const CLIENTES_MOCK: Cliente[] = [];
export const PROYECTOS_MOCK: Proyecto[] = [];
export const ENTREGAS_MOCK: Entrega[] = [];
export const TAREAS_MOCK: Tarea[] = [];
export const COMENTARIOS_MOCK: Comentario[] = [];
export const ACTIVIDAD_MOCK: Actividad[] = [];
export const NOTIFICACIONES_MOCK: Notificacion[] = [];

function replace<T>(target: T[], next: ReadonlyArray<T>) {
  target.length = 0;
  for (const x of next) target.push(x);
}

export const _setClientes = (xs: ReadonlyArray<Cliente>) => replace(CLIENTES_MOCK, xs);
export const _setProyectos = (xs: ReadonlyArray<Proyecto>) => replace(PROYECTOS_MOCK, xs);
export const _setEntregas = (xs: ReadonlyArray<Entrega>) => replace(ENTREGAS_MOCK, xs);
export const _setTareas = (xs: ReadonlyArray<Tarea>) => replace(TAREAS_MOCK, xs);
export const _setActividad = (xs: ReadonlyArray<Actividad>) => replace(ACTIVIDAD_MOCK, xs);

export const clientePorId = (id: UUID) => CLIENTES_MOCK.find((c) => c.id === id);
export const proyectoPorId = (id: UUID) => PROYECTOS_MOCK.find((p) => p.id === id);
export const entregaPorId = (id: UUID) => ENTREGAS_MOCK.find((e) => e.id === id);
export const tareaPorId = (id: UUID) => TAREAS_MOCK.find((t) => t.id === id);

export const nombreCliente = (id: UUID) => clientePorId(id)?.nombre ?? "—";
export const nombreProyecto = (id: UUID) => proyectoPorId(id)?.nombre ?? "—";
export const nombreEntrega = (id: UUID) => entregaPorId(id)?.nombre ?? "—";
export const tituloTarea = (id: UUID) => tareaPorId(id)?.titulo ?? "—";
