import * as React from "react";
import { useMemo } from "react";
import { addDays, differenceInDays, format, isSameDay, parseISO, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { useMisTareas } from "@/lib/queries";
import { useTareaModal } from "@/lib/tarea-modal-context";
import { entregaPorId } from "@/lib/mock-tareas";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { EstadoVacio } from "@/components/EstadoVacio";
import { setTareaFechas, getTareaOverride, useOverrides } from "@/lib/fechas-override-store";
import { toast } from "sonner";

const N_DIAS = 14;
const DAY_W = 60;
const ROW_H = 32;

const colorEstado = (estado: string, vencida: boolean) => {
  if (vencida) return "bg-red-500";
  switch (estado) {
    case "haciendola":
      return "bg-amber-500";
    case "pausada":
    case "revision":
      return "bg-zinc-400";
    case "completada":
      return "bg-green-500/50";
    default:
      return "bg-blue-500";
  }
};

export function MisTareasTimeline() {
  useOverrides();
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
                    const ov = getTareaOverride(t.id);
                    const inicio = parseISO(ov?.fin_min ?? t.fecha_fin_min);
                    const fin = parseISO(ov?.fin_max ?? t.fecha_fin_max);
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
                          <BarraArrastrable
                            tareaId={t.id}
                            titulo={t.titulo}
                            color={colorEstado(t.estado, vencida)}
                            left={left + 3}
                            width={width}
                            inicio={inicio}
                            fin={fin}
                            onClick={() => abrir(t.id)}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
              {grupos.length === 0 && (
                <EstadoVacio
                  emoji="🌴"
                  titulo="Catorce días limpios por delante"
                  hint="No tienes tareas con fecha en las próximas 2 semanas. Buen momento para planificar."
                />
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

function BarraArrastrable({
  tareaId,
  titulo,
  color,
  left,
  width,
  inicio,
  fin,
  onClick,
}: {
  tareaId: string;
  titulo: string;
  color: string;
  left: number;
  width: number;
  inicio: Date;
  fin: Date;
  onClick: () => void;
}) {
  const [drag, setDrag] = React.useState<null | {
    mode: "move" | "left" | "right";
    startX: number;
    deltaDays: number;
    moved: boolean;
  }>(null);

  const onPointerDown = (mode: "move" | "left" | "right") => (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDrag({ mode, startX: e.clientX, deltaDays: 0, moved: false });
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag) return;
    const px = e.clientX - drag.startX;
    const d = Math.round(px / DAY_W);
    if (d !== drag.deltaDays) setDrag({ ...drag, deltaDays: d, moved: true });
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!drag) return;
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    if (!drag.moved || drag.deltaDays === 0) {
      setDrag(null);
      onClick();
      return;
    }
    const d = drag.deltaDays;
    const shift = (date: Date, n: number) =>
      format(addDays(date, n), "yyyy-MM-dd");
    if (drag.mode === "move") {
      setTareaFechas(tareaId, { fin_min: shift(inicio, d), fin_max: shift(fin, d) });
    } else if (drag.mode === "left") {
      setTareaFechas(tareaId, { fin_min: shift(inicio, d) });
    } else {
      setTareaFechas(tareaId, { fin_max: shift(fin, d) });
    }
    toast.success("Fecha actualizada", { description: titulo });
    setDrag(null);
  };

  const offset = drag ? drag.deltaDays * DAY_W : 0;
  const visualLeft =
    drag?.mode === "left" ? left + offset : drag?.mode === "right" ? left : left + offset;
  const visualWidth =
    drag?.mode === "left"
      ? Math.max(DAY_W * 0.5, width - offset)
      : drag?.mode === "right"
      ? Math.max(DAY_W * 0.5, width + offset)
      : width;

  const previewInicio = drag
    ? addDays(inicio, drag.mode === "right" ? 0 : drag.deltaDays)
    : inicio;
  const previewFin = drag
    ? addDays(fin, drag.mode === "left" ? 0 : drag.deltaDays)
    : fin;

  return (
    <Tooltip open={drag?.moved || undefined}>
      <TooltipTrigger asChild>
        <div
          className={cn(
            "absolute top-1.5 h-5 rounded-sm text-[10px] text-white px-2 truncate text-left transition-shadow group",
            color,
            drag ? "shadow-lg cursor-grabbing" : "cursor-grab hover:opacity-90",
          )}
          style={{ left: visualLeft, width: visualWidth }}
          onPointerDown={onPointerDown("move")}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        >
          {titulo}
          <span
            onPointerDown={onPointerDown("left")}
            className="absolute left-0 top-0 h-full w-1.5 cursor-ew-resize opacity-0 group-hover:opacity-100 bg-black/30 rounded-l-sm"
          />
          <span
            onPointerDown={onPointerDown("right")}
            className="absolute right-0 top-0 h-full w-1.5 cursor-ew-resize opacity-0 group-hover:opacity-100 bg-black/30 rounded-r-sm"
          />
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <div className="text-xs">
          <div className="font-semibold">{titulo}</div>
          <div>
            {format(previewInicio, "d MMM", { locale: es })} →{" "}
            {format(previewFin, "d MMM", { locale: es })}
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
