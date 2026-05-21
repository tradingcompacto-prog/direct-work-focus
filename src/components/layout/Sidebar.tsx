import * as React from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { addDays, parseISO, startOfDay } from "date-fns";
import {
  CalendarDays,
  Table2,
  KanbanSquare,
  GanttChartSquare,
  Map,
  CalendarRange,
  Sparkles,
  Building2,
  Compass,
  Plus,
  ChevronLeft,
  ChevronRight,
  ListChecks,
  Package,
  Users,
  FileImage,
  CalendarRange as CalRange2,
  GalleryHorizontalEnd,
  BarChart3,
  PenSquare,
  ShieldCheck,
  Inbox,
  Undo2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMisTareas, useMisEntregas, useTareas, useMisPublicacionesComoTareas } from "@/lib/queries";
import { useVacacionesPorAprobar } from "@/lib/vacaciones-store";
import { Plane } from "lucide-react";
import { urgenciaTarea } from "@/lib/fechas";
import { usePrefSidebarCollapsed } from "@/lib/preferencias";
import { useCrearModal } from "@/lib/crear-modal-context";
import { useUserCaps } from "@/lib/user-caps";
import { useTareasVersion } from "@/lib/tareas-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ItemDef {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  atajo?: string;
}
interface SectionDef {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: ItemDef[];
  /** Si se devuelve false la sección se oculta entera. */
  visibleSi?: (caps: ReturnType<typeof useUserCaps>) => boolean;
}

function construirSecciones(caps: ReturnType<typeof useUserCaps>): SectionDef[] {
  const SECS: SectionDef[] = [
  {
    label: "Mis tareas",
    icon: ListChecks,
    items: [
      { to: "/tareas/timeline", label: "Timeline", icon: CalendarDays, atajo: "G T" },
      { to: "/tareas/tabla", label: "Tabla", icon: Table2 },
      ...(caps.hasDevoluciones
        ? [{ to: "/mis-devoluciones", label: "Mis devoluciones", icon: Undo2 } as ItemDef]
        : []),
    ],
  },
  ...(caps.isPM || caps.isDirector
    ? [
        {
          label: "Revisión",
          icon: ShieldCheck,
          items: [
            ...(caps.isPM
              ? [{ to: "/mis-revisiones", label: "Mis revisiones", icon: Inbox } as ItemDef]
              : []),
            ...(caps.isDirector
              ? [{ to: "/revision", label: "Revisión global", icon: ShieldCheck } as ItemDef]
              : []),
          ],
        } as SectionDef,
      ]
    : []),
  {
    label: "Mis entregas",
    icon: Package,
    visibleSi: (c) => c.isPM || c.isDirector,
    items: [
      { to: "/entregas/kanban", label: "Kanban", icon: KanbanSquare, atajo: "G K" },
      { to: "/entregas/gantt", label: "Timeline", icon: CalendarDays },
      { to: "/entregas/tabla", label: "Tabla", icon: Table2 },
    ],
  },
  {
    label: "El equipo",
    icon: Users,
    items: [
      { to: "/equipo/carga", label: "Carga", icon: Map, atajo: "G C" },
      { to: "/equipo/calendario", label: "Calendario campañas", icon: CalendarRange },
      { to: "/equipo/fechas", label: "Fechas importantes", icon: Sparkles },
      { to: "/vacaciones", label: "Vacaciones", icon: Plane },
    ],
  },
  {
    label: "Clientes",
    icon: Building2,
    visibleSi: (c) => c.isPM || c.isDirector,
    items: [
      { to: "/clientes/tabla", label: "Clientes", icon: Building2, atajo: "G L" },
      { to: "/fechas-importantes", label: "Fechas importantes", icon: Sparkles },
    ],
  },
  {
    label: "Brújula",
    icon: Compass,
    visibleSi: (c) => c.isDirector,
    items: [{ to: "/brujula", label: "Resumen ejecutivo", icon: Compass, atajo: "G B" }],
  },
  ];
  return SECS.filter((s) => (s.visibleSi ? s.visibleSi(caps) : true));
}

