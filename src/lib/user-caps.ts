import { useMemo } from "react";
import { useAuth } from "@/lib/auth";
import { useClientes, useMisTareas } from "@/lib/queries";

export interface UserCaps {
  isDirector: boolean;
  isPM: boolean;
  /** IDs de clientes en los que el usuario es PM (principal o secundario). */
  clientesPM: string[];
  /** Hay tareas con devuelta_at != null y estado != completada para mí. */
  hasDevoluciones: boolean;
  devolucionesCount: number;
}

/**
 * Capacidades reales del usuario. NO usa etiquetas estáticas: el rol "PM"
 * se calcula a partir de la tabla `clientes` (pm_principal_id / pm_secundario_id).
 * Si mañana se le asigna un cliente como PM, esta hook lo refleja sin tocar nada.
 */
export const useUserCaps = (): UserCaps => {
  const { user, esDirector } = useAuth();
  const { data: clientes = [] } = useClientes();
  const { data: misTareas = [] } = useMisTareas();

  return useMemo(() => {
    const uid = user?.id;
    const clientesPM = clientes
      .filter(
        (c) =>
          (c.pm_principal_id && c.pm_principal_id === uid) ||
          (c.pm_secundario_id && c.pm_secundario_id === uid),
      )
      .map((c) => c.id);
    const devueltas = misTareas.filter(
      (t) => t.devuelta_at != null && t.estado !== "completada",
    );
    return {
      isDirector: !!esDirector,
      isPM: clientesPM.length > 0,
      clientesPM,
      hasDevoluciones: devueltas.length > 0,
      devolucionesCount: devueltas.length,
    };
  }, [esDirector, clientes, misTareas, user?.id]);
};