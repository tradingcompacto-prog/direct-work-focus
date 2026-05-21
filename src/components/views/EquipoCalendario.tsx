import * as React from "react";
import {
  addDays,
  addMonths,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { es } from "date-fns/locale";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Megaphone } from "lucide-react";
import { ENTREGAS_MOCK, clientePorId } from "@/lib/mock-tareas";
import { cn } from "@/lib/utils";
import { VistaHeader } from "@/components/VistaHeader";

/**
 * Calendario exclusivo de Campañas activas.
 * Cada campaña se expande a todos los días entre su fecha_inicio y fecha_fin.
 */
export function EquipoCalendario() {
  const [mes, setMes] = React.useState(() => startOfMonth(new Date()));
  const inicio = startOfWeek(startOfMonth(mes), { weekStartsOn: 1 });
  const dias = Array.from({ length: 42 }, (_, i) => addDays(inicio, i));
  const hoy = new Date();

  const campanas = React.useMemo(
    () =>
      ENTREGAS_MOCK.filter((e) => e.categoria === "campanas_activas"),
    [],
  );

  const porDia = React.useMemo(() => {
    const m = new Map<string, { id: string; label: string; entregaId: string }[]>();
    for (const c of campanas) {
      const ini = parseISO(c.fecha_inicio);
      const fin = parseISO(c.fecha_fin);
      for (let d = new Date(ini); d <= fin; d = addDays(d, 1)) {
        const k = format(d, "yyyy-MM-dd");
        const arr = m.get(k) ?? [];
        arr.push({
          id: c.id,
          label: `${clientePorId(c.cliente_id)?.nombre ?? ""}: ${c.nombre}`,
          entregaId: c.id,
        });
        m.set(k, arr);
      }
    }
    return m;
  }, [campanas]);

  return (
    <div className="space-y-3">
      <VistaHeader
        titulo="Calendario"
        leyenda="Vista mensual con todas las entregas, tareas, fechas importantes y vacaciones."
      />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-purple-600" />
          <h2 className="text-lg font-semibold capitalize">
            Campañas activas · {format(mes, "MMMM yyyy", { locale: es })}
          </h2>
        </div>
        <div className="flex gap-1">
          <Button size="sm" variant="outline" onClick={() => setMes(subMonths(mes, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => setMes(startOfMonth(new Date()))}>
            Hoy
          </Button>
          <Button size="sm" variant="outline" onClick={() => setMes(addMonths(mes, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="card-soft overflow-hidden">
        <div className="grid grid-cols-7 border-b border-border bg-muted/30 text-[11px] font-semibold uppercase text-muted-foreground">
          {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d) => (
            <div key={d} className="px-2 py-2 text-center">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {dias.map((d) => {
            const k = format(d, "yyyy-MM-dd");
            const items = porDia.get(k) ?? [];
            const esHoy = isSameDay(d, hoy);
            const fueraMes = !isSameMonth(d, mes);
            return (
              <div
                key={k}
                className={cn(
                  "min-h-[110px] border-b border-r border-border p-1.5 text-xs",
                  fueraMes && "bg-muted/20 text-muted-foreground/50",
                )}
              >
                <div className={cn("text-right mb-1", esHoy && "font-bold text-purple-600")}>
                  {format(d, "d")}
                </div>
                <div className="space-y-1">
                  {items.map((ev) => (
                    <Link
                      key={ev.id + k}
                      to="/entregas/$id"
                      params={{ id: ev.entregaId }}
                      className="block px-1.5 py-0.5 rounded text-[10px] truncate bg-purple-100 text-purple-800 hover:bg-purple-200"
                    >
                      {ev.label}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
