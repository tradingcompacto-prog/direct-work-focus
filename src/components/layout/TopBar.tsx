import * as React from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Bell, Search, Check, Play, UserPlus, MessageSquare, AlertTriangle, BellOff } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRolVista, setRolVista, rolesDisponibles, ROL_LABEL } from "@/lib/rol-vista";
import { Eye, Rows3 } from "lucide-react";
import { useDensidad, type Densidad } from "@/lib/preferencias";
import { useNotificacionesStore, marcarLeida, marcarTodasLeidas } from "@/lib/notificaciones-store";
import { usuarioActual } from "@/lib/equipo";
import { tiempoRelativo } from "@/lib/fechas";
import { useBusquedaGlobal } from "@/lib/busqueda-context";
import { cn } from "@/lib/utils";
import type { Notificacion } from "@/types/database";

interface Crumb {
  label: string;
  to?: string;
}

const labelMap: Record<string, string> = {
  tareas: "Mis tareas",
  entregas: "Mis entregas",
  equipo: "El equipo",
  clientes: "Clientes",
  brujula: "Brújula",
  personas: "Personas",
  proyectos: "Proyectos",
  timeline: "Timeline",
  tabla: "Tabla",
  kanban: "Kanban",
  gantt: "Gantt",
  carga: "Carga",
  calendario: "Calendario",
  tarjetas: "Tarjetas",
};

