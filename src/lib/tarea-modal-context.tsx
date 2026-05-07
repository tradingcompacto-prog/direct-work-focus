import * as React from "react";
import type { Tarea } from "@/types/database";

interface TareaModalState {
  tareaId: string | null;
  expandido: boolean;
  abrir: (id: string) => void;
  cerrar: () => void;
  toggleExpandido: () => void;
}
const Ctx = React.createContext<TareaModalState | null>(null);

export const TareaModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [tareaId, setTareaId] = React.useState<string | null>(null);
  const [expandido, setExpandido] = React.useState(false);
  const value = React.useMemo<TareaModalState>(
    () => ({
      tareaId,
      expandido,
      abrir: (id) => {
        setTareaId(id);
        setExpandido(false);
      },
      cerrar: () => setTareaId(null),
      toggleExpandido: () => setExpandido((v) => !v),
    }),
    [tareaId, expandido],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useTareaModal = () => {
  const c = React.useContext(Ctx);
  if (!c) throw new Error("useTareaModal must be inside TareaModalProvider");
  return c;
};

export type { Tarea };
