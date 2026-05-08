import * as React from "react";
import { Link } from "@tanstack/react-router";
import { useMisEntregas } from "@/lib/queries";
import { TAREAS_MOCK, ENTREGAS_MOCK } from "@/lib/mock-tareas";
import { ClienteLink } from "@/components/EntidadLinks";
import { AvatarStack } from "@/components/AvatarStack";
import { bordeIzqCliente, colorCliente } from "@/lib/cliente-colors";
import { Progress } from "@/components/ui/progress";
import { format, parseISO, isAfter, startOfDay, startOfWeek, startOfMonth, differenceInCalendarDays } from "date-fns";
import { es } from "date-fns/locale";
import type { Entrega } from "@/types/database";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { aplicarOverrides, moverEntrega, useEntregasOverridesVersion } from "@/lib/entregas-store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Package } from "lucide-react";
import { FiltrosBar, useFiltros } from "@/components/FiltrosBar";
import { useTareasVersion } from "@/lib/tareas-store";

const calcular = (entrega: Entrega) => {
  const ts = TAREAS_MOCK.filter((t) => t.entrega_id === entrega.id);
  const cerradas = ts.filter((t) => t.estado === "completada").length;
  return {
    total: ts.length,
    cerradas,
    pct: ts.length ? Math.round((cerradas / ts.length) * 100) : 0,
    responsables: Array.from(new Set(ts.map((t) => t.responsable_id))),
  };
};

type ColId = "en_curso" | "hoy" | "semana" | "mes";

export function MisEntregasKanban() {
  useTareasVersion();
  useEntregasOverridesVersion(); // re-render on changes
  const hoy = startOfDay(new Date());
  const inicioSemana = startOfWeek(hoy, { weekStartsOn: 1 });
  const inicioMes = startOfMonth(hoy);
  const { data = [] } = useMisEntregas();
  const fuente = data.length ? data : ENTREGAS_MOCK;
  const todasSinFiltrar = aplicarOverrides(fuente);
  const [f, setF, resetF] = useFiltros("sa.filtros.entregasKanban");
  const todas = todasSinFiltrar.filter((e) => {
    if (f.q && !e.nombre.toLowerCase().includes(f.q.toLowerCase())) return false;
    if (f.cliente && e.cliente_id !== f.cliente) return false;
    if (f.responsable && e.pm_id !== f.responsable) return false;
    return true;
  });

  const enCurso = todas.filter((e) => e.estado === "en_curso");
  const cerradas = todas.filter((e) => e.estado === "cerrada" && e.fecha_cierre);
  const cerradasHoy = cerradas.filter((e) => parseISO(e.fecha_cierre!).toDateString() === hoy.toDateString());
  const cerradasSemana = cerradas.filter(
    (e) => isAfter(parseISO(e.fecha_cierre!), inicioSemana) && !cerradasHoy.includes(e),
  );
  const cerradasMes = cerradas.filter(
    (e) =>
      isAfter(parseISO(e.fecha_cierre!), inicioMes) &&
      !cerradasHoy.includes(e) &&
      !cerradasSemana.includes(e),
  );

  const cols: { id: ColId; titulo: string; items: Entrega[]; color: string }[] = [
    { id: "en_curso", titulo: "En curso", items: enCurso, color: "border-t-blue-500" },
    { id: "hoy", titulo: "Cerradas hoy", items: cerradasHoy, color: "border-t-green-500" },
    { id: "semana", titulo: "Cerradas esta semana", items: cerradasSemana, color: "border-t-zinc-400" },
    { id: "mes", titulo: "Cerradas este mes", items: cerradasMes, color: "border-t-zinc-300" },
  ];

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const activeEntrega = activeId ? todas.find((e) => e.id === activeId) : null;

  const onDragStart = (e: DragStartEvent) => setActiveId(String(e.active.id));
  const onDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    const id = String(e.active.id);
    const dest = e.over?.id as ColId | undefined;
    if (!dest) return;
    const entrega = todas.find((x) => x.id === id);
    if (!entrega) return;
    const yaEstaba =
      (dest === "en_curso" && entrega.estado === "en_curso") ||
      (dest === "hoy" && cerradasHoy.includes(entrega)) ||
      (dest === "semana" && cerradasSemana.includes(entrega)) ||
      (dest === "mes" && cerradasMes.includes(entrega));
    if (yaEstaba) return;
    moverEntrega(id, dest);
    toast.success(
      dest === "en_curso" ? `${entrega.nombre} reabierta` : `${entrega.nombre} marcada como cerrada`,
    );
  };

  return (
    <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <div className="space-y-4">
        <FiltrosBar
          state={f}
          onChange={setF}
          onReset={resetF}
          placeholder="Buscar entregas…"
        />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {cols.map((col) => (
          <Columna key={col.id} col={col} />
        ))}
      </div>
      </div>
      <DragOverlay>{activeEntrega && <TarjetaEntrega entrega={activeEntrega} overlay />}</DragOverlay>
    </DndContext>
  );
}

