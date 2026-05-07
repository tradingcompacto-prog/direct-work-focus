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
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ENTREGAS_MOCK, clientePorId } from "@/lib/mock-tareas";
import { cn } from "@/lib/utils";

const colorEstado: Record<string, string> = {
  en_curso: "bg-blue-100 text-blue-800",
  cerrada: "bg-green-100 text-green-800",
};

export function EquipoCalendario() {
  const [mes, setMes] = React.useState(() => startOfMonth(new Date()));
  const inicio = startOfWeek(startOfMonth(mes), { weekStartsOn: 1 });
  const dias = Array.from({ length: 42 }, (_, i) => addDays(inicio, i));
  const hoy = new Date();

  const entregasPorDia = React.useMemo(() => {
    const m = new Map<string, typeof ENTREGAS_MOCK>();
    for (const e of ENTREGAS_MOCK) {
      const arr = m.get(e.fecha_fin) ?? [];
      arr.push(e);
      m.set(e.fecha_fin, arr);
    }
    return m;
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold capitalize">
          {format(mes, "MMMM yyyy", { locale: es })}
        </h2>
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
            const items = entregasPorDia.get(k) ?? [];
            const esHoy = isSameDay(d, hoy);
            const fueraMes = !isSameMonth(d, mes);
            return (
              <div
                key={k}
                className={cn(
                  "min-h-[100px] border-b border-r border-border p-1.5 text-xs",
                  fueraMes && "bg-muted/20 text-muted-foreground/50",
                )}
              >
                <div className={cn("text-right mb-1", esHoy && "font-bold text-blue-600")}>
                  {format(d, "d")}
                </div>
                <div className="space-y-1">
                  {items.map((e) => (
                    <Link
                      key={e.id}
                      to="/entregas/$id"
                      params={{ id: e.id }}
                      className={cn(
                        "block px-1.5 py-0.5 rounded text-[10px] truncate",
                        colorEstado[e.estado],
                      )}
                    >
                      {clientePorId(e.cliente_id)?.nombre}: {e.nombre}
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
