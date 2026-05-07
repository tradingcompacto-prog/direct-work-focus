import { createFileRoute } from "@tanstack/react-router";
import { ClientesTabla } from "@/components/views/ClientesTabla";
export const Route = createFileRoute("/clientes/tabla")({
  component: () => <div className="p-6"><ClientesTabla /></div>,
});
