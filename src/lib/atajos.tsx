import * as React from "react";
import { useNavigate } from "@tanstack/react-router";
import { useCrearModal } from "@/lib/crear-modal-context";
import { useBusquedaGlobal } from "@/lib/busqueda-context";
import { toast } from "sonner";

const esCampoEditable = (el: EventTarget | null): boolean => {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    el.isContentEditable
  );
};

/** Atajos globales tipo Linear/Notion */
export function AtajosGlobales() {
  const navigate = useNavigate();
  const { abrir } = useCrearModal();
  const busqueda = useBusquedaGlobal();
  const goRef = React.useRef<number | null>(null);
  const goActivo = React.useRef(false);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (esCampoEditable(e.target)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const key = e.key.toLowerCase();

      // Modo "ir a": pulsa G y luego una letra
      if (goActivo.current) {
        const map: Record<string, string> = {
          h: "/",
          t: "/tareas/timeline",
          k: "/entregas/kanban",
          c: "/equipo/carga",
          l: "/clientes/tarjetas",
          b: "/brujula",
        };
        const dest = map[key];
        if (dest) {
          e.preventDefault();
          navigate({ to: dest as never });
        }
        goActivo.current = false;
        if (goRef.current) window.clearTimeout(goRef.current);
        return;
      }

      if (key === "g") {
        goActivo.current = true;
        toast("Ir a… h home · t tareas · k kanban · c carga · l clientes · b brújula", {
          duration: 1500,
        });
        if (goRef.current) window.clearTimeout(goRef.current);
        goRef.current = window.setTimeout(() => (goActivo.current = false), 1500);
        return;
      }

      if (key === "n") {
        e.preventDefault();
        abrir("tarea");
        return;
      }
      if (key === "/") {
        e.preventDefault();
        busqueda.abrir();
        return;
      }
      if (key === "?") {
        e.preventDefault();
        toast("Atajos: ⌘K buscar · N nueva tarea · / buscar · G luego H/T/K/C/L/B", {
          duration: 4000,
        });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate, abrir, busqueda]);

  return null;
}
