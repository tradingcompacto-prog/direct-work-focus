import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { useTareaModal } from "@/lib/tarea-modal-context";
import type { Tarea } from "@/types/database";
import { ClienteLink, EntregaLink } from "@/components/EntidadLinks";
import { PersonaChip } from "@/components/PersonaChip";
import { urgenciaTarea, etiquetaFechaRelativa } from "@/lib/fechas";
import { bordeIzqCliente, colorCliente } from "@/lib/cliente-colors";
import { cn } from "@/lib/utils";

export function TareaCard({ tarea, compact = false }: { tarea: Tarea; compact?: boolean }) {
  const { abrir } = useTareaModal();
  const u = urgenciaTarea(tarea.fecha_fin_min, tarea.fecha_fin_max);
  return (
    <div
      onClick={() => abrir(tarea.id)}
      className={cn(
        "card-soft cursor-pointer p-3 border-l-4",
      )}
      style={bordeIzqCliente(tarea.cliente_id)}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-medium leading-snug min-w-0">{tarea.titulo}</h4>
        <span
          className={cn(
            "text-[10px] font-semibold tabular-nums shrink-0 px-1.5 py-0.5 rounded",
            u === "rojo" && "bg-red-100 text-red-700",
            u === "amarillo" && "bg-amber-100 text-amber-700",
            u === "azul" && "bg-blue-100 text-blue-700",
            u === "neutro" && "bg-muted text-muted-foreground",
          )}
        >
          {etiquetaFechaRelativa(tarea.fecha_fin_max)}
        </span>
      </div>
      {!compact && (
        <div className="mt-1.5 text-xs text-muted-foreground truncate flex items-center gap-1.5">
          <span
            className="h-1.5 w-1.5 rounded-full inline-block shrink-0"
            style={{ backgroundColor: colorCliente(tarea.cliente_id).border }}
          />
          <ClienteLink id={tarea.cliente_id} /> ·{" "}
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
