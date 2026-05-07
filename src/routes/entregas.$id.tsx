import { createFileRoute, Link } from "@tanstack/react-router";
import { entregaPorId, clientePorId, proyectoPorId, TAREAS_MOCK } from "@/lib/mock-tareas";
import { PersonaChip } from "@/components/PersonaChip";
import { Button } from "@/components/ui/button";
import { useCrearModal } from "@/lib/crear-modal-context";
import { useTareaModal } from "@/lib/tarea-modal-context";
import { Plus } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/entregas/$id")({
  component: FichaEntrega,
});

function FichaEntrega() {
  const { id } = Route.useParams();
  const e = entregaPorId(id);
  const { abrir } = useCrearModal();
  const { abrir: abrirTarea } = useTareaModal();
  if (!e) return <div className="p-6">Entrega no encontrada</div>;
  const cli = clientePorId(e.cliente_id);
  const pry = proyectoPorId(e.proyecto_id);
  const tareas = TAREAS_MOCK.filter((t) => t.entrega_id === e.id);

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{e.nombre}</h1>
          <div className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
            {cli && <Link to="/clientes/$id" params={{ id: cli.id }} className="hover:underline">{cli.nombre}</Link>}
            {pry && cli && pry.nombre !== cli.nombre && (
              <>
                <span>›</span>
                <Link to="/proyectos/$id" params={{ id: pry.id }} className="hover:underline">{pry.nombre}</Link>
              </>
            )}
            <span>·</span>
            <Badge variant="secondary">{e.estado}</Badge>
            <span>· {format(parseISO(e.fecha_fin), "d MMM", { locale: es })}</span>
          </div>
        </div>
        <Button size="sm" onClick={() => abrir("tarea", { cliente_id: e.cliente_id, proyecto_id: e.proyecto_id, entrega_id: e.id })}>
          <Plus className="h-4 w-4 mr-1" /> Tarea
        </Button>
      </header>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Tareas ({tareas.length})
        </h2>
        <div className="space-y-1">
          {tareas.map((t) => (
            <button
              key={t.id}
              onClick={() => abrirTarea(t.id)}
              className="card-soft p-3 w-full flex justify-between items-center text-left hover:bg-muted/30"
            >
              <span className="text-sm">{t.titulo}</span>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px]">{t.estado}</Badge>
                <PersonaChip id={t.responsable_id} size="xs" showName={false} />
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
