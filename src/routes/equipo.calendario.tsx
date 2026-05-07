import { createFileRoute } from "@tanstack/react-router";
import { EquipoCalendario } from "@/components/views/EquipoCalendario";
export const Route = createFileRoute("/equipo/calendario")({
  component: () => <div className="p-6"><EquipoCalendario /></div>,
});
