import { createFileRoute } from "@tanstack/react-router";
import { EquipoFechas } from "@/components/views/EquipoFechas";
export const Route = createFileRoute("/equipo/fechas")({
  component: () => <div className="p-6"><EquipoFechas /></div>,
});