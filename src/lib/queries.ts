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

const fakeFetch = <T>(data: T, ms = 80): Promise<T> =>
  new Promise((r) => setTimeout(() => r(data), ms));

export const useTareas = () =>
  useQuery({ queryKey: ["tareas"], queryFn: () => fakeFetch(TAREAS_MOCK) });
export const useEntregas = () =>
  useQuery({ queryKey: ["entregas"], queryFn: () => fakeFetch(ENTREGAS_MOCK) });
export const useProyectos = () =>
  useQuery({ queryKey: ["proyectos"], queryFn: () => fakeFetch(PROYECTOS_MOCK) });
export const useClientes = () =>
  useQuery({ queryKey: ["clientes"], queryFn: () => fakeFetch(CLIENTES_MOCK) });
export const useEquipo = () =>
  useQuery({ queryKey: ["equipo"], queryFn: () => fakeFetch(EQUIPO.filter((m) => m.activo)) });
export const useComentarios = (tareaId?: string) =>
  useQuery({
    queryKey: ["comentarios", tareaId],
    queryFn: () => fakeFetch(COMENTARIOS_MOCK.filter((c) => c.tarea_id === tareaId)),
    enabled: !!tareaId,
  });
export const useActividad = () =>
  useQuery({ queryKey: ["actividad"], queryFn: () => fakeFetch(ACTIVIDAD_MOCK) });
export const useNotificaciones = () =>
  useQuery({ queryKey: ["notificaciones"], queryFn: () => fakeFetch(NOTIFICACIONES_MOCK) });

// Vistas derivadas para "Mis tareas"
export const useMisTareas = () =>
  useQuery({
    queryKey: ["mis-tareas", USUARIO_ACTUAL_ID],
    queryFn: () =>
      fakeFetch(
        TAREAS_MOCK.filter(
          (t) => t.responsable_id === USUARIO_ACTUAL_ID && t.estado !== "completada",
        ),
      ),
  });

export const useMisEntregas = () =>
  useQuery({
    queryKey: ["mis-entregas", USUARIO_ACTUAL_ID],
    queryFn: () => fakeFetch(ENTREGAS_MOCK.filter((e) => e.pm_id === USUARIO_ACTUAL_ID)),
  });
