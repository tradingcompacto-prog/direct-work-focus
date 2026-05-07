import { createFileRoute, Navigate } from "@tanstack/react-router";
export const Route = createFileRoute("/tareas/")({
  component: () => <Navigate to="/tareas/timeline" replace />,
});
