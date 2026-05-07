import { useQuery } from "@tanstack/react-query";
import {
  TAREAS_MOCK,
  ENTREGAS_MOCK,
  PROYECTOS_MOCK,
  CLIENTES_MOCK,
  COMENTARIOS_MOCK,
  ACTIVIDAD_MOCK,
  NOTIFICACIONES_MOCK,
} from "./mock-tareas";
import { EQUIPO, USUARIO_ACTUAL_ID } from "./equipo";

// Mocks expuestos como queries síncronas (con initialData) para que el
// primer render ya tenga los datos y no aparezca el estado vacío.
const sync = <T>(data: T) => Promise.resolve(data);

export const useTareas = () =>
  useQuery({ queryKey: ["tareas"], queryFn: () => sync(TAREAS_MOCK), initialData: TAREAS_MOCK });
export const useEntregas = () =>
  useQuery({ queryKey: ["entregas"], queryFn: () => sync(ENTREGAS_MOCK), initialData: ENTREGAS_MOCK });
export const useProyectos = () =>
  useQuery({ queryKey: ["proyectos"], queryFn: () => sync(PROYECTOS_MOCK), initialData: PROYECTOS_MOCK });
export const useClientes = () =>
  useQuery({ queryKey: ["clientes"], queryFn: () => sync(CLIENTES_MOCK), initialData: CLIENTES_MOCK });
export const useEquipo = () => {
  const data = EQUIPO.filter((m) => m.activo);
  return useQuery({ queryKey: ["equipo"], queryFn: () => sync(data), initialData: data });
};
export const useComentarios = (tareaId?: string) =>
  useQuery({
    queryKey: ["comentarios", tareaId],
    queryFn: () => sync(COMENTARIOS_MOCK.filter((c) => c.tarea_id === tareaId)),
    enabled: !!tareaId,
    initialData: tareaId ? COMENTARIOS_MOCK.filter((c) => c.tarea_id === tareaId) : undefined,
  });
export const useActividad = () =>
  useQuery({ queryKey: ["actividad"], queryFn: () => sync(ACTIVIDAD_MOCK), initialData: ACTIVIDAD_MOCK });
export const useNotificaciones = () =>
  useQuery({ queryKey: ["notificaciones"], queryFn: () => sync(NOTIFICACIONES_MOCK), initialData: NOTIFICACIONES_MOCK });

// Vistas derivadas para "Mis tareas"
export const useMisTareas = () => {
  const data = TAREAS_MOCK.filter(
    (t) => t.responsable_id === USUARIO_ACTUAL_ID && t.estado !== "completada",
  );
  return useQuery({
    queryKey: ["mis-tareas", USUARIO_ACTUAL_ID],
    queryFn: () => sync(data),
    initialData: data,
  });
};

export const useMisEntregas = () => {
  const data = ENTREGAS_MOCK.filter((e) => e.pm_id === USUARIO_ACTUAL_ID);
  return useQuery({
    queryKey: ["mis-entregas", USUARIO_ACTUAL_ID],
    queryFn: () => sync(data),
    initialData: data,
  });
};
