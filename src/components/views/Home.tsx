import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { format, parseISO, startOfDay, isSameDay, differenceInCalendarDays, startOfWeek, isAfter } from "date-fns";
import { es } from "date-fns/locale";
import { AlertTriangle, CheckCircle2, Calendar as CalendarIcon, Sparkles, Sun, Sunrise, Moon } from "lucide-react";
import { TAREAS_MOCK, ENTREGAS_MOCK, ACTIVIDAD_MOCK, clientePorId, entregaPorId } from "@/lib/mock-tareas";
import { USUARIO_ACTUAL_ID, usuarioActual } from "@/lib/equipo";
import { useTareaModal } from "@/lib/tarea-modal-context";
import { PersonaChip } from "@/components/PersonaChip";
import { saludoSegunHora, urgenciaTarea, etiquetaFechaRelativa, tiempoRelativo } from "@/lib/fechas";
import { colorCliente, bordeIzqCliente } from "@/lib/cliente-colors";
import { cn } from "@/lib/utils";

const iconoHora = () => {
  const h = new Date().getHours();
  if (h < 7) return <Moon className="h-6 w-6 text-indigo-500" />;
  if (h < 13) return <Sunrise className="h-6 w-6 text-amber-500" />;
  if (h < 20) return <Sun className="h-6 w-6 text-amber-500" />;
  return <Moon className="h-6 w-6 text-indigo-500" />;
};

