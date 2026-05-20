import { createFileRoute, Link } from "@tanstack/react-router";
import * as React from "react";
import {
  entregaPorId,
  clientePorId,
  proyectoPorId,
  TAREAS_MOCK,
  ACTIVIDAD_MOCK,
} from "@/lib/mock-tareas";
import { miembroPorId } from "@/lib/equipo";
import { PersonaChip } from "@/components/PersonaChip";
import { Button } from "@/components/ui/button";
import { useCrearModal } from "@/lib/crear-modal-context";
import { useTareaModal } from "@/lib/tarea-modal-context";
import { Plus, Paperclip, CheckCircle2, Calendar, Users, Activity, FileText } from "lucide-react";
import { format, parseISO, differenceInCalendarDays } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { colorCliente, bordeIzqCliente } from "@/lib/cliente-colors";
import { tiempoRelativo, urgenciaTarea, etiquetaFechaRelativa } from "@/lib/fechas";
import { cn } from "@/lib/utils";
import {
  setEntregaFechas,
  getEntregaOverride,
  useOverrides,
} from "@/lib/fechas-override-store";
import {
  aplicarOverrides,
  cerrarEntrega,
  reabrirEntrega,
  useEntregasOverridesVersion,
} from "@/lib/entregas-store";
import { labelCategoria, colorCategoria } from "@/lib/categorias";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as DayCalendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { useTareasVersion } from "@/lib/tareas-store";
import { PlanRRSS } from "@/components/PlanRRSS";
import { supabase } from "@/lib/supabase";
import { invalidateKeys } from "@/lib/qc";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/entregas/$id")({
  component: FichaEntrega,
  validateSearch: (search: Record<string, unknown>): { pub?: string } => ({
    pub: typeof search.pub === "string" ? search.pub : undefined,
  }),
});

const estadoTareaCls: Record<string, string> = {
  activa: "bg-blue-100 text-blue-800 border-blue-200",
  haciendola: "bg-amber-100 text-amber-800 border-amber-200",
  esperando: "bg-zinc-100 text-zinc-700 border-zinc-200",
  completada: "bg-green-100 text-green-800 border-green-200",
};

