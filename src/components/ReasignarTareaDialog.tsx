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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { Tarea } from "@/types/database";
import { EQUIPO, nombrePorId } from "@/lib/equipo";
import { reasignarTarea } from "@/lib/tareas-store";

export function ReasignarTareaDialog({
  open,
  onOpenChange,
  tarea,
  onDone,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  tarea: Tarea;
  onDone?: () => void;
}) {
  const hoy = new Date().toISOString().slice(0, 10);
  const [responsable, setResponsable] = React.useState("");
  const [fecha, setFecha] = React.useState(hoy);
  const [nota, setNota] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setResponsable("");
      setFecha(hoy);
      setNota("");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reasignar tarea</DialogTitle>
          <DialogDescription>
            Tarea: <span className="font-medium">{tarea.titulo}</span>
            <br />
            Responsable actual:{" "}
            <span className="font-medium">{nombrePorId(tarea.responsable_id)}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Asignar a</Label>
            <Select value={responsable} onValueChange={setResponsable}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona persona" />
              </SelectTrigger>
              <SelectContent>
                {EQUIPO.filter((m) => m.id !== tarea.responsable_id).map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Fecha</Label>
            <Input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Notas (opcional)</Label>
            <Textarea rows={3} value={nota} onChange={(e) => setNota(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            disabled={!responsable}
            onClick={() => {
              reasignarTarea(tarea.id, responsable, fecha);
              toast.success(`✓ Tarea reasignada a ${nombrePorId(responsable)}`);
              onOpenChange(false);
              onDone?.();
            }}
          >
            Reasignar →
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}