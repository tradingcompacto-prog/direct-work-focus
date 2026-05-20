import { TAREAS_MOCK, ENTREGAS_MOCK, ACTIVIDAD_MOCK, clientePorId } from "@/lib/mock-tareas";
import { EQUIPO } from "@/lib/equipo";
import { urgenciaTarea, tiempoRelativo } from "@/lib/fechas";
import { estimarTarea } from "@/lib/estimacion";
import { Link } from "@tanstack/react-router";
import { format, parseISO, addDays, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { useTareasVersion } from "@/lib/tareas-store";

export function Brujula() {
  useTareasVersion();
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

  // Capacidad semanal (horas)
  const enSemana = TAREAS_MOCK.filter((t) => {
    if (t.estado === "completada") return false;
    const f = parseISO(t.fecha_fin_max);
    return f >= hoy && f <= addDays(hoy, 7);
  });
  let horasPlanif = 0;
  for (const t of enSemana) {
    const h = t.horas_estimadas ?? estimarTarea(t, TAREAS_MOCK)?.horas;
    if (h) horasPlanif += h;
  }
  horasPlanif = Math.round(horasPlanif);
  const capacidad = EQUIPO.filter((m) => m.activo).length * 32; // ~32h útiles por persona/semana
  const utilizacion = capacidad ? Math.round((horasPlanif / capacidad) * 100) : 0;
  const mostrarHoras = horasPlanif > 0;

  // Cumplimiento real: % de entregas completadas a tiempo en los últimos 30 días.
  const hace30 = addDays(hoy, -30);
  const entregasRecientes = ENTREGAS_MOCK.filter((e) => {
    const f = parseISO(e.fecha_fin);
    return f >= hace30 && f <= hoy;
  });
  const cerradas = entregasRecientes.filter((e) => e.estado === "completada");
  const aTiempo = cerradas.filter((e) => {
    const cierre = e.fecha_cierre ? parseISO(e.fecha_cierre) : null;
    return cierre ? cierre <= parseISO(e.fecha_fin) : true;
  });
  const cumplimiento = cerradas.length > 0
    ? Math.round((aTiempo.length / cerradas.length) * 100)
    : null;

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
      <Widget title="Cumplimiento últimos 30 días">
        {cumplimiento === null ? (
          <>
            <div className="text-2xl font-semibold text-muted-foreground">Sin datos</div>
            <p className="text-xs text-muted-foreground mt-2">
              Aún no hay entregas cerradas en los últimos 30 días.
            </p>
          </>
        ) : (
          <>
            <div
              className={`text-5xl font-bold ${
                cumplimiento >= 85 ? "text-green-600" : cumplimiento >= 60 ? "text-amber-600" : "text-red-600"
              }`}
            >
              {cumplimiento}%
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {aTiempo.length}/{cerradas.length} entregas a tiempo
            </p>
          </>
        )}
      </Widget>
      {mostrarHoras && (
        <Widget title="⏱ Capacidad esta semana">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-2xl font-bold tabular-nums">{horasPlanif}h</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Planif.</div>
            </div>
            <div>
              <div className="text-2xl font-bold tabular-nums">{capacidad}h</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Capacidad</div>
            </div>
            <div>
              <div
                className={`text-2xl font-bold tabular-nums ${
                  utilizacion > 100 ? "text-red-600" : utilizacion > 85 ? "text-amber-600" : "text-emerald-600"
                }`}
              >
                {utilizacion}%
              </div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Util.</div>
            </div>
          </div>
          <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full ${
                utilizacion > 100 ? "bg-red-500" : utilizacion > 85 ? "bg-amber-500" : "bg-emerald-500"
              }`}
              style={{ width: `${Math.min(100, utilizacion)}%` }}
            />
          </div>
        </Widget>
      )}
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
