import { createFileRoute } from "@tanstack/react-router";
import { ContenidoPipeline } from "@/components/views/ContenidoPipeline";
export const Route = createFileRoute("/contenido/pipeline")({
  component: () => <div className="p-6"><ContenidoPipeline /></div>,
});