function Columna({ col }: { col: { id: ColId; titulo: string; items: Entrega[]; color: string } }) {
  const { setNodeRef, isOver } = useDroppable({ id: col.id });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "card-soft border-t-4 transition-colors",
        col.color,
        isOver && "ring-2 ring-blue-400 ring-offset-2 bg-blue-50/40",
      )}
    >
      <div className="px-3 py-2 border-b border-border text-sm font-semibold flex items-center justify-between">
        <span>{col.titulo}</span>
        <span className="text-muted-foreground text-xs">{col.items.length}</span>
      </div>
      <div className="p-2 space-y-2 min-h-[160px]">
        {col.items.length === 0 ? (
          <div className="text-center text-xs text-muted-foreground py-8 px-2">
            <Package className="h-6 w-6 mx-auto mb-2 opacity-30" />
            {col.id === "en_curso"
              ? "Sin entregas en curso 🌱"
              : "Nada todavía. Arrastra una entrega aquí."}
          </div>
        ) : (
          col.items.map((e) => <TarjetaDraggable key={e.id} entrega={e} />)
        )}
      </div>
    </div>
  );
}

function TarjetaDraggable({ entrega }: { entrega: Entrega }) {
  const { setNodeRef, listeners, attributes, isDragging } = useDraggable({ id: entrega.id });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn("touch-none", isDragging && "opacity-30")}
    >
      <TarjetaEntrega entrega={entrega} />
    </div>
  );
}

function TarjetaEntrega({ entrega: e, overlay }: { entrega: Entrega; overlay?: boolean }) {
  const m = calcular(e);
  return (
    <Link
      to="/entregas/$id"
      params={{ id: e.id }}
      onClick={(ev) => overlay && ev.preventDefault()}
      className={cn(
        "block card-soft p-3 hover:shadow-md transition border-l-4",
        overlay && "shadow-xl rotate-1 cursor-grabbing",
      )}
      style={bordeIzqCliente(e.cliente_id)}
    >
      <div className="text-sm font-medium">{e.nombre}</div>
      <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full inline-block" style={{ backgroundColor: colorCliente(e.cliente_id).border }} />
        <ClienteLink id={e.cliente_id} />
      </div>
      <div className="mt-2">
        <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
          <span>✓ {m.cerradas} / {m.total}</span>
          <span>{m.pct}%</span>
        </div>
        <Progress value={m.pct} className="h-1.5" />
      </div>
      <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
        <DiasRestantes fecha={e.fecha_fin} />
        <AvatarStack ids={m.responsables} size="xs" />
      </div>
    </Link>
  );
}

function DiasRestantes({ fecha }: { fecha: string }) {
  const d = parseISO(fecha);
  const diff = differenceInCalendarDays(d, startOfDay(new Date()));
  let cls = "bg-green-100 text-green-700";
  if (diff < 0) cls = "bg-red-100 text-red-700";
  else if (diff <= 5) cls = "bg-amber-100 text-amber-700";
  const label = diff < 0 ? `vencida ${Math.abs(diff)}d` : diff === 0 ? "hoy" : `en ${diff}d`;
  return (
    <span className={`px-1.5 py-0.5 rounded font-medium ${cls}`}>
      {format(d, "d MMM", { locale: es })} · {label}
    </span>
  );
}
