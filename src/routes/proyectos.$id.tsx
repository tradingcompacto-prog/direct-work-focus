import { createFileRoute, Link } from "@tanstack/react-router";
import { proyectoPorId, ENTREGAS_MOCK, clientePorId } from "@/lib/mock-tareas";
import { PersonaChip } from "@/components/PersonaChip";
import { Button } from "@/components/ui/button";
import { useCrearModal } from "@/lib/crear-modal-context";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/proyectos/$id")({
  component: FichaProyecto,
});

function FichaProyecto() {
  const { id } = Route.useParams();
  const p = proyectoPorId(id);
  const { abrir } = useCrearModal();
  if (!p) return <div className="p-6">Proyecto no encontrado</div>;
  const cli = clientePorId(p.cliente_id);
  const entregas = ENTREGAS_MOCK.filter((e) => e.proyecto_id === p.id);
  const activas = entregas.filter((e) => e.estado === "en_curso");
  const cerradas = entregas.filter((e) => e.estado === "cerrada");

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{p.nombre}</h1>
          <div className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
            {cli && <Link to="/clientes/$id" params={{ id: cli.id }} className="hover:underline">{cli.nombre}</Link>}
            <span>·</span>
            <PersonaChip id={p.pm_id} size="xs" />
            <span>· {p.estado}</span>
          </div>
        </div>
        <Button size="sm" onClick={() => abrir("entrega", { cliente_id: p.cliente_id, proyecto_id: p.id })}>
          <Plus className="h-4 w-4 mr-1" /> Entrega
        </Button>
      </header>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Entregas activas ({activas.length})
        </h2>
        <div className="space-y-1">
          {activas.map((e) => (
            <Link key={e.id} to="/entregas/$id" params={{ id: e.id }} className="card-soft p-3 block hover:underline">
              {e.nombre}
            </Link>
          ))}
        </div>
      </section>

      {cerradas.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Entregas cerradas ({cerradas.length})
          </h2>
          <div className="space-y-1">
            {cerradas.map((e) => (
              <Link key={e.id} to="/entregas/$id" params={{ id: e.id }} className="card-soft p-3 block opacity-70 hover:opacity-100">
                {e.nombre}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
