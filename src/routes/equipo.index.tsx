import { createFileRoute, Navigate } from "@tanstack/react-router";
export const Route = createFileRoute("/equipo/")({
  component: () => <Navigate to="/equipo/carga" replace />,
});
