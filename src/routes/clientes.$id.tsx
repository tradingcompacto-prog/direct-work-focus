import { createFileRoute, Link } from "@tanstack/react-router";
import { clientePorId, PROYECTOS_MOCK, ENTREGAS_MOCK } from "@/lib/mock-tareas";
import { PersonaChip } from "@/components/PersonaChip";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCrearModal } from "@/lib/crear-modal-context";
import { Plus } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export const Route = createFileRoute("/clientes/$id")({
  component: FichaCliente,
});

function FichaCliente() {
  const { id } = Route.useParams();
  const c = clientePorId(id);
  const { abrir } = useCrearModal();
  if (!c) return <div className="p-6">Cliente no encontrado</div>;
  const proyectos = PROYECTOS_MOCK.filter((p) => p.cliente_id === c.id);
  const entregas = ENTREGAS_MOCK.filter((e) => e.cliente_id === c.id).slice(0, 20);
  return (
    <div className="p-6 space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{c.nombre}</h1>
          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
            <Badge variant="secondary">{c.sector}</Badge>
            <PersonaChip id={c.pm_id} size="xs" />
            {c.web && <span>· {c.web}</span>}
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => abrir("proyecto", { cliente_id: c.id })}>
            <Plus className="h-4 w-4 mr-1" /> Proyecto
          </Button>
          <Button size="sm" variant="outline" onClick={() => abrir("entrega", { cliente_id: c.id })}>
            <Plus className="h-4 w-4 mr-1" /> Entrega
          </Button>
        </div>
      </header>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Proyectos ({proyectos.length})
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {proyectos.map((p) => (
            <Link
              key={p.id}
              to="/proyectos/$id"
              params={{ id: p.id }}
              className="card-soft p-3 text-sm hover:underline"
            >
              {p.nombre}
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Próximas entregas
        </h2>
        <div className="space-y-1">
          {entregas.map((e) => (
            <Link
              key={e.id}
              to="/entregas/$id"
              params={{ id: e.id }}
              className="card-soft p-3 flex justify-between text-sm hover:underline"
            >
              <span>{e.nombre}</span>
              <span className="text-xs text-muted-foreground">
                {format(parseISO(e.fecha_fin), "d MMM", { locale: es })}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
