import * as React from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Bell, Search } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotificaciones } from "@/lib/queries";
import { usuarioActual } from "@/lib/equipo";
import { tiempoRelativo } from "@/lib/fechas";
import { useBusquedaGlobal } from "@/lib/busqueda-context";

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
  const { data: notifs = [] } = useNotificaciones();
  const noLeidas = notifs.filter((n) => !n.leida).length;
  const busqueda = useBusquedaGlobal();

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
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel className="flex items-center justify-between">
            <span>Notificaciones</span>
            <button className="text-[11px] text-muted-foreground hover:text-foreground">
              Marcar todas leídas
            </button>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className="max-h-80 overflow-y-auto">
            {notifs.map((n) => (
              <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-0.5 py-2">
                <span className={n.leida ? "text-muted-foreground" : "font-medium"}>{n.texto}</span>
                <span className="text-[11px] text-muted-foreground">{tiempoRelativo(n.fecha)}</span>
              </DropdownMenuItem>
            ))}
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
          <DropdownMenuItem disabled>Configuración</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled>Salir</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
