import * as React from "react";

interface BusquedaState {
  abierto: boolean;
  abrir: () => void;
  cerrar: () => void;
}
const Ctx = React.createContext<BusquedaState | null>(null);

export const BusquedaProvider = ({ children }: { children: React.ReactNode }) => {
  const [abierto, setAbierto] = React.useState(false);
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setAbierto((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  const value = React.useMemo<BusquedaState>(
    () => ({ abierto, abrir: () => setAbierto(true), cerrar: () => setAbierto(false) }),
    [abierto],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useBusquedaGlobal = () => {
  const c = React.useContext(Ctx);
  if (!c) throw new Error("useBusquedaGlobal must be inside BusquedaProvider");
  return c;
};
