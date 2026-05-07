import { createFileRoute } from "@tanstack/react-router";
import { Brujula } from "@/components/views/Brujula";
export const Route = createFileRoute("/brujula")({
  component: () => <div className="p-6"><Brujula /></div>,
});
