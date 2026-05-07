import { createFileRoute } from "@tanstack/react-router";
import { MisEntregasKanban } from "@/components/views/MisEntregasKanban";
export const Route = createFileRoute("/entregas/kanban")({
  component: () => <div className="p-6"><MisEntregasKanban /></div>,
});
