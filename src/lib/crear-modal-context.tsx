import * as React from "react";

interface CrearModalState {
  tipo: "tarea" | "entrega" | "proyecto" | "cliente" | null;
  contexto?: { cliente_id?: string; proyecto_id?: string; entrega_id?: string };
  abrir: (tipo: NonNullable<CrearModalState["tipo"]>, contexto?: CrearModalState["contexto"]) => void;
  cerrar: () => void;
}
const Ctx = React.createContext<CrearModalState | null>(null);

export const CrearModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [tipo, setTipo] = React.useState<CrearModalState["tipo"]>(null);
  const [contexto, setContexto] = React.useState<CrearModalState["contexto"]>();
  const value = React.useMemo<CrearModalState>(
    () => ({
      tipo,
      contexto,
      abrir: (t, c) => {
        setTipo(t);
        setContexto(c);
      },
      cerrar: () => {
        setTipo(null);
        setContexto(undefined);
      },
    }),
    [tipo, contexto],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useCrearModal = () => {
  const c = React.useContext(Ctx);
  if (!c) throw new Error("useCrearModal must be inside CrearModalProvider");
  return c;
};
