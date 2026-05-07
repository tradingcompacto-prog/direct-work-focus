import * as React from "react";

const KEY_SIDEBAR = "sa.sidebar.collapsed";
const KEY_LAST = "sa.lastView";

export const usePrefSidebarCollapsed = () => {
  const [v, setV] = React.useState(false);
  React.useEffect(() => {
    const saved = localStorage.getItem(KEY_SIDEBAR);
    if (saved != null) setV(saved === "1");
  }, []);
  const set = React.useCallback((next: boolean) => {
    setV(next);
    localStorage.setItem(KEY_SIDEBAR, next ? "1" : "0");
  }, []);
  return [v, set] as const;
};

export const guardarUltimaVista = (path: string) => {
  try {
    localStorage.setItem(KEY_LAST, path);
  } catch {}
};
export const leerUltimaVista = (): string | null => {
  try {
    return localStorage.getItem(KEY_LAST);
  } catch {
    return null;
  }
};
