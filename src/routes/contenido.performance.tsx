import { createFileRoute } from "@tanstack/react-router";
import { ContenidoPerformance } from "@/components/views/ContenidoPerformance";
export const Route = createFileRoute("/contenido/performance")({
  component: () => <div className="p-6"><ContenidoPerformance /></div>,
});