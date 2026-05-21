import { createFileRoute, Navigate } from "@tanstack/react-router";
export const Route = createFileRoute("/clientes/")({
  component: () => <Navigate to="/clientes/tabla" replace />,
});
