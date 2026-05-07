import { createFileRoute } from "@tanstack/react-router";
import { MisTareasTimeline } from "@/components/views/MisTareasTimeline";
export const Route = createFileRoute("/tareas/timeline")({
  component: () => <div className="p-6"><MisTareasTimeline /></div>,
});
