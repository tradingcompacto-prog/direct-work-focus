import { createFileRoute } from "@tanstack/react-router";
import { ClientesTarjetas } from "@/components/views/ClientesTarjetas";
export const Route = createFileRoute("/clientes/tarjetas")({
  component: () => <div className="p-6"><ClientesTarjetas /></div>,
});
