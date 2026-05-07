import { TAREAS_MOCK, ENTREGAS_MOCK, ACTIVIDAD_MOCK, clientePorId } from "@/lib/mock-tareas";
import { EQUIPO } from "@/lib/equipo";
import { urgenciaTarea, tiempoRelativo } from "@/lib/fechas";
import { Link } from "@tanstack/react-router";
import { format, parseISO, addDays, startOfDay } from "date-fns";
import { es } from "date-fns/locale";

export function Brujula() {
  const hoy = startOfDay(new Date());
  const vencidas = TAREAS_MOCK.filter(
    (t) => t.estado !== "completada" && urgenciaTarea(t.fecha_fin_min, t.fecha_fin_max) === "rojo",
  );
  const porCliente = new Map<string, number>();
  for (const t of vencidas) porCliente.set(t.cliente_id, (porCliente.get(t.cliente_id) ?? 0) + 1);
  const topClientes = Array.from(porCliente.entries()).sort((a, b) => b[1] - a[1]).slice(0, 3);

  const carga = new Map<string, number>();
  for (const t of TAREAS_MOCK) {
    if (t.estado !== "completada") carga.set(t.responsable_id, (carga.get(t.responsable_id) ?? 0) + 1);
  }
  const topPersonas = Array.from(carga.entries()).sort((a, b) => b[1] - a[1]).slice(0, 3);

  const proximas = ENTREGAS_MOCK.filter(
    (e) => e.estado === "en_curso" && parseISO(e.fecha_fin) <= addDays(hoy, 7),
  )
    .sort((a, b) => a.fecha_fin.localeCompare(b.fecha_fin))
    .slice(0, 5);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <Widget title="Vencidas en el equipo" big>
        <div className="text-6xl font-bold text-red-600">{vencidas.length}</div>
        <p className="text-xs text-muted-foreground mt-2">tareas rojas activas</p>
      </Widget>
      <Widget title="Top clientes con alertas">
        <ul className="space-y-2 text-sm">
          {topClientes.map(([id, n]) => (
            <li key={id} className="flex justify-between">
              <Link to="/clientes/$id" params={{ id }} className="hover:underline">
                {clientePorId(id)?.nombre}
              </Link>
              <span className="text-red-600 font-semibold">{n}</span>
            </li>
          ))}
          {topClientes.length === 0 && <li className="text-muted-foreground">Sin alertas</li>}
        </ul>
      </Widget>
      <Widget title="Personas más cargadas">
        <ul className="space-y-2 text-sm">
          {topPersonas.map(([id, n]) => {
            const m = EQUIPO.find((p) => p.id === id);
            return (
              <li key={id} className="flex justify-between">
                <Link to="/personas/$id" params={{ id }} className="hover:underline">
                  {m?.nombre}
                </Link>
                <span className="font-semibold">{n}</span>
              </li>
            );
          })}
        </ul>
      </Widget>
      <Widget title="Próximas 5 entregas">
        <ul className="space-y-2 text-sm">
          {proximas.map((e) => (
            <li key={e.id} className="flex justify-between gap-2">
              <Link to="/entregas/$id" params={{ id: e.id }} className="truncate hover:underline">
                {clientePorId(e.cliente_id)?.nombre}: {e.nombre}
              </Link>
              <span className="text-xs text-muted-foreground shrink-0">
                {format(parseISO(e.fecha_fin), "d MMM", { locale: es })}
              </span>
            </li>
          ))}
        </ul>
      </Widget>
      <Widget title="Actividad últimas 24h">
        <ul className="space-y-1.5 text-sm">
          {ACTIVIDAD_MOCK.slice(0, 6).map((a) => (
            <li key={a.id} className="text-muted-foreground">
              {a.texto} · {tiempoRelativo(a.fecha)}
            </li>
          ))}
        </ul>
      </Widget>
      <Widget title="Cumplimiento esta semana">
        <div className="text-5xl font-bold text-green-600">86%</div>
        <p className="text-xs text-muted-foreground mt-2">entregas a tiempo</p>
      </Widget>
    </div>
  );
}

function Widget({ title, children, big }: { title: string; children: React.ReactNode; big?: boolean }) {
  return (
    <div className={`card-soft p-5 ${big ? "md:col-span-1" : ""}`}>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        {title}
      </h3>
      {children}
    </div>
  );
}
