import * as React from "react";
import { useUserCaps } from "@/lib/user-caps";
import { useAuth } from "@/lib/auth";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Globe, User, Hand } from "lucide-react";

export type AlcanceValue = "todo" | "mis-proyectos" | "solo-mias";

interface Props {
  value: AlcanceValue;
  onChange: (v: AlcanceValue) => void;
  /** Oculta opción "todo" aunque seas director (para vistas tipo /mis-revisiones). */
  hideTodo?: boolean;
}

export function AlcanceFilter({ value, onChange, hideTodo }: Props) {
  const caps = useUserCaps();
  if (!caps.isDirector && !caps.isPM) return null;
  return (
    <ToggleGroup
      type="single"
      size="sm"
      value={value}
      onValueChange={(v) => v && onChange(v as AlcanceValue)}
      className="border border-border rounded-md"
    >
      {caps.isDirector && !hideTodo && (
        <ToggleGroupItem value="todo" aria-label="Todo el equipo" className="text-xs gap-1">
          <Globe className="h-3.5 w-3.5" /> Todo
        </ToggleGroupItem>
      )}
      {caps.isPM && (
        <ToggleGroupItem value="mis-proyectos" aria-label="Mis proyectos" className="text-xs gap-1">
          <User className="h-3.5 w-3.5" /> Mis proyectos
        </ToggleGroupItem>
      )}
      <ToggleGroupItem value="solo-mias" aria-label="Solo mías" className="text-xs gap-1">
        <Hand className="h-3.5 w-3.5" /> Solo mías
      </ToggleGroupItem>
    </ToggleGroup>
  );
}

export function defaultAlcance(caps: {
  isDirector: boolean;
  isPM: boolean;
}): AlcanceValue {
  if (caps.isDirector) return "todo";
  if (caps.isPM) return "mis-proyectos";
  return "solo-mias";
}

interface FiltrableTarea {
  responsable_id?: string;
  solicitante_id?: string;
  cliente_id?: string;
}

export function filtrarPorAlcance<T extends FiltrableTarea>(
  tareas: T[],
  alcance: AlcanceValue,
  userId: string | undefined,
  clientesPM: string[],
): T[] {
  if (alcance === "todo") return tareas;
  if (alcance === "solo-mias") {
    return tareas.filter(
      (t) => t.responsable_id === userId || t.solicitante_id === userId,
    );
  }
  // mis-proyectos
  const set = new Set(clientesPM);
  return tareas.filter((t) => t.cliente_id && set.has(t.cliente_id));
}

/** Persistencia ligera en localStorage para el valor del filtro. */
export function useAlcancePersistido(
  ruta: string,
  fallback: AlcanceValue,
): [AlcanceValue, (v: AlcanceValue) => void] {
  const { user } = useAuth();
  const key = `alcance:${ruta}:${user?.id ?? "anon"}`;
  const [value, setValueState] = React.useState<AlcanceValue>(() => {
    if (typeof window === "undefined") return fallback;
    const stored = window.localStorage.getItem(key);
    return (stored as AlcanceValue | null) ?? fallback;
  });
  // Re-leer cuando cambia el usuario o la ruta (key cambia).
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(key);
    if (stored) setValueState(stored as AlcanceValue);
    else setValueState(fallback);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  const setValue = React.useCallback(
    (v: AlcanceValue) => {
      setValueState(v);
      try {
        window.localStorage.setItem(key, v);
      } catch {
        /* ignore */
      }
    },
    [key],
  );
  return [value, setValue];
}

/** Toggle "Incluir revisiones pendientes (como PM)" persistido. */
export function useIncluirRevisionesPersistido(
  ruta: string,
): [boolean, (v: boolean) => void] {
  const { user } = useAuth();
  const key = `incluir-revisiones:${ruta}:${user?.id ?? "anon"}`;
  const [value, setValueState] = React.useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(key) === "1";
  });
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    setValueState(window.localStorage.getItem(key) === "1");
  }, [key]);
  const setValue = React.useCallback(
    (v: boolean) => {
      setValueState(v);
      try {
        window.localStorage.setItem(key, v ? "1" : "0");
      } catch {
        /* ignore */
      }
    },
    [key],
  );
  return [value, setValue];
}