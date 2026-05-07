import { createFileRoute } from "@tanstack/react-router";
import { MisEntregasGantt } from "@/components/views/MisEntregasGantt";
export const Route = createFileRoute("/entregas/gantt")({
  component: () => <div className="p-6"><MisEntregasGantt /></div>,
});
