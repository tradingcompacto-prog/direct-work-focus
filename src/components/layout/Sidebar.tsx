import * as React from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  CalendarDays,
  Table2,
  KanbanSquare,
  GanttChartSquare,
  Map,
  CalendarRange,
  Building2,
  Compass,
  Plus,
  ChevronLeft,
  ChevronRight,
  ListChecks,
  Package,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { tienePermiso, USUARIO_ACTUAL_ID } from "@/lib/equipo";
import { TAREAS_MOCK, ENTREGAS_MOCK } from "@/lib/mock-tareas";
import { urgenciaTarea } from "@/lib/fechas";
import { usePrefSidebarCollapsed } from "@/lib/preferencias";
import { useCrearModal } from "@/lib/crear-modal-context";
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
}
interface SectionDef {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: ItemDef[];
  needsRol?: "director" | "pm";
}

const SECCIONES: SectionDef[] = [
  {
    label: "Mis tareas",
    icon: ListChecks,
    items: [
      { to: "/tareas/timeline", label: "Timeline", icon: CalendarDays, atajo: "G T" },
      { to: "/tareas/tabla", label: "Tabla", icon: Table2 },
    ],
  },
  {
    label: "Mis entregas",
    icon: Package,
    items: [
      { to: "/entregas/kanban", label: "Kanban", icon: KanbanSquare, atajo: "G K" },
      { to: "/entregas/gantt", label: "Gantt", icon: GanttChartSquare },
      { to: "/entregas/tabla", label: "Tabla", icon: Table2 },
    ],
  },
  {
    label: "El equipo",
    icon: Users,
    items: [
      { to: "/equipo/carga", label: "Carga", icon: Map, atajo: "G C" },
      { to: "/equipo/calendario", label: "Calendario maestro", icon: CalendarRange },
    ],
  },
  {
    label: "Clientes",
    icon: Building2,
    needsRol: "pm",
    items: [
      { to: "/clientes/tarjetas", label: "Tarjetas", icon: Building2, atajo: "G L" },
      { to: "/clientes/tabla", label: "Tabla", icon: Table2 },
    ],
  },
  {
    label: "Brújula",
    icon: Compass,
    needsRol: "director",
    items: [{ to: "/brujula", label: "Resumen ejecutivo", icon: Compass, atajo: "G B" }],
  },
];

function badgesPorRuta(): Record<string, { n: number; tone?: "rojo" | "alerta" }> {
  const misT = TAREAS_MOCK.filter(
    (t) => t.responsable_id === USUARIO_ACTUAL_ID && t.estado !== "completada",
  );
  const misE = ENTREGAS_MOCK.filter((e) => e.pm_id === USUARIO_ACTUAL_ID && e.estado === "en_curso");
  const vencidas = TAREAS_MOCK.filter(
    (t) => t.estado !== "completada" && urgenciaTarea(t.fecha_fin_min, t.fecha_fin_max) === "rojo",
  );
  const cargaAlertas = misT.filter(
    (t) => urgenciaTarea(t.fecha_fin_min, t.fecha_fin_max) === "rojo",
  ).length;
  return {
    "/tareas/timeline": { n: misT.length },
    "/tareas/tabla": { n: misT.length },
    "/entregas/kanban": { n: misE.length },
    "/entregas/gantt": { n: misE.length },
    "/entregas/tabla": { n: misE.length },
    "/equipo/carga": { n: cargaAlertas, tone: cargaAlertas > 0 ? "alerta" : undefined },
    "/brujula": { n: vencidas.length, tone: vencidas.length > 0 ? "rojo" : undefined },
  };
}

export function Sidebar() {
  const [collapsed, setCollapsed] = usePrefSidebarCollapsed();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { abrir } = useCrearModal();
  const esDirector = tienePermiso("director");
  const esPm = tienePermiso("pm");
  const badges = badgesPorRuta();

  const visibleSecciones = SECCIONES.filter((s) => {
    if (!s.needsRol) return true;
    if (s.needsRol === "director") return esDirector;
    return esPm || esDirector;
  });

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
              <DropdownMenuItem onSelect={() => abrir("entrega")}>Nueva entrega</DropdownMenuItem>
              {(esPm || esDirector) && (
                <DropdownMenuItem onSelect={() => abrir("proyecto")}>
                  Nuevo proyecto
                </DropdownMenuItem>
              )}
              {(esPm || esDirector) && (
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
                      {!collapsed && badge && badge.n > 0 && (
                        <span
                          className={cn(
                            "ml-auto text-[10px] tabular-nums font-semibold rounded px-1.5 py-0.5",
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