export function Home() {
  const u = usuarioActual();
  const hoy = useMemo(() => startOfDay(new Date()), []);
  const inicioSemana = useMemo(() => startOfWeek(hoy, { weekStartsOn: 1 }), [hoy]);
  const { abrir } = useTareaModal();

  const misTareas = TAREAS_MOCK.filter((t) => t.responsable_id === USUARIO_ACTUAL_ID && t.estado !== "completada");

  const semana = misTareas.filter((t) => {
    const f = parseISO(t.fecha_fin_max);
    return differenceInCalendarDays(f, hoy) <= 6;
  });

  const proximas3 = [...misTareas]
    .sort((a, b) => a.fecha_fin_max.localeCompare(b.fecha_fin_max))
    .slice(0, 3);

  const alertas = misTareas.filter(
    (t) => urgenciaTarea(t.fecha_fin_min, t.fecha_fin_max) === "rojo",
  );

  const proximaEntrega = ENTREGAS_MOCK.filter((e) => e.pm_id === USUARIO_ACTUAL_ID && e.estado === "en_curso")
    .sort((a, b) => a.fecha_fin.localeCompare(b.fecha_fin))[0];

  const cerradasSemana = TAREAS_MOCK.filter(
    (t) => t.responsable_id === USUARIO_ACTUAL_ID && t.estado === "completada",
  ).length;

  // Mini gráfico: tareas cerradas por día de los últimos 7 días (mock estable basado en la semana)
  const dias7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(hoy);
    d.setDate(d.getDate() - 6 + i);
    return d;
  });
  const seed = (cerradasSemana || 5) + 1;
  const barras = dias7.map((d, i) => ((i * 31 + seed * 7) % 9) + 1);

  const actividad = ACTIVIDAD_MOCK.slice(0, 5);

  return (
    <div className="space-y-6 anim-in">
      {/* Saludo */}
      <div className="flex items-center gap-3">
        {iconoHora()}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {saludoSegunHora()}, {u.nombre.split(" ")[0]}
          </h1>
          <p className="text-sm text-muted-foreground capitalize">
            {format(hoy, "EEEE, d 'de' MMMM", { locale: es })} · {semana.length} tareas para esta semana
          </p>
        </div>
      </div>

      {/* Próximas 3 tareas */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5" /> Tus próximas tareas
        </h2>
        {proximas3.length === 0 ? (
          <div className="card-soft p-8 text-center text-sm text-muted-foreground">
            🎉 ¡Sin tareas pendientes! Disfruta del momento.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {proximas3.map((t) => {
              const u = urgenciaTarea(t.fecha_fin_min, t.fecha_fin_max);
              const c = clientePorId(t.cliente_id);
              const ent = entregaPorId(t.entrega_id);
              return (
                <button
                  key={t.id}
                  onClick={() => abrir(t.id)}
                  className="card-soft p-4 text-left hover:shadow-md transition border-l-4"
                  style={bordeIzqCliente(t.cliente_id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium leading-snug">{t.titulo}</h3>
                    <span
                      className={cn(
                        "text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0",
                        u === "rojo" && "bg-red-100 text-red-700",
                        u === "amarillo" && "bg-amber-100 text-amber-700",
                        u === "azul" && "bg-blue-100 text-blue-700",
                      )}
                    >
                      {etiquetaFechaRelativa(t.fecha_fin_max)}
                    </span>
                  </div>
                  <div className="mt-3 text-xs text-muted-foreground flex items-center gap-1.5">
                    <span
                      className="h-2 w-2 rounded-full inline-block shrink-0"
                      style={{ backgroundColor: colorCliente(t.cliente_id).border }}
                    />
                    <span className="truncate">{c?.nombre}</span>
                    {ent && <span className="truncate">· {ent.nombre}</span>}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Alertas + próxima entrega */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="card-soft p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5" /> Alertas
          </h3>
          {alertas.length === 0 ? (
            <div className="text-sm text-muted-foreground">Todo bajo control 👌</div>
          ) : (
            <ul className="space-y-1.5">
              {alertas.slice(0, 4).map((t) => (
                <li key={t.id}>
                  <button
                    onClick={() => abrir(t.id)}
                    className="w-full text-left text-sm flex items-center justify-between gap-2 px-2 py-1.5 rounded hover:bg-muted/50"
                  >
                    <span className="truncate">{t.titulo}</span>
                    <span className="text-xs text-red-600 font-medium shrink-0">
                      {etiquetaFechaRelativa(t.fecha_fin_max)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card-soft p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
            <CalendarIcon className="h-3.5 w-3.5" /> Próxima entrega
          </h3>
          {proximaEntrega ? (
            <Link to="/entregas/$id" params={{ id: proximaEntrega.id }} className="block">
              <div className="font-medium">{proximaEntrega.nombre}</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {clientePorId(proximaEntrega.cliente_id)?.nombre}
              </div>
              <div className="text-sm text-blue-600 font-medium mt-2">
                {format(parseISO(proximaEntrega.fecha_fin), "d 'de' MMMM", { locale: es })} ·{" "}
                {etiquetaFechaRelativa(proximaEntrega.fecha_fin)}
              </div>
            </Link>
          ) : (
            <div className="text-sm text-muted-foreground">Sin entregas próximas</div>
          )}
        </div>
      </section>

      {/* Tu semana */}
      <section className="card-soft p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
          <CheckCircle2 className="h-3.5 w-3.5" /> Tu semana
        </h3>
        <p className="text-sm text-muted-foreground mb-3">
          Has cerrado <span className="text-foreground font-semibold">{cerradasSemana} tareas</span> en los últimos días.
        </p>
        <div className="flex items-end gap-2 h-20">
          {barras.map((v, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-t bg-gradient-to-t from-blue-300 to-blue-500"
                style={{ height: `${(v / 10) * 100}%` }}
                title={`${v} tareas`}
              />
              <span className="text-[10px] text-muted-foreground uppercase">
                {format(dias7[i], "EEEEE", { locale: es })}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Actividad reciente */}
      <section className="card-soft p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          🔥 Actividad reciente del equipo
        </h3>
        <ul className="space-y-2">
          {actividad.map((a) => (
            <li key={a.id} className="text-sm flex items-center gap-2">
              <PersonaChip id={a.actor_id} size="xs" showName={false} />
              <span className="text-muted-foreground flex-1 truncate">{a.texto}</span>
              <span className="text-xs text-muted-foreground shrink-0">{tiempoRelativo(a.fecha)}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}