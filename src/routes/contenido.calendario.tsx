import { createFileRoute } from "@tanstack/react-router";
import { ContenidoCalendario } from "@/components/views/ContenidoCalendario";
export const Route = createFileRoute("/contenido/calendario")({
  component: () => <div className="p-6"><ContenidoCalendario /></div>,
});