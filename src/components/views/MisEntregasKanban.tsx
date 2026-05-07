import { Link } from "@tanstack/react-router";
import { useMisEntregas } from "@/lib/queries";
import { TAREAS_MOCK, ENTREGAS_MOCK } from "@/lib/mock-tareas";
import { ClienteLink } from "@/components/EntidadLinks";
import { Progress } from "@/components/ui/progress";
import { format, parseISO, isAfter, startOfDay, startOfWeek, startOfMonth } from "date-fns";
import { es } from "date-fns/locale";
import type { Entrega } from "@/types/database";

const calcular = (entrega: Entrega) => {
  const ts = TAREAS_MOCK.filter((t) => t.entrega_id === entrega.id);
  const cerradas = ts.filter((t) => t.estado === "completada").length;
  return {
    total: ts.length,
    cerradas,
    pendientes: ts.length - cerradas,
    pct: ts.length ? Math.round((cerradas / ts.length) * 100) : 0,
  };
};

export function MisEntregasKanban() {
  const hoy = startOfDay(new Date());
  const inicioSemana = startOfWeek(hoy, { weekStartsOn: 1 });
  const inicioMes = startOfMonth(hoy);
  const { data = [] } = useMisEntregas();
  const todas = data.length ? data : ENTREGAS_MOCK; // fallback para que el director vea algo

  const enCurso = todas.filter((e) => e.estado === "en_curso");
  const cerradas = todas.filter((e) => e.estado === "cerrada" && e.fecha_cierre);
  const cerradasHoy = cerradas.filter((e) => parseISO(e.fecha_cierre!).toDateString() === hoy.toDateString());
  const cerradasSemana = cerradas.filter(
    (e) =>
      isAfter(parseISO(e.fecha_cierre!), inicioSemana) &&
      !cerradasHoy.includes(e),
  );
  const cerradasMes = cerradas.filter(
    (e) =>
      isAfter(parseISO(e.fecha_cierre!), inicioMes) &&
      !cerradasHoy.includes(e) &&
      !cerradasSemana.includes(e),
  );

  const cols = [
    { titulo: "En curso", items: enCurso, color: "border-t-blue-500" },
    { titulo: "Cerradas hoy", items: cerradasHoy, color: "border-t-green-500" },
    { titulo: "Cerradas esta semana", items: cerradasSemana, color: "border-t-zinc-400" },
    { titulo: "Cerradas este mes", items: cerradasMes, color: "border-t-zinc-300" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {cols.map((col) => (
        <div key={col.titulo} className={`card-soft border-t-4 ${col.color}`}>
          <div className="px-3 py-2 border-b border-border text-sm font-semibold flex items-center justify-between">
            <span>{col.titulo}</span>
            <span className="text-muted-foreground text-xs">{col.items.length}</span>
          </div>
          <div className="p-2 space-y-2 min-h-[120px]">
            {col.items.map((e) => {
              const m = calcular(e);
              return (
                <Link
                  key={e.id}
                  to="/entregas/$id"
                  params={{ id: e.id }}
                  className="block card-soft p-3 hover:shadow-md"
                >
                  <div className="text-sm font-medium">{e.nombre}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    <ClienteLink id={e.cliente_id} />
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
                      <span>{m.cerradas}/{m.total} tareas</span>
                      <span>{m.pct}%</span>
                    </div>
                    <Progress value={m.pct} className="h-1.5" />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{format(parseISO(e.fecha_fin), "d MMM", { locale: es })}</span>
                    <span>{m.pendientes} pendientes</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
