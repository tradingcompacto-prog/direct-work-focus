import { createFileRoute } from "@tanstack/react-router";
import { MisEntregasTimeline } from "@/components/views/MisEntregasTimeline";
export const Route = createFileRoute("/entregas/gantt")({
  component: () => <div className="p-6"><MisEntregasTimeline /></div>,
});
