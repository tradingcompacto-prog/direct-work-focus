import { Link } from "@tanstack/react-router";
import { clientePorId, proyectoPorId, entregaPorId } from "@/lib/mock-tareas";
import { cn } from "@/lib/utils";

const stop = (e: React.MouseEvent) => e.stopPropagation();

export function ClienteLink({ id, className }: { id: string; className?: string }) {
  const c = clientePorId(id);
  if (!c) return <>—</>;
  return (
    <Link
      to="/clientes/$id"
      params={{ id }}
      onClick={stop}
      className={cn("hover:underline underline-offset-2 text-foreground", className)}
    >
      {c.nombre}
    </Link>
  );
}

export function ProyectoLink({ id, className }: { id: string; className?: string }) {
  const p = proyectoPorId(id);
  if (!p) return <>—</>;
  return (
    <Link
      to="/proyectos/$id"
      params={{ id }}
      onClick={stop}
      className={cn("hover:underline underline-offset-2 text-foreground", className)}
    >
      {p.nombre}
    </Link>
  );
}

export function EntregaLink({ id, className }: { id: string; className?: string }) {
  const e = entregaPorId(id);
  if (!e) return <>—</>;
  return (
    <Link
      to="/entregas/$id"
      params={{ id }}
      onClick={stop}
      className={cn("hover:underline underline-offset-2 text-foreground", className)}
    >
      {e.nombre}
    </Link>
  );
}
