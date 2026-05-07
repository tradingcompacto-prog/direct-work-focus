import { createFileRoute } from "@tanstack/react-router";
import { Home } from "@/components/views/Home";

export const Route = createFileRoute("/")({
  component: () => (
    <div className="p-6 max-w-6xl mx-auto">
      <Home />
    </div>
  ),
});
