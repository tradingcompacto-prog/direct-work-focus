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
import { toast } from "sonner";
import { rechazarVacacion } from "@/lib/vacaciones-store";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  vacacionId: string | null;
}

export function RechazarVacacionesDialog({ open, onOpenChange, vacacionId }: Props) {
  const [motivo, setMotivo] = React.useState("");
  const [enviando, setEnviando] = React.useState(false);

  React.useEffect(() => {
    if (!open) setMotivo("");
  }, [open]);

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (motivo.trim().length < 5) {
      toast.error("El motivo debe tener al menos 5 caracteres");
      return;
    }
    if (!vacacionId) return;
    setEnviando(true);
    try {
      await rechazarVacacion(vacacionId, motivo.trim());
      toast.success("Solicitud rechazada");
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al rechazar");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Rechazar solicitud de vacaciones</DialogTitle>
          <DialogDescription>
            El motivo será visible para el solicitante.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Motivo del rechazo *</Label>
            <Textarea
              rows={4}
              required
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Coincide con campaña importante…"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={enviando}>
              Cancelar
            </Button>
            <Button type="submit" variant="destructive" disabled={enviando}>
              {enviando ? "Rechazando…" : "Rechazar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}