function FichaEntrega() {
  const { id } = Route.useParams();
  const { pub } = Route.useSearch();
  useOverrides();
  useTareasVersion();
  useEntregasOverridesVersion();
  const eBase = entregaPorId(id);
  const e = eBase ? aplicarOverrides([eBase])[0] : undefined;
  const { abrir } = useCrearModal();
  const { abrir: abrirTarea } = useTareaModal();
  const [tab, setTab] = React.useState("resumen");

  React.useEffect(() => {
    if (pub) setTab("plan");
  }, [pub]);

  if (!e) {
    return (
      <div className="p-6">
        <div className="text-muted-foreground">Entrega no encontrada</div>
        <Link to="/entregas/kanban" className="text-sm text-blue-600 hover:underline">← Volver</Link>
      </div>
    );
  }

  const cli = clientePorId(e.cliente_id);
  const pry = proyectoPorId(e.proyecto_id);
  const pm = miembroPorId(e.pm_id);
  const tareas = TAREAS_MOCK.filter((t) => t.entrega_id === e.id);
  const cerradas = tareas.filter((t) => t.estado === "completada");
  const abiertas = tareas.filter((t) => t.estado !== "completada");
  const pct = tareas.length ? Math.round((cerradas.length / tareas.length) * 100) : 0;
  const equipo = Array.from(new Set(tareas.map((t) => t.responsable_id)));
  const ov = getEntregaOverride(e.id);
  const fInicio = ov?.inicio ?? e.fecha_inicio;
  const fFin = ov?.fin_max ?? e.fecha_fin;
  const dias = differenceInCalendarDays(parseISO(fFin), new Date());
  const actividad = ACTIVIDAD_MOCK.filter((a) => a.entrega_id === e.id || tareas.some((t) => t.id === a.tarea_id));
  const color = colorCliente(e.cliente_id);

  return (
    <div className="p-6 space-y-6 anim-in max-w-6xl">
      {/* Header */}
      <header className="card-soft p-5 border-l-4" style={bordeIzqCliente(e.cliente_id)}>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              {cli && (
                <Link to="/clientes/$id" params={{ id: cli.id }} className="hover:text-foreground inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color.border }} />
                  {cli.nombre}
                </Link>
              )}
              {pry && cli && pry.nombre !== cli.nombre && (
                <>
                  <span>›</span>
                  <Link to="/proyectos/$id" params={{ id: pry.id }} className="hover:text-foreground">{pry.nombre}</Link>
                </>
              )}
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">{e.nombre}</h1>
            <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground flex-wrap">
              <Badge variant={e.estado === "completada" ? "secondary" : "default"}>
                {e.estado === "en_curso" ? "En curso" : "Cerrada"}
              </Badge>
              {e.categoria && (
                <span className={cn("inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium border", colorCategoria[e.categoria].badge)}>
                  <span className={cn("h-1.5 w-1.5 rounded-full", colorCategoria[e.categoria].dot)} />
                  {labelCategoria(e.categoria)}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <EditableDateChip
                  iso={fInicio}
                  onChange={(iso) => {
                    setEntregaFechas(e.id, { inicio: iso });
                    toast.success("Inicio actualizado");
                  }}
                />
                →
                <EditableDateChip
                  iso={fFin}
                  onChange={(iso) => {
                    setEntregaFechas(e.id, { fin_max: iso });
                    toast.success("Entrega actualizada");
                  }}
                />
              </span>
              {e.estado === "en_curso" && (
                <span className={cn(
                  "px-1.5 py-0.5 rounded text-xs font-medium",
                  dias < 0 ? "bg-red-100 text-red-700" : dias <= 5 ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700",
                )}>
                  {dias < 0 ? `vencida ${Math.abs(dias)}d` : dias === 0 ? "vence hoy" : `en ${dias}d`}
                </span>
              )}
              {pm && (
                <span className="inline-flex items-center gap-1.5">
                  PM: <PersonaChip id={pm.id} size="xs" />
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              onClick={() => {
                if (e.estado === "completada") {
                  reabrirEntrega(e.id);
                  toast.success("Entrega reabierta automáticamente al añadir tarea");
                }
                abrir("tarea", { cliente_id: e.cliente_id, proyecto_id: e.proyecto_id, entrega_id: e.id });
              }}
            >
              <Plus className="h-4 w-4 mr-1" /> Tarea
            </Button>
            {e.estado === "en_curso" ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                cerrarEntrega(e.id);
                toast.success("Entrega cerrada");
              }}
            >
              <CheckCircle2 className="h-4 w-4 mr-1" /> Cerrar entrega
            </Button>
            ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                reabrirEntrega(e.id);
                toast.success("Entrega reabierta");
              }}
            >
              Reabrir
            </Button>
            )}
          </div>
        </div>

        {/* Progreso */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>{cerradas.length} de {tareas.length} tareas hechas</span>
            <span className="font-medium">{pct}%</span>
          </div>
          <Progress value={pct} className="h-2" />
        </div>
      </header>

      {/* Mini stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Tareas abiertas" value={abiertas.length} />
        <Stat label="Tareas cerradas" value={cerradas.length} />
        <Stat label="En riesgo" value={abiertas.filter((t) => urgenciaTarea(t.fecha_fin_min, t.fecha_fin_max) === "rojo").length} tone="rojo" />
        <Stat label="Equipo" value={equipo.length} />
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="resumen">Resumen</TabsTrigger>
          <TabsTrigger value="tareas">Tareas ({abiertas.length})</TabsTrigger>
          {e.categoria === "redes_sociales" && (
            <TabsTrigger value="plan">Plan de contenido</TabsTrigger>
          )}
          <TabsTrigger value="equipo">Equipo ({equipo.length})</TabsTrigger>
          <TabsTrigger value="archivos">Archivos</TabsTrigger>
          <TabsTrigger value="actividad">Actividad</TabsTrigger>
        </TabsList>

        {/* Resumen */}
        <TabsContent value="resumen" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card titulo="Próximas tareas" icon={<CheckCircle2 className="h-3.5 w-3.5" />}>
              {abiertas.length === 0 ? (
                <Vacio msg="Sin tareas abiertas 🎉" />
              ) : (
                <div className="space-y-1.5">
                  {abiertas.slice(0, 5).map((t) => (
                    <FilaTarea key={t.id} t={t} onClick={() => abrirTarea(t.id)} />
                  ))}
                </div>
              )}
            </Card>
            <Card titulo="Urgencia" icon={<Activity className="h-3.5 w-3.5" />}>
              {abiertas.filter((t) => urgenciaTarea(t.fecha_fin_min, t.fecha_fin_max) === "rojo").length === 0 ? (
                <Vacio msg="Nada urgente ✨" />
              ) : (
                <div className="space-y-1.5">
                  {abiertas
                    .filter((t) => urgenciaTarea(t.fecha_fin_min, t.fecha_fin_max) === "rojo")
                    .map((t) => <FilaTarea key={t.id} t={t} onClick={() => abrirTarea(t.id)} />)}
                </div>
              )}
            </Card>
          </div>
        </TabsContent>

        {/* Tareas */}
        <TabsContent value="tareas" className="space-y-4">
          <Card titulo={`Abiertas (${abiertas.length})`}>
            {abiertas.length === 0 ? (
              <Vacio msg="Todo cerrado 👌" />
            ) : (
              <div className="space-y-1">
                {abiertas.map((t) => <FilaTarea key={t.id} t={t} onClick={() => abrirTarea(t.id)} detallada />)}
              </div>
            )}
          </Card>
          {cerradas.length > 0 && (
            <details className="card-soft p-4">
              <summary className="text-sm font-semibold cursor-pointer text-muted-foreground hover:text-foreground">
                Cerradas ({cerradas.length})
              </summary>
              <div className="mt-3 space-y-1">
                {cerradas.map((t) => <FilaTarea key={t.id} t={t} onClick={() => abrirTarea(t.id)} />)}
              </div>
            </details>
          )}
        </TabsContent>

        {/* Plan de contenido (solo redes_sociales) */}
        {e.categoria === "redes_sociales" && (
          <TabsContent value="plan">
            <PlanRRSSTab entrega={e} tareas={tareas} />
          </TabsContent>
        )}

        {/* Equipo */}
        <TabsContent value="equipo">
          <Card titulo="Personas asignadas" icon={<Users className="h-3.5 w-3.5" />}>
            {equipo.length === 0 ? (
              <Vacio msg="Sin personas asignadas" />
            ) : (
              <div className="grid sm:grid-cols-2 gap-2">
                {equipo.map((pid) => {
                  const m = miembroPorId(pid);
                  if (!m) return null;
                  const ts = tareas.filter((t) => t.responsable_id === pid);
                  const ab = ts.filter((t) => t.estado !== "completada").length;
                  return (
                    <Link key={pid} to="/personas/$id" params={{ id: pid }}
                      className="card-soft p-3 hover:bg-muted/30 flex items-center justify-between">
                      <PersonaChip id={pid} size="sm" />
                      <span className="text-xs text-muted-foreground">
                        {ab} abierta{ab !== 1 && "s"} · {ts.length} total
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Archivos */}
        <TabsContent value="archivos">
          <Card titulo="Archivos" icon={<Paperclip className="h-3.5 w-3.5" />}>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="aspect-square rounded-md bg-muted flex flex-col items-center justify-center text-xs text-muted-foreground">
                  <FileText className="h-5 w-5 mb-1 opacity-60" />
                  Archivo {i}
                </div>
              ))}
              <button className="aspect-square rounded-md border border-dashed border-border text-xs text-muted-foreground hover:bg-muted/40">
                + Subir
              </button>
            </div>
          </Card>
        </TabsContent>

        {/* Actividad */}
        <TabsContent value="actividad">
          <Card titulo="Actividad reciente" icon={<Activity className="h-3.5 w-3.5" />}>
            {actividad.length === 0 ? (
              <Vacio msg="Sin actividad todavía" />
            ) : (
              <ul className="space-y-2">
                {actividad.map((a) => (
                  <li key={a.id} className="text-sm flex justify-between gap-2">
                    <span>{a.texto}</span>
                    <span className="text-xs text-muted-foreground shrink-0">{tiempoRelativo(a.fecha)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: "rojo" }) {
  return (
    <div className="card-soft p-3">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={cn("text-2xl font-semibold tabular-nums mt-0.5", tone === "rojo" && value > 0 && "text-red-600")}>
        {value}
      </div>
    </div>
  );
}

function Card({ titulo, icon, children }: { titulo: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="card-soft p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
        {icon}{titulo}
      </h3>
      {children}
    </div>
  );
}

function Vacio({ msg }: { msg: string }) {
  return <div className="text-sm text-muted-foreground py-6 text-center">{msg}</div>;
}

function FilaTarea({ t, onClick, detallada }: { t: typeof TAREAS_MOCK[number]; onClick: () => void; detallada?: boolean }) {
  const u = urgenciaTarea(t.fecha_fin_min, t.fecha_fin_max);
  return (
    <button
      onClick={onClick}
      className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted/40 transition"
    >
      <Badge variant="outline" className={cn("text-[10px] shrink-0", estadoTareaCls[t.estado])}>{t.estado}</Badge>
      <span className="text-sm flex-1 truncate">{t.titulo}</span>
      {detallada && <PersonaChip id={t.responsable_id} size="xs" showName={false} />}
      <span className={cn(
        "text-[10px] tabular-nums px-1.5 py-0.5 rounded shrink-0",
        u === "rojo" && "bg-red-100 text-red-700",
        u === "amarillo" && "bg-amber-100 text-amber-700",
        u === "azul" && "bg-blue-100 text-blue-700",
        u === "neutro" && "bg-muted text-muted-foreground",
      )}>{etiquetaFechaRelativa(t.fecha_fin_max)}</span>
    </button>
  );
}

function EditableDateChip({ iso, onChange }: { iso: string; onChange: (iso: string) => void }) {
  const [open, setOpen] = React.useState(false);
  const date = parseISO(iso);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="px-1.5 py-0.5 rounded hover:bg-muted text-foreground/80">
          {format(date, "d MMM", { locale: es })}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <DayCalendar
          mode="single"
          selected={date}
          onSelect={(d) => {
            if (!d) return;
            const out = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
            onChange(out);
            setOpen(false);
          }}
          initialFocus
          className={cn("p-3 pointer-events-auto")}
        />
      </PopoverContent>
    </Popover>
  );
}

// ----- Plan RRSS: resuelve la tarea sombrilla o ofrece crearla -----
function PlanRRSSTab({
  entrega,
  tareas,
}: {
  entrega: { id: string; nombre: string; cliente_id: string; pm_id: string; fecha_inicio: string; fecha_fin: string };
  tareas: Array<{ id: string; titulo: string; responsable_id: string }>;
}) {
  const { user } = useAuth();
  // Convención: la tarea sombrilla tiene título que empieza por "Plan ".
  const sombrilla =
    tareas.find((t) => /^plan\b/i.test(t.titulo)) ?? tareas[0];

  const [creando, setCreando] = React.useState(false);

  const crearSombrilla = async () => {
    if (!user) return;
    setCreando(true);
    try {
      const titulo = `Plan de contenido · ${entrega.nombre}`;
      const { error } = await supabase.from("tareas").insert({
        titulo,
        entrega_id: entrega.id,
        responsable_id: entrega.pm_id ?? user.id,
        solicitante_id: user.id,
        estado: "activa",
        prioridad: "media",
        fecha_inicio: entrega.fecha_inicio,
        fecha_fin_min: entrega.fecha_fin,
        fecha_fin_max: entrega.fecha_fin,
      });
      if (error) throw error;
      invalidateKeys(["tareas"], ["mis-tareas"]);
      toast.success("Tarea sombrilla creada");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo crear la sombrilla");
    } finally {
      setCreando(false);
    }
  };

  if (!sombrilla) {
    return (
      <div className="card-soft p-6 text-center space-y-3">
        <div className="text-sm text-muted-foreground">
          Esta entrega aún no tiene una tarea sombrilla para el plan de contenido.
        </div>
        <Button size="sm" onClick={crearSombrilla} disabled={creando}>
          {creando ? "Creando…" : "Crear plan de contenido"}
        </Button>
      </div>
    );
  }

  return <PlanRRSS tareaId={sombrilla.id} entregaId={entrega.id} clienteId={entrega.cliente_id} />;
}
