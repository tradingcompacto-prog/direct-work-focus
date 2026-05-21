import * as React from "react";
import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { addDays, differenceInDays, format, isSameDay, parseISO, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { useMisTareas, useTareas, useMisRevisiones, useMisPublicacionesComoTareas, type PseudoTarea } from "@/lib/queries";
import { useAuth } from "@/lib/auth";
import { useUserCaps } from "@/lib/user-caps";
import {
  AlcanceFilter,
  defaultAlcance,
  filtrarPorAlcance,
  useAlcancePersistido,
  useIncluirRevisionesPersistido,
} from "@/components/AlcanceFilter";
import { Checkbox } from "@/components/ui/checkbox";
import { useTareaModal } from "@/lib/tarea-modal-context";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { EstadoVacio } from "@/components/EstadoVacio";
import { setTareaFechas, getTareaOverride, useOverrides } from "@/lib/fechas-override-store";
import { toast } from "sonner";
import { PublicacionPanel } from "@/components/rrss/PublicacionPanel";
import { VistaHeader } from "@/components/VistaHeader";

const N_DIAS = 14;
const DAY_W = 60;
const ROW_H = 32;

const colorEstado = (estado: string, vencida: boolean) => {
  if (vencida) return "bg-red-500";
  switch (estado) {
    case "haciendola":
      return "bg-amber-500";
    case "pausada":
      return "bg-zinc-400";
    case "revision":
      return "bg-purple-500";
    case "completada":
      return "bg-green-500/50";
    default:
      return "bg-blue-500";
  }
};

export function MisTareasTimeline() {
  useOverrides();
  const { user } = useAuth();
  const caps = useUserCaps();
  const [alcance, setAlcance] = useAlcancePersistido("tareas/timeline", defaultAlcance(caps));
  const [incluirRevisiones, setIncluirRevisiones] = useIncluirRevisionesPersistido("tareas/timeline");
  const { data: misTareas = [] } = useMisTareas();
  const { data: todasTareas = [] } = useTareas();
  const { data: revisionesPM = [] } = useMisRevisiones();
  const { data: misPubs = [] } = useMisPublicacionesComoTareas();
  const [panelPubId, setPanelPubId] = React.useState<string | null>(null);

  const hoy = useMemo(() => startOfDay(new Date()), []);

  const base = useMemo(() => {
    const raw =
      alcance === "solo-mias"
        ? [...misTareas, ...misPubs]
        : filtrarPorAlcance(todasTareas, alcance, user?.id, caps.clientesPM);
    // Las vistas de trabajo activo no muestran tareas completadas.
    return raw.filter((t) => t.estado !== "completada");
  }, [alcance, misTareas, misPubs, todasTareas, user?.id, caps.clientesPM]);

  const fueraDeRango = useMemo(() => {
    const limite = addDays(hoy, N_DIAS);
    return base.filter((t) => {
      const fin = parseISO(t.fecha_fin_max);
      const inicio = parseISO(t.fecha_inicio ?? t.fecha_fin_min);
      return fin < hoy || inicio > limite;
    }).length;
  }, [base, hoy]);

  const tareas = useMemo(() => {
    if (!incluirRevisiones || !caps.isPM) return base;
    const ids = new Set(base.map((t) => t.id));
    return [...base, ...revisionesPM.filter((t) => !ids.has(t.id))];
  }, [base, incluirRevisiones, caps.isPM, revisionesPM]);
  const revisionPMIds = useMemo(
    () => new Set(revisionesPM.map((t) => t.id)),
    [revisionesPM],
  );
  const { abrir } = useTareaModal();

  const dias = useMemo(() => Array.from({ length: N_DIAS }, (_, i) => addDays(hoy, i)), [hoy]);

  const lista = useMemo(
    () =>
      [...tareas].sort(
        (a, b) =>
          parseISO(a.fecha_fin_min).getTime() - parseISO(b.fecha_fin_min).getTime(),
      ),
    [tareas],
  );

  const totalDays = N_DIAS;

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-3">
      <VistaHeader
        titulo="Mis tareas — Timeline"
        leyenda="Tareas que tengo asignadas como responsable, en formato cronológico (próximos 14 días)."
      />
      <div className="flex items-center gap-2 flex-wrap">
        <AlcanceFilter value={alcance} onChange={setAlcance} />
        {caps.isPM && (
          <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
            <Checkbox
              checked={incluirRevisiones}
              onCheckedChange={(v) => setIncluirRevisiones(!!v)}
            />
            Incluir revisiones pendientes
          </label>
        )}
      </div>
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

            {/* Banner tareas fuera de rango */}
            {fueraDeRango > 0 && (
              <div className="flex items-center justify-between bg-blue-50 border-y border-blue-100 px-4 py-2 text-xs text-blue-800">
                <span>
                  Hay {fueraDeRango} {fueraDeRango === 1 ? "tarea" : "tareas"} fuera del rango visible (próximos 14 días).
                </span>
                <Link
                  to="/tareas/tabla"
                  className="font-medium hover:underline"
                >
                  Ver en tabla →
                </Link>
              </div>
            )}

            {/* Body */}
            <div className="relative">
              {/* Linea hoy */}
              <div
                className="absolute top-0 bottom-0 w-px bg-red-500/60 z-10 pointer-events-none"
                style={{ left: 220 + DAY_W / 2 }}
              />
              {lista.map((t) => {
                const ov = getTareaOverride(t.id);
                const inicio = parseISO(ov?.fin_min ?? t.fecha_fin_min);
                const fin = parseISO(ov?.fin_max ?? t.fecha_fin_max);
                const startOffset = Math.max(0, differenceInDays(inicio, hoy));
                const endOffset = Math.min(N_DIAS - 1, differenceInDays(fin, hoy));
                if (endOffset < 0) return null;
                const left = startOffset * DAY_W;
                const width = Math.max(DAY_W * 0.7, (endOffset - startOffset + 1) * DAY_W - 6);
                const vencida = fin < hoy;
                const esDevuelta = !!t.devuelta_at;
                const esPorRevisar = incluirRevisiones && caps.isPM && revisionPMIds.has(t.id);
                return (
                  <div
                    key={t.id}
                    className={cn(
                      "flex items-center border-b border-border/40",
                      esDevuelta && "bg-orange-50/60 border-l-4 border-l-orange-500",
                      esPorRevisar && !esDevuelta && "bg-blue-50/40 border-l-4 border-l-blue-500",
                      (t as PseudoTarea).__esPub && "border-l-4 border-l-violet-500",
                    )}
                    style={{ height: ROW_H }}
                  >
                    <div className="w-[220px] shrink-0 px-3 text-xs truncate inline-flex items-center gap-1">
                      {(t as PseudoTarea).__esPub && (
                        <span className="rounded bg-violet-100 text-violet-800 px-1 py-px text-[9px] font-semibold shrink-0">
                          📱 {(t as PseudoTarea).__rolPub === "diseno" ? "Diseño" : "Copy"}
                        </span>
                      )}
                      {esDevuelta && (
                        <span className="rounded bg-orange-100 text-orange-800 px-1 py-px text-[9px] font-semibold">
                          ↩
                        </span>
                      )}
                      {esPorRevisar && !esDevuelta && (
                        <span className="rounded bg-blue-100 text-blue-800 px-1 py-px text-[9px] font-semibold">
                          👁
                        </span>
                      )}
                      <span className="truncate">{t.titulo}</span>
                    </div>
                    <div className="relative flex-1" style={{ height: ROW_H }}>
                      <BarraArrastrable
                        tareaId={t.id}
                        titulo={t.titulo}
                        color={colorEstado(t.estado, vencida)}
                        left={left + 3}
                        width={width}
                        inicio={inicio}
                        fin={fin}
                        onClick={() => {
                          const pt = t as PseudoTarea;
                          if (pt.__esPub) setPanelPubId(pt.__publicacionId);
                          else abrir(t.id);
                        }}
                      />
                    </div>
                  </div>
                );
              })}
              {lista.length === 0 && (
                fueraDeRango > 0 ? (
                  <EstadoVacio
                    emoji="📅"
                    titulo="Sin tareas en los próximos 14 días"
                    hint={`Tienes ${fueraDeRango} ${fueraDeRango === 1 ? "tarea" : "tareas"} fuera del rango visible. Vela${fueraDeRango === 1 ? "" : "s"} en la tabla.`}
                    cta={
                      <Link to="/tareas/tabla" className="text-xs font-medium text-blue-600 hover:underline">
                        Ir a la tabla →
                      </Link>
                    }
                  />
                ) : (
                  <EstadoVacio
                    emoji="🌴"
                    titulo="Catorce días limpios por delante"
                    hint="No tienes tareas con fecha en las próximas 2 semanas. Buen momento para planificar."
                  />
                )
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4 border-t border-border bg-muted/20 px-4 py-2 text-[11px] text-muted-foreground">
          <Legend color="bg-blue-500" label="Activa" />
          <Legend color="bg-amber-500" label="Haciéndola" />
          <Legend color="bg-zinc-400" label="Esperando" />
          <Legend color="bg-purple-500" label="Revisión" />
          <Legend color="bg-green-500/50" label="Completada" />
          <Legend color="bg-red-500" label="Vencida" />
        </div>
      </div>
      </div>
      <PublicacionPanel
        publicacionId={panelPubId}
        onOpenChange={(o) => !o && setPanelPubId(null)}
        onChangeId={(id) => setPanelPubId(id)}
      />
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
      const newInicio = shift(inicio, d);
      const newFinMax = shift(fin, d);
      setTareaFechas(tareaId, {
        inicio: newInicio,
        fin_min: newInicio,
        fin_max: newFinMax,
      });
    } else if (drag.mode === "left") {
      const newInicio = shift(inicio, d);
      setTareaFechas(tareaId, { inicio: newInicio, fin_min: newInicio });
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
