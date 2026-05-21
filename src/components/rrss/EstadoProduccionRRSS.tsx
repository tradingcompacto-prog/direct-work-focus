import * as React from "react";
import { parseISO, startOfDay } from "date-fns";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PublicacionRRSS } from "@/types/database";

export function EstadoProduccionRRSS({
  publicaciones,
}: {
  publicaciones: PublicacionRRSS[];
}) {
  const total = publicaciones.length;
  if (total === 0) return null;
  const hoy = startOfDay(new Date());
  const listas = publicaciones.filter(
    (p) => p.estado === "revision" || p.estado === "completada",
  ).length;
  const enCurso = publicaciones.filter((p) => p.estado === "haciendola").length;
  const vencidas = publicaciones.filter(
    (p) =>
      p.estado !== "completada" &&
      p.estado !== "revision" &&
      parseISO(p.fecha) < hoy,
  ).length;

  let estadoTexto = "Sin empezar";
  if (listas === total) estadoTexto = "Todo listo (esperando revisión)";
  else if (listas > 0 || enCurso > 0) estadoTexto = "En producción";

  const pct = Math.round((listas / total) * 100);

  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold uppercase tracking-wider text-muted-foreground">
          Estado de producción
        </span>
        <span className="text-muted-foreground tabular-nums">
          {total} publicacion{total === 1 ? "" : "es"}
        </span>
      </div>
      <div>
        <div className="flex items-center justify-between text-[11px] mb-1">
          <span className="text-muted-foreground">Listas para revisión</span>
          <span className="font-medium tabular-nums">{listas}/{total}</span>
        </div>
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div
            className={cn(
              "h-full transition-all",
              listas === total ? "bg-green-500" : "bg-blue-500",
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Estado:</span>
        <span className="font-medium">{estadoTexto}</span>
      </div>
      {vencidas > 0 && (
        <div className="flex items-center gap-1.5 text-xs text-orange-700">
          <AlertTriangle className="h-3.5 w-3.5" />
          {vencidas} publicaci{vencidas === 1 ? "ón" : "ones"} con fecha vencida
        </div>
      )}
    </div>
  );
}