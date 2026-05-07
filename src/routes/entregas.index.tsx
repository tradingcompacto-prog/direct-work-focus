import { createFileRoute, Navigate } from "@tanstack/react-router";
export const Route = createFileRoute("/entregas/")({
  component: () => <Navigate to="/entregas/kanban" replace />,
});