export function TopBar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const u = usuarioActual();
  const { notificaciones: notifs } = useNotificacionesStore();
  const noLeidas = notifs.filter((n) => !n.leida).length;
  const busqueda = useBusquedaGlobal();
  const navigate = useNavigate();
  const [filtro, setFiltro] = React.useState<"todas" | "urgente" | "importante" | "info">("todas");

  const filtradas = filtro === "todas" ? notifs : notifs.filter((n) => (n.categoria ?? "info") === filtro);
  const grupos = {
    urgente: filtradas.filter((n) => n.categoria === "urgente"),
    importante: filtradas.filter((n) => n.categoria === "importante"),
    info: filtradas.filter((n) => (n.categoria ?? "info") === "info"),
  };
  const counts = {
    urgente: notifs.filter((n) => n.categoria === "urgente" && !n.leida).length,
    importante: notifs.filter((n) => n.categoria === "importante" && !n.leida).length,
    info: notifs.filter((n) => (n.categoria ?? "info") === "info" && !n.leida).length,
  };

  const segmentos = path.split("/").filter(Boolean);
  const crumbs: Crumb[] = segmentos.map((seg, i) => {
    const to = "/" + segmentos.slice(0, i + 1).join("/");
    const label = labelMap[seg] ?? seg;
    return { label, to };
  });
  if (crumbs.length === 0) crumbs.push({ label: "Inicio" });

  return (
    <header className="sticky top-0 z-30 h-14 bg-background border-b border-border flex items-center px-4 gap-4">
      <nav className="flex items-center gap-1 text-sm min-w-0 flex-1">
        {crumbs.map((c, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className="text-muted-foreground/50">›</span>}
            {c.to && i < crumbs.length - 1 ? (
              <Link to={c.to} className="text-muted-foreground hover:text-foreground truncate">
                {c.label}
              </Link>
            ) : (
              <span className="text-foreground font-medium truncate">{c.label}</span>
            )}
          </React.Fragment>
        ))}
      </nav>

      <button
        onClick={() => busqueda.abrir()}
        className="hidden md:flex items-center gap-2 text-sm text-muted-foreground bg-muted/40 hover:bg-muted/70 transition rounded-md px-3 py-1.5 min-w-[280px]"
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 text-left">Buscar...</span>
        <kbd className="text-[10px] bg-background border border-border rounded px-1.5 py-0.5 font-mono">
          ⌘K
        </kbd>
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="relative h-9 w-9 rounded-full hover:bg-muted/70 transition inline-flex items-center justify-center"
            aria-label="Notificaciones"
          >
            <Bell className="h-4 w-4" />
            {noLeidas > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center px-1">
                {noLeidas}
              </span>
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-96 p-0">
          <DropdownMenuLabel className="flex items-center justify-between px-3 py-2.5">
            <span className="flex items-center gap-2">
              Notificaciones
              {noLeidas > 0 && (
                <span className="text-[10px] font-semibold bg-red-100 text-red-700 rounded px-1.5 py-0.5">
                  {noLeidas} sin leer
                </span>
              )}
            </span>
            <button
              onClick={(e) => { e.preventDefault(); marcarTodasLeidas(); }}
              disabled={noLeidas === 0}
              className="text-[11px] text-muted-foreground hover:text-foreground disabled:opacity-40"
            >
              Marcar todas leídas
            </button>
          </DropdownMenuLabel>
          <div className="flex gap-1 px-3 pb-2">
            {([
              ["todas", "Todas", null],
              ["urgente", "🔴 Urgente", counts.urgente],
              ["importante", "🟡 Importante", counts.importante],
              ["info", "⚪ Info", counts.info],
            ] as const).map(([k, label, count]) => (
              <button
                key={k}
                onClick={(e) => { e.preventDefault(); setFiltro(k as typeof filtro); }}
                className={cn(
                  "text-[11px] px-2 py-1 rounded border transition",
                  filtro === k
                    ? "bg-foreground text-background border-foreground"
                    : "bg-background text-muted-foreground border-border hover:bg-muted/60",
                )}
              >
                {label}
                {count != null && count > 0 && <span className="ml-1 font-semibold">{count}</span>}
              </button>
            ))}
          </div>
          <DropdownMenuSeparator className="m-0" />
          <div className="max-h-[420px] overflow-y-auto">
            {filtradas.length === 0 && (
              <div className="text-center py-10 px-4 text-muted-foreground">
                <BellOff className="h-7 w-7 mx-auto mb-2 opacity-40" />
                <div className="text-sm">Todo al día 🎉</div>
              </div>
            )}
            {grupos.urgente.length > 0 && (
              <Grupo titulo="🔴 Urgente">
                {grupos.urgente.map((n) => (
                  <Item key={n.id} n={n} onClick={() => { marcarLeida(n.id); if (n.ruta) navigate({ to: n.ruta as never }); }} />
                ))}
              </Grupo>
            )}
            {grupos.importante.length > 0 && (
              <Grupo titulo="🟡 Importante">
                {grupos.importante.map((n) => (
                  <Item key={n.id} n={n} onClick={() => { marcarLeida(n.id); if (n.ruta) navigate({ to: n.ruta as never }); }} />
                ))}
              </Grupo>
            )}
            {grupos.info.length > 0 && (
              <Grupo titulo="⚪ Informativo">
                {grupos.info.map((n) => (
                  <Item key={n.id} n={n} onClick={() => { marcarLeida(n.id); if (n.ruta) navigate({ to: n.ruta as never }); }} />
                ))}
              </Grupo>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-secondary text-secondary-foreground text-xs font-semibold">
                {u.iniciales}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{u.nombre}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/personas/$id" params={{ id: u.id }}>
              Mi perfil
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <VerComo />
          <DensidadMenu />
          <DropdownMenuItem disabled>Configuración</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled>Salir</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

function VerComo() {
  const [rol] = useRolVista();
  const roles = rolesDisponibles();
  if (roles.length <= 1) return null;
  return (
    <>
      <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5 pt-1">
        <Eye className="h-3 w-3" /> Ver como
      </DropdownMenuLabel>
      {roles.map((r) => (
        <DropdownMenuItem
          key={r}
          onSelect={(e) => { e.preventDefault(); setRolVista(r); }}
          className="flex items-center justify-between"
        >
          <span>{ROL_LABEL[r]}</span>
          {rol === r && <Check className="h-3.5 w-3.5 text-primary" />}
        </DropdownMenuItem>
      ))}
    </>
  );
}

const DENSIDAD_LABEL: Record<Densidad, string> = {
  compacto: "Compacto",
  normal: "Normal",
  comodo: "Cómodo",
};

function DensidadMenu() {
  const [d, setD] = useDensidad();
  return (
    <>
      <DropdownMenuSeparator />
      <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5 pt-1">
        <Rows3 className="h-3 w-3" /> Densidad
      </DropdownMenuLabel>
      {(Object.keys(DENSIDAD_LABEL) as Densidad[]).map((k) => (
        <DropdownMenuItem
          key={k}
          onSelect={(e) => { e.preventDefault(); setD(k); }}
          className="flex items-center justify-between"
        >
          <span>{DENSIDAD_LABEL[k]}</span>
          {d === k && <Check className="h-3.5 w-3.5 text-primary" />}
        </DropdownMenuItem>
      ))}
    </>
  );
}

function Grupo({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {titulo}
      </div>
      <div>{children}</div>
    </div>
  );
}

const ICONOS = {
  check: { Icon: Check, cls: "bg-green-100 text-green-700" },
  play: { Icon: Play, cls: "bg-blue-100 text-blue-700" },
  "user-plus": { Icon: UserPlus, cls: "bg-violet-100 text-violet-700" },
  message: { Icon: MessageSquare, cls: "bg-zinc-100 text-zinc-700" },
  alert: { Icon: AlertTriangle, cls: "bg-amber-100 text-amber-700" },
} as const;

function Item({ n, onClick }: { n: Notificacion; onClick: () => void }) {
  const meta = ICONOS[n.icono ?? "message"] ?? ICONOS.message;
  const Icon = meta.Icon;
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left px-3 py-2.5 flex gap-3 items-start hover:bg-muted/60 transition border-l-2",
        n.leida ? "border-transparent" : "border-blue-500 bg-blue-50/30",
      )}
    >
      <span className={cn("h-7 w-7 rounded-full flex items-center justify-center shrink-0", meta.cls)}>
        <Icon className="h-3.5 w-3.5" />
      </span>
      <span className="flex-1 min-w-0">
        <span className={cn("block text-sm leading-snug", !n.leida && "font-medium")}>
          {n.texto}
        </span>
        <span className="block text-[11px] text-muted-foreground mt-0.5">{tiempoRelativo(n.fecha)}</span>
      </span>
      {!n.leida && <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0 mt-2" />}
    </button>
  );
}
