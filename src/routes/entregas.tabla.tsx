import { createFileRoute } from "@tanstack/react-router";
import { MisEntregasTabla } from "@/components/views/MisEntregasTabla";
export const Route = createFileRoute("/entregas/tabla")({
  component: () => <div className="p-6"><MisEntregasTabla /></div>,
});
