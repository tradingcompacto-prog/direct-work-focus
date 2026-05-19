import * as React from "react";
import {
  useTareas,
  useEntregas,
  useProyectos,
  useClientes,
  useActividad,
} from "@/lib/queries";
import {
  _setTareas,
  _setEntregas,
  _setProyectos,
  _setClientes,
  _setActividad,
} from "@/lib/mock-tareas";
import { notifyTareasChanged } from "@/lib/tareas-store";

// Subscribe a global "data version" so any consumer that opts in re-renders
// when the underlying datasets change.
const listeners = new Set<() => void>();
let version = 0;
function bump() {
  version++;
  listeners.forEach((l) => l());
}

export function useDataVersion() {
  const [, force] = React.useReducer((x: number) => x + 1, 0);
  React.useEffect(() => {
    listeners.add(force);
    return () => {
      listeners.delete(force);
    };
  }, []);
  return version;
}

/**
 * Hidrata los arrays globales (TAREAS_MOCK, ENTREGAS_MOCK, ...) desde React
 * Query. Montado dentro de AuthGate, debajo del AuthProvider y por encima
 * del <Outlet />. Cada vez que cambian los datos, hace splice en sitio y
 * emite el "data version" para forzar re-render en consumidores subscritos.
 */
export function DataSync() {
  const { data: tareas } = useTareas();
  const { data: entregas } = useEntregas();
  const { data: proyectos } = useProyectos();
  const { data: clientes } = useClientes();
  const { data: actividad } = useActividad();

  React.useEffect(() => {
    if (tareas) {
      _setTareas(tareas);
      notifyTareasChanged();
      bump();
    }
  }, [tareas]);
  React.useEffect(() => {
    if (entregas) {
      _setEntregas(entregas);
      bump();
    }
  }, [entregas]);
  React.useEffect(() => {
    if (proyectos) {
      _setProyectos(proyectos);
      bump();
    }
  }, [proyectos]);
  React.useEffect(() => {
    if (clientes) {
      _setClientes(clientes);
      bump();
    }
  }, [clientes]);
  React.useEffect(() => {
    if (actividad) {
      _setActividad(actividad);
      bump();
    }
  }, [actividad]);

  return null;
}
