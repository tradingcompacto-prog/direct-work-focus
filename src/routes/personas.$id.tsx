import { createFileRoute } from "@tanstack/react-router";
import { miembroPorId } from "@/lib/equipo";
import { TAREAS_MOCK } from "@/lib/mock-tareas";
import { useTareaModal } from "@/lib/tarea-modal-context";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { urgenciaTarea } from "@/lib/fechas";
import { precisionPersona } from "@/lib/estimacion";
import { useTareasVersion } from "@/lib/tareas-store";

export const Route = createFileRoute("/personas/$id")({
  component: FichaPersona,
});

function FichaPersona() {
  const { id } = Route.useParams();
  useTareasVersion();
  const m = miembroPorId(id);
  const { abrir } = useTareaModal();
  if (!m) return <div className="p-6">Persona no encontrada</div>;
  const activas = TAREAS_MOCK.filter((t) => t.responsable_id === m.id && t.estado !== "completada");
  const vencidas = activas.filter((t) => urgenciaTarea(t.fecha_fin_min, t.fecha_fin_max) === "rojo");
  const precision = precisionPersona(m.id, TAREAS_MOCK);

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarFallback className="text-lg bg-secondary">{m.iniciales}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">{m.nombre}</h1>
          <div className="text-sm text-muted-foreground">{m.rol} · {m.email}</div>
          <div className="flex gap-1.5 mt-1.5">
            {m.grupos.map((g) => (
              <Badge key={g} variant="secondary">{g}</Badge>
            ))}
          </div>
        </div>
        <div className="ml-auto text-right">
          <div className="text-2xl font-bold">{activas.length}</div>
          <div className="text-xs text-muted-foreground">activas · {vencidas.length} vencidas</div>
        </div>
      </header>

      {precision != null && (
        <section className="card-soft p-4 grid gap-4 md:grid-cols-2">
          {precision != null && (
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                Precisión estimaciones
              </div>
              <div className="text-3xl font-semibold tabular-nums">
                {Math.round(precision * 100)}%
              </div>
            </div>
          )}
        </section>
      )}

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Tareas activas
        </h2>
        <div className="space-y-1">
          {activas.map((t) => (
            <button
              key={t.id}
              onClick={() => abrir(t.id)}
              className="card-soft p-3 w-full text-left text-sm hover:bg-muted/30"
            >
              {t.titulo}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
