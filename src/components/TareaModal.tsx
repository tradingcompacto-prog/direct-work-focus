import * as React from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { X, Maximize2, Minimize2, Play, Pause, Check, Paperclip, Clock } from "lucide-react";
import { useTareaModal } from "@/lib/tarea-modal-context";
import {
  tareaPorId,
  clientePorId,
  proyectoPorId,
  entregaPorId,
  ACTIVIDAD_MOCK,
  TAREAS_MOCK,
  tituloTarea,
} from "@/lib/mock-tareas";
import { useComentarios } from "@/lib/queries";
import { miembroPorId, nombrePorId } from "@/lib/equipo";
import { tiempoRelativo } from "@/lib/fechas";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CerrarTareaDialog } from "@/components/CerrarTareaDialog";
import { estimarTarea } from "@/lib/estimacion";
import { useTimer, empezar, pausar, formatearMs } from "@/lib/timer-store";
import {
  setEstadoTarea,
  marcarParaRevisar,
  devolverAResponsable,
  completarTarea,
  reasignarTarea,
} from "@/lib/tareas-store";
import { useRolVista } from "@/lib/rol-vista";
import { ReasignarTareaDialog } from "@/components/ReasignarTareaDialog";
import { Send, UserCog, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import {
  setTareaFechas,
  getTareaOverride,
  useOverrides,
} from "@/lib/fechas-override-store";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";

const estadoColor: Record<string, string> = {
  activa: "bg-blue-100 text-blue-800 border-blue-200",
  haciendola: "bg-amber-100 text-amber-800 border-amber-200",
  pausada: "bg-zinc-100 text-zinc-700 border-zinc-200",
  revision: "bg-purple-100 text-purple-800 border-purple-200",
  completada: "bg-green-100 text-green-800 border-green-200",
};
const estadoLabel: Record<string, string> = {
  activa: "Activa",
  haciendola: "Haciéndola",
  pausada: "Pausada",
  revision: "En revisión",
  completada: "Completada",
};

export function TareaModal() {
  const { tareaId, expandido, cerrar, toggleExpandido } = useTareaModal();
  useOverrides();
  const tarea = tareaId ? tareaPorId(tareaId) : undefined;
  const [cerrandoOpen, setCerrandoOpen] = React.useState(false);
  const [reasignarOpen, setReasignarOpen] = React.useState(false);
  const timer = useTimer(tareaId);
  const [rolVista] = useRolVista();
  const esPmODirector = rolVista === "pm" || rolVista === "director";

  React.useEffect(() => {
    if (!tareaId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") cerrar();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tareaId, cerrar]);

  if (!tareaId || !tarea) return null;

  const ov = getTareaOverride(tarea.id);
  const fInicio = ov?.fin_min ?? tarea.fecha_inicio;
  const fFinMin = ov?.fin_min ?? tarea.fecha_fin_min;
  const fFinMax = ov?.fin_max ?? tarea.fecha_fin_max;

  const cliente = clientePorId(tarea.cliente_id);
  const proyecto = proyectoPorId(tarea.proyecto_id);
  const entrega = entregaPorId(tarea.entrega_id);
  const responsable = miembroPorId(tarea.responsable_id);
  const solicitante = miembroPorId(tarea.solicitante_id);
  const { data: comentarios = [] } = useComentarios(tarea.id);
  const actividad = ACTIVIDAD_MOCK.filter((a) => a.tarea_id === tarea.id);
  const estim = estimarTarea(tarea, TAREAS_MOCK);
  const horasEstim = tarea.horas_estimadas ?? estim?.horas ?? null;
  const horasTimer = timer.ms > 0 ? Math.round((timer.ms / 3600000) * 10) / 10 : null;
  const sugeridaCerrar = horasTimer ?? horasEstim;
  const enRevision = tarea.estado === "revision";

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div
        onClick={cerrar}
        className="absolute inset-0 bg-foreground/60 transition-opacity duration-200"
      />
      {/* Panel */}
      <aside
        className={cn(
          "absolute top-0 right-0 h-full bg-background shadow-2xl flex flex-col animate-in slide-in-from-right duration-200",
          expandido ? "w-full" : "w-full max-w-[480px]",
        )}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <nav className="flex items-center gap-1 text-xs min-w-0 text-muted-foreground">
            {cliente && (
              <Link
                to="/clientes/$id"
                params={{ id: cliente.id }}
                onClick={cerrar}
                className="hover:text-foreground truncate"
              >
                {cliente.nombre}
              </Link>
            )}
            {proyecto && cliente && proyecto.nombre !== cliente.nombre && (
              <>
                <span>›</span>
                <Link
                  to="/proyectos/$id"
                  params={{ id: proyecto.id }}
                  onClick={cerrar}
                  className="hover:text-foreground truncate"
                >
                  {proyecto.nombre}
                </Link>
              </>
            )}
            {entrega && (
              <>
                <span>›</span>
                <Link
                  to="/entregas/$id"
                  params={{ id: entrega.id }}
                  onClick={cerrar}
                  className="hover:text-foreground truncate"
                >
                  {entrega.nombre}
                </Link>
              </>
            )}
          </nav>
          <div className="flex items-center gap-1">
            <button
              onClick={toggleExpandido}
              className="h-8 w-8 inline-flex items-center justify-center rounded hover:bg-muted"
              aria-label="Expandir"
            >
              {expandido ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
            <button
              onClick={cerrar}
              className="h-8 w-8 inline-flex items-center justify-center rounded hover:bg-muted"
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className={cn("flex-1 overflow-y-auto", expandido && "max-w-3xl mx-auto w-full")}>
          <div className="p-5 space-y-6">
            {/* Título + estado */}
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-xl font-semibold leading-snug">{tarea.titulo}</h2>
              <Badge variant="outline" className={cn("shrink-0", estadoColor[tarea.estado])}>
                {estadoLabel[tarea.estado]}
              </Badge>
            </div>

            {/* Bloque revisión: 3 botones (solo PM/Director ven y actúan) */}
            {enRevision && esPmODirector && (
              <div className="rounded-lg border border-purple-200 bg-purple-50/50 p-3 space-y-2">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-purple-700">
                  🔍 Esta tarea está pendiente de revisión
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
                    onClick={() => {
                      devolverAResponsable(tarea.id);
                      toast.success(`✓ Tarea devuelta a ${nombrePorId(tarea.responsable_id)}`);
                    }}
                  >
                    <Send className="h-3.5 w-3.5" /> Volver a enviar
                  </Button>
                  <Button
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700 text-white gap-1.5"
                    onClick={() => setReasignarOpen(true)}
                  >
                    <UserCog className="h-3.5 w-3.5" /> Reasignar
                  </Button>
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                    onClick={() => {
                      completarTarea(tarea.id);
                      toast.success("✓ Tarea cerrada");
                      cerrar();
                    }}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Completar
                  </Button>
                </div>
              </div>
            )}

            {/* Acciones */}
            {!enRevision && <div className="flex gap-2 flex-wrap">
              {timer.corriendo ? (
                <Button
                  size="sm"
                  variant="secondary"
                  className="gap-1.5"
                  onClick={() => {
                    pausar(tarea.id);
                    setEstadoTarea(tarea.id, "pausada");
                    toast(`«${tarea.titulo}» en pausa`, {
                      description: `Llevas ${formatearMs(timer.ms)} acumulados`,
                    });
                  }}
                >
                  <Pause className="h-3.5 w-3.5" /> Pausar
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="gap-1.5"
                  onClick={() => {
                    empezar(tarea.id);
                    setEstadoTarea(tarea.id, "haciendola");
                    toast.success(
                      timer.ms > 0
                        ? `«${tarea.titulo}» reanudada`
                        : `«${tarea.titulo}» en marcha 🚀`,
                    );
                  }}
                >
                  <Play className="h-3.5 w-3.5" />{" "}
                  {timer.ms > 0 ? "Reanudar" : "Empezar"}
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 border-purple-300 text-purple-700 hover:bg-purple-50"
                onClick={() => {
                  marcarParaRevisar(tarea.id);
                  toast.success("✅ Marcada para revisar", {
                    description: "El PM la revisará en su bandeja",
                  });
                  cerrar();
                }}
              >
                <Check className="h-3.5 w-3.5" /> Marcar para revisar
              </Button>
              {esPmODirector && (
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                onClick={() => setCerrandoOpen(true)}
              >
                <Check className="h-3.5 w-3.5" /> Marcar hecha
              </Button>
              )}
              {timer.ms > 0 && (
                <div
                  className={cn(
                    "ml-auto inline-flex items-center gap-1.5 px-2.5 rounded-md text-xs font-medium tabular-nums",
                    timer.corriendo
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-zinc-100 text-zinc-700",
                  )}
                  title={timer.corriendo ? "Cronómetro corriendo" : "En pausa"}
                >
                  <Clock className="h-3.5 w-3.5" />
                  {formatearMs(timer.ms)}
                </div>
              )}
            </div>}

            <Section title="Asignación">
              <Persona label="Responsable" id={responsable?.id} />
              <Persona label="Solicitante" id={solicitante?.id} />
            </Section>

            <Section title="Fechas">
              <EditableDate
                label="Inicio"
                valueIso={fInicio}
                onChange={(iso) => {
                  setTareaFechas(tarea.id, { fin_min: iso });
                  toast.success("Fecha de inicio actualizada");
                }}
              />
              <EditableDate
                label="Entrega"
                valueIso={fFinMax}
                onChange={(iso) => {
                  setTareaFechas(tarea.id, { fin_max: iso });
                  toast.success("Fecha de entrega actualizada");
                }}
              />
            </Section>

            {(horasEstim != null || tarea.horas_reales != null) && (
              <Section title="Tiempo" icon={<Clock className="h-3.5 w-3.5" />}>
                <div className="flex gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Estimado:</span>{" "}
                    {horasEstim != null ? (
                      <span className="font-medium">{horasEstim}h</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                    {estim && tarea.horas_estimadas == null && (
                      <span
                        className={cn(
                          "ml-1.5 text-[10px] px-1.5 py-0.5 rounded",
                          estim.confianza === "alta"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700",
                        )}
                      >
                        auto · {estim.muestras} ref.
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Real:</span>{" "}
                    {tarea.horas_reales != null ? (
                      <span className="font-medium">{tarea.horas_reales}h</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </div>
                </div>
              </Section>
            )}

            {tarea.descripcion && (
              <Section title="Descripción">
                <p className="text-sm text-foreground whitespace-pre-wrap">{tarea.descripcion}</p>
              </Section>
            )}

            <Section title="Archivos (Drive)" icon={<Paperclip className="h-3.5 w-3.5" />}>
              <div className="grid grid-cols-3 gap-2">
                <div className="aspect-square rounded-md bg-muted flex items-center justify-center text-xs text-muted-foreground">
                  IMG
                </div>
                <div className="aspect-square rounded-md bg-muted flex items-center justify-center text-xs text-muted-foreground">
                  PDF
                </div>
                <button className="aspect-square rounded-md border border-dashed border-border text-xs text-muted-foreground hover:bg-muted/50">
                  + Subir
                </button>
              </div>
            </Section>

            <Section title={`Comentarios (${comentarios.length})`}>
              {comentarios.length === 0 && (
                <p className="text-sm text-muted-foreground">Sin comentarios</p>
              )}
              <div className="space-y-3">
                {comentarios.map((c) => (
                  <div key={c.id} className="text-sm">
                    <div className="text-xs text-muted-foreground">
                      {nombrePorId(c.autor_id)} · {tiempoRelativo(c.fecha)}
                    </div>
                    <div>{c.texto}</div>
                  </div>
                ))}
              </div>
              <button className="mt-2 text-xs text-muted-foreground hover:text-foreground">
                + Añadir comentario
              </button>
            </Section>

            <Section title="Actividad">
              {actividad.length === 0 && (
                <p className="text-sm text-muted-foreground">Sin actividad reciente</p>
              )}
              <ul className="space-y-1.5 text-sm">
                {actividad.map((a) => (
                  <li key={a.id} className="text-muted-foreground">
                    {a.texto} · {tiempoRelativo(a.fecha)}
                  </li>
                ))}
              </ul>
            </Section>
          </div>
        </div>
      </aside>
      <CerrarTareaDialog
        open={cerrandoOpen}
        onOpenChange={setCerrandoOpen}
        tarea={tarea}
        sugerida={sugeridaCerrar}
      />
      <ReasignarTareaDialog
        open={reasignarOpen}
        onOpenChange={setReasignarOpen}
        tarea={tarea}
        onDone={() => cerrar()}
      />
    </div>
  );
}

function Section({
  title,
  children,
  icon,
}: {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
        {icon}
        {title}
      </div>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-sm flex gap-2">
      <span className="text-muted-foreground w-20">{label}:</span>
      <span>{value}</span>
    </div>
  );
}

function Persona({ label, id }: { label: string; id?: string }) {
  if (!id) return null;
  const m = miembroPorId(id);
  if (!m) return null;
  return (
    <div className="text-sm flex gap-2 items-center">
      <span className="text-muted-foreground w-20">{label}:</span>
      <Link
        to="/personas/$id"
        params={{ id }}
        className="inline-flex items-center gap-1.5 hover:underline"
      >
        <Avatar className="h-5 w-5">
          <AvatarFallback className="text-[9px] bg-secondary">{m.iniciales}</AvatarFallback>
        </Avatar>
        {m.nombre}
      </Link>
    </div>
  );
}

function EditableDate({
  label,
  valueIso,
  onChange,
}: {
  label: string;
  valueIso: string;
  onChange: (iso: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const date = parseISO(valueIso);
  return (
    <div className="text-sm flex gap-2 items-center">
      <span className="text-muted-foreground w-20">{label}:</span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-muted text-sm">
            <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
            {format(date, "d MMM yyyy", { locale: es })}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(d) => {
              if (!d) return;
              const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
              onChange(iso);
              setOpen(false);
            }}
            initialFocus
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