export function Sidebar() {
  const [collapsed, setCollapsed] = usePrefSidebarCollapsed();
  useTareasVersion();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { abrir } = useCrearModal();
  const caps = useUserCaps();
  const esDirector = caps.isDirector;
  const esPm = caps.isPM || esDirector;
  const { data: misT = [] } = useMisTareas();
  const { data: misE = [] } = useMisEntregas();
  const { data: todasT = [] } = useTareas();
  const { data: misPubs = [] } = useMisPublicacionesComoTareas();
  const { data: vacPend = [] } = useVacacionesPorAprobar();
  const badges: Record<string, { n: number; tone?: "rojo" | "alerta" }> = React.useMemo(() => {
    const misActivas = misT.filter((t) => t.estado !== "completada");
    const pubsActivas = misPubs.filter((p) => p.estado !== "completada");
    const totalActivas = misActivas.length + pubsActivas.length;
    const misEActivas = misE.filter((e) => e.estado === "en_curso");
    const cargaAlertas = misActivas.filter(
      (t) => urgenciaTarea(t.fecha_fin_min, t.fecha_fin_max) === "rojo",
    ).length;
    const vencidasGlobal = todasT.filter(
      (t) => t.estado !== "completada" && urgenciaTarea(t.fecha_fin_min, t.fecha_fin_max) === "rojo",
    ).length;
    const hoy = startOfDay(new Date());
    const limite = addDays(hoy, 14);
    const enRangoTimeline = [...misActivas, ...pubsActivas].filter((t) => {
      const fin = parseISO(t.fecha_fin_max);
      const inicio = parseISO(t.fecha_inicio ?? t.fecha_fin_min);
      return fin >= hoy && inicio <= limite;
    });
    return {
      "/tareas/timeline": { n: enRangoTimeline.length },
      "/tareas/tabla": { n: totalActivas },
      "/entregas/kanban": { n: misEActivas.length },
      "/entregas/gantt": { n: misEActivas.length },
      "/entregas/tabla": { n: misEActivas.length },
      "/equipo/carga": { n: cargaAlertas, tone: cargaAlertas > 0 ? "alerta" : undefined },
      "/mis-devoluciones": {
        n: caps.devolucionesCount,
        tone: caps.devolucionesCount > 0 ? "rojo" : undefined,
      },
      "/brujula": { n: vencidasGlobal, tone: vencidasGlobal > 0 ? "rojo" : undefined },
      "/vacaciones": caps.isDirector
        ? { n: vacPend.length, tone: vacPend.length > 0 ? "alerta" : undefined }
        : { n: 0 },
    };
  }, [misT, misE, todasT, misPubs, caps.devolucionesCount, caps.isDirector, vacPend]);
  const visibleSecciones = React.useMemo(() => construirSecciones(caps), [caps]);

  return (
    <TooltipProvider delayDuration={150}>
      <aside
        className={cn(
          "shrink-0 border-r border-border bg-[oklch(0.98_0.003_260)] flex flex-col transition-[width] duration-200 ease-out",
          collapsed ? "w-[60px]" : "w-[220px]",
        )}
      >
        {/* Header */}
        <div className={cn("flex items-center gap-2 px-3 py-3 border-b border-border", collapsed && "justify-center px-0")}>
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background text-sm font-bold">
              S
            </span>
            {!collapsed && (
              <span className="font-semibold text-sm tracking-tight">Social Advisor</span>
            )}
          </Link>
        </div>

        {/* Botón crear */}
        <div className={cn("px-3 pt-3", collapsed && "px-2")}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "w-full inline-flex items-center justify-center gap-2 rounded-lg bg-foreground text-background text-sm font-medium py-2 hover:opacity-90 transition",
                  collapsed && "px-0",
                )}
                aria-label="Crear"
              >
                <Plus className="h-4 w-4" />
                {!collapsed && "Crear"}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onSelect={() => abrir("tarea")}>Nueva tarea</DropdownMenuItem>
              {(esPm || esDirector) && (
                <DropdownMenuItem onSelect={() => abrir("proyecto")}>
                  Nuevo proyecto
                </DropdownMenuItem>
              )}
              {esDirector && (
                <DropdownMenuItem onSelect={() => abrir("cliente")}>
                  Nuevo cliente
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Secciones */}
        <nav className="flex-1 overflow-y-auto py-3 space-y-3">
          {visibleSecciones.map((sec, idx) => (
            <div key={sec.label}>
              {idx > 0 && <div className="mx-3 my-2 border-t border-border" />}
              {!collapsed && (
                <div className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {sec.label}
                </div>
              )}
              <ul className="space-y-0.5 px-2">
                {sec.items.map((item) => {
                  const active = path.startsWith(item.to);
                  const Icon = item.icon;
                  const badge = badges[item.to];
                  const link = (
                    <Link
                      to={item.to}
                      className={cn(
                        "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition",
                        active
                          ? "bg-foreground/10 text-foreground font-medium"
                          : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground",
                        collapsed && "justify-center px-0",
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                      <span className="ml-auto flex items-center gap-1.5">
                      {!collapsed && badge && badge.n > 0 && (
                        <span
                          className={cn(
                            "text-[10px] tabular-nums font-semibold rounded px-1.5 py-0.5",
                            badge.tone === "rojo"
                              ? "bg-red-100 text-red-700"
                              : badge.tone === "alerta"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-muted text-muted-foreground",
                          )}
                        >
                          {badge.n}
                        </span>
                      )}
                      {!collapsed && item.atajo && (
                        <kbd className="text-[9px] font-mono text-muted-foreground/70 bg-muted/60 border border-border rounded px-1 py-0.5">
                          {item.atajo}
                        </kbd>
                      )}
                      </span>
                    </Link>
                  );
                  return (
                    <li key={item.to}>
                      {collapsed ? (
                        <Tooltip>
                          <TooltipTrigger asChild>{link}</TooltipTrigger>
                          <TooltipContent side="right">{item.label}</TooltipContent>
                        </Tooltip>
                      ) : (
                        link
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="border-t border-border py-2 text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition flex items-center justify-center"
          aria-label={collapsed ? "Expandir" : "Colapsar"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </aside>
    </TooltipProvider>
  );
}
