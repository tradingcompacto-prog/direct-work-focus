import { createFileRoute, Link } from "@tanstack/react-router";
import { MisEntregasTabla } from "@/components/views/MisEntregasTabla";
import { Info } from "lucide-react";

export const Route = createFileRoute("/entregas/tabla")({
  component: Page,
});

function Page() {
  return (
    <div className="p-6 space-y-3">
      <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-900 flex items-center gap-2">
        <Info className="h-4 w-4 shrink-0" />
        <span>
          Las vistas globales de entregas se han simplificado. Ve tus tareas{" "}
          <Link to="/tareas/timeline" className="underline font-medium">
            aquí →
          </Link>
        </span>
      </div>
      <MisEntregasTabla />
    </div>
  );
}
