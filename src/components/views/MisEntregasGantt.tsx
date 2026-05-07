import * as React from "react";
import { useMemo } from "react";
import { addDays, differenceInDays, format, isSameDay, parseISO, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { useNavigate } from "@tanstack/react-router";
import { ENTREGAS_MOCK, clientePorId } from "@/lib/mock-tareas";
import { cn } from "@/lib/utils";
import { colorCliente } from "@/lib/cliente-colors";
import { setEntregaFechas, getEntregaOverride, useOverrides } from "@/lib/fechas-override-store";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";

const N_DIAS = 30;
const DAY_W = 28;
const ROW_H = 30;

export function MisEntregasGantt() {
  useOverrides();
  const hoy = useMemo(() => startOfDay(new Date()), []);
  const dias = useMemo(() => Array.from({ length: N_DIAS }, (_, i) => addDays(hoy, i)), [hoy]);
  const navigate = useNavigate();

  const entregas = ENTREGAS_MOCK.filter((e) => e.estado === "en_curso");
  const grupos = useMemo(() => {
    const m = new Map<string, typeof entregas>();
    for (const e of entregas) {
      const arr = m.get(e.cliente_id) ?? [];
      arr.push(e);
      m.set(e.cliente_id, arr);
    }
    return Array.from(m.entries());
  }, [entregas]);

  const urgenciaRing = (fechaFin: Date) => {
    const diff = differenceInDays(fechaFin, hoy);
    if (diff < 0) return "ring-2 ring-red-500";
    if (diff <= 3) return "ring-2 ring-amber-500";
    return "";
  };

  return (
    <TooltipProvider delayDuration={200}>
    <div className="card-soft overflow-x-auto">
      <div style={{ width: 240 + N_DIAS * DAY_W }}>
        <div className="flex border-b border-border bg-muted/30 sticky top-0 z-10">
          <div className="w-[240px] shrink-0 px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Entrega
          </div>
          <div className="flex">
            {dias.map((d) => {
              const esHoy = isSameDay(d, hoy);
              return (
                <div
                  key={d.toISOString()}
                  className={cn(
                    "text-center text-[10px] py-2 border-l border-border",
                    esHoy && "bg-blue-50 font-semibold",
                  )}
                  style={{ width: DAY_W }}
                >
                  {format(d, "d")}
                </div>
              );
            })}
          </div>
        </div>
        {grupos.map(([clienteId, ents]) => (
          <div key={clienteId} className="border-b border-border/60">
            <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider bg-muted/20 text-muted-foreground">
              {clientePorId(clienteId)?.nombre}
            </div>
            {ents.map((e) => {
              const ov = getEntregaOverride(e.id);
              const inicio = parseISO(ov?.inicio ?? e.fecha_inicio);
              const fin = parseISO(ov?.fin_max ?? e.fecha_fin);
              const startOffset = Math.max(0, differenceInDays(inicio, hoy));
              const endOffset = Math.min(N_DIAS - 1, differenceInDays(fin, hoy));
              if (endOffset < 0) return null;
              const left = 240 + startOffset * DAY_W + 2;
              const width = (endOffset - startOffset + 1) * DAY_W - 4;
              return (
                <div key={e.id} className="flex items-center relative" style={{ height: ROW_H }}>
                  <div className="w-[240px] shrink-0 px-3 text-xs truncate">{e.nombre}</div>
                  <BarraEntrega
                    entregaId={e.id}
                    titulo={e.nombre}
                    bg={colorCliente(clienteId).border}
                    text={colorCliente(clienteId).text}
                    ringClass={urgenciaRing(fin)}
                    left={left}
                    width={width}
                    inicio={inicio}
                    fin={fin}
                    onClick={() => navigate({ to: "/entregas/$id", params: { id: e.id } })}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
    </TooltipProvider>
  );
}

function BarraEntrega({
  entregaId,
  titulo,
  bg,
  text,
  ringClass,
  left,
  width,
  inicio,
  fin,
  onClick,
}: {
  entregaId: string;
  titulo: string;
  bg: string;
  text: string;
  ringClass: string;
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
    const d = Math.round((e.clientX - drag.startX) / DAY_W);
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
    const shift = (date: Date, n: number) => format(addDays(date, n), "yyyy-MM-dd");
    if (drag.mode === "move") {
      setEntregaFechas(entregaId, { inicio: shift(inicio, d), fin_max: shift(fin, d) });
    } else if (drag.mode === "left") {
      setEntregaFechas(entregaId, { inicio: shift(inicio, d) });
    } else {
      setEntregaFechas(entregaId, { fin_max: shift(fin, d) });
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

  const previewInicio = drag ? addDays(inicio, drag.mode === "right" ? 0 : drag.deltaDays) : inicio;
  const previewFin = drag ? addDays(fin, drag.mode === "left" ? 0 : drag.deltaDays) : fin;

  return (
    <Tooltip open={drag?.moved || undefined}>
      <TooltipTrigger asChild>
        <div
          className={cn(
            "absolute top-1.5 h-5 rounded-sm text-[10px] px-2 truncate text-left group font-medium",
            ringClass,
            drag ? "shadow-lg cursor-grabbing" : "cursor-grab hover:opacity-90",
          )}
          style={{ left: visualLeft, width: visualWidth, backgroundColor: bg, color: "#fff" }}
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
            {format(previewInicio, "d MMM", { locale: es })} → {format(previewFin, "d MMM", { locale: es })}
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
