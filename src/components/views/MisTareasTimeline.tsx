import { useMemo } from "react";
import { addDays, differenceInDays, format, isSameDay, parseISO, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { useMisTareas } from "@/lib/queries";
import { useTareaModal } from "@/lib/tarea-modal-context";
import { entregaPorId } from "@/lib/mock-tareas";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const N_DIAS = 14;
const DAY_W = 60;
const ROW_H = 32;

const colorEstado = (estado: string, vencida: boolean) => {
  if (vencida) return "bg-red-500";
  switch (estado) {
    case "haciendola":
      return "bg-amber-500";
    case "esperando":
      return "bg-zinc-400";
    case "completada":
      return "bg-green-500/50";
    default:
      return "bg-blue-500";
  }
};

export function MisTareasTimeline() {
  const { data: tareas = [] } = useMisTareas();
  const { abrir } = useTareaModal();

  const hoy = useMemo(() => startOfDay(new Date()), []);
  const dias = useMemo(() => Array.from({ length: N_DIAS }, (_, i) => addDays(hoy, i)), [hoy]);

  const grupos = useMemo(() => {
    const m = new Map<string, typeof tareas>();
    for (const t of tareas) {
      const k = t.entrega_id;
      const arr = m.get(k) ?? [];
      arr.push(t);
      m.set(k, arr);
    }
    return Array.from(m.entries());
  }, [tareas]);

  const totalDays = N_DIAS;

  return (
    <TooltipProvider delayDuration={200}>
      <div className="card-soft overflow-hidden">
        <div className="overflow-x-auto">
          <div style={{ width: totalDays * DAY_W + 220 }}>
            {/* Header */}
            <div className="flex border-b border-border bg-muted/30 sticky top-0 z-10">
              <div className="w-[220px] shrink-0 px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Tarea
              </div>
              <div className="flex">
                {dias.map((d) => {
                  const esHoy = isSameDay(d, hoy);
                  return (
                    <div
                      key={d.toISOString()}
                      className={cn(
                        "text-center text-[11px] py-2 border-l border-border",
                        esHoy && "bg-blue-50",
                      )}
                      style={{ width: DAY_W }}
                    >
                      <div className="text-muted-foreground uppercase">
                        {format(d, "EEEEE", { locale: es })}
                      </div>
                      <div className={cn("font-medium", esHoy && "text-blue-700")}>
                        {format(d, "d")}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Body */}
            <div className="relative">
              {/* Linea hoy */}
              <div
                className="absolute top-0 bottom-0 w-px bg-red-500/60 z-10 pointer-events-none"
                style={{ left: 220 + DAY_W / 2 }}
              />
              {grupos.map(([entregaId, ts]) => (
                <div key={entregaId} className="border-b border-border/60">
                  <div className="px-3 py-1.5 text-[11px] font-medium text-muted-foreground bg-muted/20">
                    {entregaPorId(entregaId)?.nombre ?? "Sin entrega"}
                  </div>
                  {ts.map((t) => {
                    const inicio = parseISO(t.fecha_fin_min);
                    const fin = parseISO(t.fecha_fin_max);
                    const startOffset = Math.max(0, differenceInDays(inicio, hoy));
                    const endOffset = Math.min(N_DIAS - 1, differenceInDays(fin, hoy));
                    if (endOffset < 0) return null;
                    const left = startOffset * DAY_W;
                    const width = Math.max(DAY_W * 0.7, (endOffset - startOffset + 1) * DAY_W - 6);
                    const vencida = fin < hoy;
                    return (
                      <div key={t.id} className="flex items-center" style={{ height: ROW_H }}>
                        <div className="w-[220px] shrink-0 px-3 text-xs truncate">{t.titulo}</div>
                        <div className="relative flex-1" style={{ height: ROW_H }}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => abrir(t.id)}
                                className={cn(
                                  "absolute top-1.5 h-5 rounded-sm text-[10px] text-white px-2 truncate text-left hover:opacity-90 transition",
                                  colorEstado(t.estado, vencida),
                                )}
                                style={{ left: left + 3, width }}
                              >
                                {t.titulo}
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="text-xs">
                                <div className="font-semibold">{t.titulo}</div>
                                <div>
                                  {format(inicio, "d MMM", { locale: es })} →{" "}
                                  {format(fin, "d MMM", { locale: es })}
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
              {grupos.length === 0 && (
                <div className="p-12 text-center text-sm text-muted-foreground">
                  No tienes tareas en los próximos 14 días.
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4 border-t border-border bg-muted/20 px-4 py-2 text-[11px] text-muted-foreground">
          <Legend color="bg-blue-500" label="Activa" />
          <Legend color="bg-amber-500" label="Haciéndola" />
          <Legend color="bg-zinc-400" label="Esperando" />
          <Legend color="bg-green-500/50" label="Completada" />
          <Legend color="bg-red-500" label="Vencida" />
        </div>
      </div>
    </TooltipProvider>
  );
}

const Legend = ({ color, label }: { color: string; label: string }) => (
  <span className="inline-flex items-center gap-1.5">
    <span className={cn("h-3 w-3 rounded-sm", color)} /> {label}
  </span>
);
