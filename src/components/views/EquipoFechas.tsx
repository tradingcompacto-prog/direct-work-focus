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
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { ChevronLeft, ChevronRight, Sparkles, Plane } from "lucide-react";
import { nombrePorId } from "@/lib/equipo";
import { cn } from "@/lib/utils";
import { useFechasImportantes } from "@/lib/fechas-importantes-store";
import { useVacacionesAprobadas } from "@/lib/vacaciones-store";
import { useAuth } from "@/lib/auth";
import { TIPO_FECHA_COLOR } from "@/types/database";

type Capa = "fechas" | "vacaciones";

/**
 * Calendario de Fechas importantes y Vacaciones (independiente de campañas).
 */
export function EquipoFechas() {
  const [mes, setMes] = React.useState(() => startOfMonth(new Date()));
  const [capas, setCapas] = React.useState<Record<Capa, boolean>>({
    fechas: true,
    vacaciones: true,
  });
  const toggle = (c: Capa) => setCapas((s) => ({ ...s, [c]: !s[c] }));
  const { data: fechas = [] } = useFechasImportantes();
  const { data: vacAprobadas = [] } = useVacacionesAprobadas();
  const { user } = useAuth();

  const inicio = startOfWeek(startOfMonth(mes), { weekStartsOn: 1 });
  const dias = Array.from({ length: 42 }, (_, i) => addDays(inicio, i));
  const hoy = new Date();

  type Evento = { id: string; tipo: Capa; label: string; cls: string; mio?: boolean };
  const porDia = React.useMemo(() => {
    const m = new Map<string, Evento[]>();
    for (const f of fechas) {
      const ini = parseISO(f.fecha_inicio);
      const fin = parseISO(f.fecha_fin ?? f.fecha_inicio);
      for (let d = new Date(ini); d <= fin; d = addDays(d, 1)) {
        const k = format(d, "yyyy-MM-dd");
        const arr = m.get(k) ?? [];
        arr.push({
          id: f.id,
          tipo: "fechas",
          label: f.titulo,
          cls: TIPO_FECHA_COLOR[f.tipo] ?? "bg-amber-100 text-amber-800",
        });
        m.set(k, arr);
      }
    }
    for (const v of vacAprobadas) {
      const ini = parseISO(v.fecha_inicio);
      const fin = parseISO(v.fecha_fin);
      const mio = !!user && v.user_id === user.id;
      for (let d = new Date(ini); d <= fin; d = addDays(d, 1)) {
        const k = format(d, "yyyy-MM-dd");
        const arr = m.get(k) ?? [];
        arr.push({
          id: v.id,
          tipo: "vacaciones",
          label: `Vacaciones ${nombrePorId(v.user_id) ?? ""}`.trim(),
          cls: "bg-slate-200 text-slate-800 border border-slate-300",
          mio,
        });
        m.set(k, arr);
      }
    }
    return m;
  }, [fechas, vacAprobadas, user]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-600" />
          <h2 className="text-lg font-semibold capitalize">
            Fechas importantes · {format(mes, "MMMM yyyy", { locale: es })}
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
      <div className="flex flex-wrap gap-2">
        <Toggle
          size="sm"
          pressed={capas.fechas}
          onPressedChange={() => toggle("fechas")}
          className="data-[state=on]:bg-amber-100 data-[state=on]:text-amber-800"
        >
          <Sparkles className="h-3.5 w-3.5 mr-1" /> Fechas importantes
        </Toggle>
        <Toggle
          size="sm"
          pressed={capas.vacaciones}
          onPressedChange={() => toggle("vacaciones")}
          className="data-[state=on]:bg-emerald-100 data-[state=on]:text-emerald-800"
        >
          <Plane className="h-3.5 w-3.5 mr-1" /> Vacaciones
        </Toggle>
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
            const eventos = porDia.get(k) ?? [];
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
                <div className={cn("text-right mb-1", esHoy && "font-bold text-amber-600")}>
                  {format(d, "d")}
                </div>
                <div className="space-y-1">
                  {eventos.map((ev) => {
                    if (!capas[ev.tipo]) return null;
                    return (
                      <span
                        key={ev.id + k}
                        className={cn(
                          "block px-1.5 py-0.5 rounded text-[10px] truncate",
                          ev.cls,
                          ev.mio && "ring-1 ring-offset-1 ring-blue-400",
                        )}
                        title={ev.label}
                      >
                        {ev.label}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}