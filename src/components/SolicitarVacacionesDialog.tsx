import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { solicitarVacaciones, diasEntre } from "@/lib/vacaciones-store";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function SolicitarVacacionesDialog({ open, onOpenChange }: Props) {
  const [fechaInicio, setFechaInicio] = React.useState("");
  const [fechaFin, setFechaFin] = React.useState("");
  const [motivo, setMotivo] = React.useState("");
  const [enviando, setEnviando] = React.useState(false);

  React.useEffect(() => {
    if (!open) {
      setFechaInicio("");
      setFechaFin("");
      setMotivo("");
    }
  }, [open]);

  const dias = fechaInicio && fechaFin ? diasEntre(fechaInicio, fechaFin) : 0;

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!fechaInicio || !fechaFin) {
      toast.error("Fechas obligatorias");
      return;
    }
    if (fechaFin < fechaInicio) {
      toast.error("La fecha fin debe ser >= inicio");
      return;
    }
    setEnviando(true);
    try {
      await solicitarVacaciones(fechaInicio, fechaFin, motivo.trim() || undefined);
      toast.success("Solicitud enviada");
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al solicitar");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Solicitar vacaciones</DialogTitle>
          <DialogDescription>
            La solicitud queda pendiente de aprobación por dirección.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Fecha inicio *</Label>
              <Input
                type="date"
                required
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Fecha fin *</Label>
              <Input
                type="date"
                required
                value={fechaFin}
                min={fechaInicio || undefined}
                onChange={(e) => setFechaFin(e.target.value)}
              />
            </div>
          </div>
          {dias > 0 && (
            <div className="rounded-md border border-border bg-muted/30 px-3 py-2 text-sm">
              <span className="font-semibold">{dias}</span> día{dias === 1 ? "" : "s"} solicitados
            </div>
          )}
          <div className="space-y-1.5">
            <Label className="text-xs">Motivo (opcional)</Label>
            <Textarea
              rows={3}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Verano, asuntos personales, etc."
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={enviando}>
              Cancelar
            </Button>
            <Button type="submit" disabled={enviando || dias === 0}>
              {enviando ? "Enviando…" : "Solicitar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}