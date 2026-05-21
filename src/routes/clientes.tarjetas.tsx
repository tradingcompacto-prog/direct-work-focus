import { createFileRoute, Navigate } from "@tanstack/react-router";
export const Route = createFileRoute("/clientes/tarjetas")({
  component: () => <Navigate to="/clientes/tabla" replace />,
});
