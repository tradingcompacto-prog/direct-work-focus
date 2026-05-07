import { createFileRoute } from "@tanstack/react-router";
import { EquipoCarga } from "@/components/views/EquipoCarga";
export const Route = createFileRoute("/equipo/carga")({
  component: () => <div className="p-6"><EquipoCarga /></div>,
});
