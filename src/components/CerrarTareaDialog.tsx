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
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { Tarea } from "@/types/database";

export function CerrarTareaDialog({
  open,
  onOpenChange,
  tarea,
  sugerida,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  tarea: Tarea;
  sugerida: number | null;
}) {
  const [valor, setValor] = React.useState<string>("");

  React.useEffect(() => {
    if (open) setValor(sugerida != null ? String(sugerida) : "");
  }, [open, sugerida]);

  const cerrarConHoras = (horas: number | null) => {
    if (horas != null) tarea.horas_reales = horas;
    tarea.estado = "completada";
    toast.success(
      horas != null
        ? `«${tarea.titulo}» cerrada · ${horas}h registradas`
        : `«${tarea.titulo}» cerrada`,
      { description: "Una menos en tu lista 👌" },
    );
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>¿Cuántas horas te llevó?</DialogTitle>
          <DialogDescription>
            Apúntalo para mejorar las estimaciones futuras del equipo.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="horas-reales" className="text-xs">
              Horas reales
            </Label>
            <Input
              id="horas-reales"
              type="number"
              step="0.5"
              min="0"
              autoFocus
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder={sugerida != null ? `Sugerencia: ${sugerida}h` : "p. ej. 2.5"}
            />
            {sugerida != null && (
              <p className="text-xs text-muted-foreground">
                Estimación automática: <span className="font-medium">{sugerida}h</span>
              </p>
            )}
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="ghost" onClick={() => cerrarConHoras(null)}>
            No lo sé
          </Button>
          <Button
            onClick={() => {
              const n = parseFloat(valor);
              cerrarConHoras(Number.isFinite(n) && n >= 0 ? n : null);
            }}
          >
            Cerrar tarea
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
