import { Link } from "@tanstack/react-router";
import { useClientes } from "@/lib/queries";
import { PROYECTOS_MOCK, ENTREGAS_MOCK, TAREAS_MOCK } from "@/lib/mock-tareas";
import { PersonaChip } from "@/components/PersonaChip";
import { AvatarStack } from "@/components/AvatarStack";
import { bordeIzqCliente } from "@/lib/cliente-colors";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useTareasVersion } from "@/lib/tareas-store";

const saludColor = { verde: "bg-green-500", amarillo: "bg-amber-500", rojo: "bg-red-500" };

export function ClientesTarjetas() {
  useTareasVersion();
  const { data = [] } = useClientes();
  if (!data.length) {
    return (
      <div className="card-soft p-12 text-center">
        <div className="text-5xl mb-3">💼</div>
        <p className="text-sm text-muted-foreground">Aún no hay clientes</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {data.map((c) => {
        const proyectos = PROYECTOS_MOCK.filter((p) => p.cliente_id === c.id && p.estado === "activo");
        const proxima = ENTREGAS_MOCK.filter((e) => e.cliente_id === c.id && e.estado === "en_curso")
          .sort((a, b) => a.fecha_fin.localeCompare(b.fecha_fin))[0];
        const ts = TAREAS_MOCK.filter((t) => t.cliente_id === c.id && t.estado !== "completada");
        const equipo = Array.from(new Set(ts.map((t) => t.responsable_id)));
        return (
          <Link
            key={c.id}
            to="/clientes/$id"
            params={{ id: c.id }}
            className="card-soft p-4 block border-l-4 hover:shadow-md transition"
            style={bordeIzqCliente(c.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <span className={cn("h-2 w-2 rounded-full shrink-0", saludColor[c.salud])} />
                <div className="font-semibold truncate">{c.nombre}</div>
              </div>
              <span className={cn("h-2.5 w-2.5 rounded-full", saludColor[c.salud])} />
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">{c.sector}</div>
            <div className="mt-3 flex items-center justify-between">
              <PersonaChip id={c.pm_id} size="xs" link={false} />
              <AvatarStack ids={equipo} size="xs" />
            </div>
            {proxima && (
              <div className="mt-2 text-[11px] text-muted-foreground">
                Próxima: {proxima.nombre} · {format(parseISO(proxima.fecha_fin), "d MMM", { locale: es })}
              </div>
            )}
            <div className="mt-1 text-[11px] text-muted-foreground">
              {ts.length} tareas activas · {proyectos.length} proyecto{proyectos.length === 1 ? "" : "s"}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
