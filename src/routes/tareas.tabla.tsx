import { createFileRoute } from "@tanstack/react-router";
import { MisTareasTabla } from "@/components/views/MisTareasTabla";
export const Route = createFileRoute("/tareas/tabla")({
  component: () => <div className="p-6"><MisTareasTabla /></div>,
});
