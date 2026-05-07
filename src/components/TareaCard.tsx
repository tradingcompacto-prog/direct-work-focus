import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { useTareaModal } from "@/lib/tarea-modal-context";
import type { Tarea } from "@/types/database";
import { ClienteLink, ProyectoLink, EntregaLink } from "@/components/EntidadLinks";
import { PersonaChip } from "@/components/PersonaChip";
import { urgenciaTarea, etiquetaFechaRelativa } from "@/lib/fechas";
import { cn } from "@/lib/utils";

const tono = {
  rojo: "border-l-red-500",
  amarillo: "border-l-amber-500",
  azul: "border-l-blue-500",
  neutro: "border-l-zinc-300",
};

export function TareaCard({ tarea, compact = false }: { tarea: Tarea; compact?: boolean }) {
  const { abrir } = useTareaModal();
  const u = urgenciaTarea(tarea.fecha_fin_min, tarea.fecha_fin_max);
  return (
    <div
      onClick={() => abrir(tarea.id)}
      className={cn(
        "card-soft cursor-pointer p-3 border-l-4",
        tono[u],
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-medium leading-snug min-w-0">{tarea.titulo}</h4>
        <span className="text-[11px] text-muted-foreground shrink-0 tabular-nums">
          {etiquetaFechaRelativa(tarea.fecha_fin_max)}
        </span>
      </div>
      {!compact && (
        <div className="mt-1.5 text-xs text-muted-foreground truncate">
          <ClienteLink id={tarea.cliente_id} /> ·{" "}
          <ProyectoLink id={tarea.proyecto_id} className="text-muted-foreground" /> ·{" "}
          <EntregaLink id={tarea.entrega_id} className="text-muted-foreground" />
        </div>
      )}
      {!compact && (
        <div className="mt-2 flex items-center gap-2">
          <PersonaChip id={tarea.responsable_id} size="xs" showName={false} />
          <span className="text-[11px] text-muted-foreground">
            {format(parseISO(tarea.fecha_fin_max), "d MMM", { locale: es })}
          </span>
        </div>
      )}
    </div>
  );
}
