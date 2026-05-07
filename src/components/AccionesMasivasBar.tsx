import * as React from "react";
import { Button } from "@/components/ui/button";
import { X, Trash2, UserPlus, Tag, Download } from "lucide-react";

export function AccionesMasivasBar({
  count,
  onClear,
  onCambiarEstado,
  onReasignar,
  onEliminar,
  onExportar,
}: {
  count: number;
  onClear: () => void;
  onCambiarEstado?: () => void;
  onReasignar?: () => void;
  onEliminar?: () => void;
  onExportar?: () => void;
}) {
  if (count === 0) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 anim-in">
      <div className="card-soft shadow-xl border bg-foreground text-background flex items-center gap-1 pl-3 pr-1.5 py-1.5">
        <span className="text-xs font-medium pr-2 border-r border-background/20">
          {count} seleccionada{count > 1 ? "s" : ""}
        </span>
        {onCambiarEstado && (
          <Button size="sm" variant="ghost" className="h-7 gap-1.5 text-background hover:bg-background/15 hover:text-background" onClick={onCambiarEstado}>
            <Tag className="h-3.5 w-3.5" /> Estado
          </Button>
        )}
        {onReasignar && (
          <Button size="sm" variant="ghost" className="h-7 gap-1.5 text-background hover:bg-background/15 hover:text-background" onClick={onReasignar}>
            <UserPlus className="h-3.5 w-3.5" /> Reasignar
          </Button>
        )}
        {onExportar && (
          <Button size="sm" variant="ghost" className="h-7 gap-1.5 text-background hover:bg-background/15 hover:text-background" onClick={onExportar}>
            <Download className="h-3.5 w-3.5" /> Exportar
          </Button>
        )}
        {onEliminar && (
          <Button size="sm" variant="ghost" className="h-7 gap-1.5 text-red-300 hover:bg-red-500/20 hover:text-red-200" onClick={onEliminar}>
            <Trash2 className="h-3.5 w-3.5" /> Eliminar
          </Button>
        )}
        <button onClick={onClear} className="h-7 w-7 inline-flex items-center justify-center rounded hover:bg-background/15 ml-1">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
