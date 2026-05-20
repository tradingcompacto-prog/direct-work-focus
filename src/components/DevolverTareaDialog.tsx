import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { devolverAResponsable } from "@/lib/tareas-store";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  tareaIds: string[];
  onSuccess?: () => void;
}

export function DevolverTareaDialog({ open, onOpenChange, tareaIds, onSuccess }: Props) {
  const [motivo, setMotivo] = React.useState("");
  const [enviando, setEnviando] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setMotivo("");
      setEnviando(false);
    }
  }, [open]);

  const multi = tareaIds.length > 1;
  const motivoValido = motivo.trim().length >= 5;

  const confirmar = async () => {
    if (!motivoValido || tareaIds.length === 0) return;
    setEnviando(true);
    try {
      await Promise.all(tareaIds.map((id) => devolverAResponsable(id, motivo.trim())));
      toast.success(
        multi
          ? `${tareaIds.length} tareas devueltas`
          : "Tarea devuelta al responsable",
      );
      onOpenChange(false);
      onSuccess?.();
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {multi ? `Devolver ${tareaIds.length} tareas` : "Devolver tarea"}
          </DialogTitle>
          <DialogDescription>
            Las fechas se resetearán a hoy. El responsable verá esta tarea destacada
            en su timeline.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="motivo" className="text-xs">
            Motivo de la devolución
          </Label>
          <Textarea
            id="motivo"
            autoFocus
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Explica qué falta o qué hay que ajustar (mín. 5 caracteres)"
            rows={4}
          />
        </div>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={enviando}>
            Cancelar
          </Button>
          <Button
            className="bg-orange-600 hover:bg-orange-700 text-white"
            onClick={confirmar}
            disabled={!motivoValido || enviando}
          >
            {enviando ? "Devolviendo…" : "Devolver"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}