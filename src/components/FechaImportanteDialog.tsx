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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { useClientes } from "@/lib/queries";
import {
  addFechaImportante,
  updateFechaImportante,
} from "@/lib/fechas-importantes-store";
import type { FechaImportante, UUID } from "@/types/database";
import { TIPO_FECHA_LABEL } from "@/types/database";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  /** Si se pasa, abre en modo edición. */
  fecha?: FechaImportante | null;
  /** Si se pasa, pre-rellena el cliente y bloquea el selector. */
  defaultClienteId?: UUID | null;
}

export function FechaImportanteDialog({
  open,
  onOpenChange,
  fecha,
  defaultClienteId,
}: Props) {
  const { data: clientes = [] } = useClientes();
  const [titulo, setTitulo] = React.useState("");
  const [descripcion, setDescripcion] = React.useState("");
  const [tipo, setTipo] = React.useState<FechaImportante["tipo"]>("efemeride");
  const [fechaInicio, setFechaInicio] = React.useState("");
  const [fechaFin, setFechaFin] = React.useState("");
  const [ambito, setAmbito] = React.useState<"global" | "cliente">("global");
  const [clienteId, setClienteId] = React.useState<string>("");
  const [enviando, setEnviando] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    if (fecha) {
      setTitulo(fecha.titulo);
      setDescripcion(fecha.descripcion ?? "");
      setTipo(fecha.tipo);
      setFechaInicio(fecha.fecha_inicio);
      setFechaFin(fecha.fecha_fin ?? "");
      setAmbito(fecha.cliente_id ? "cliente" : "global");
      setClienteId(fecha.cliente_id ?? "");
    } else {
      setTitulo("");
      setDescripcion("");
      setTipo("efemeride");
      setFechaInicio("");
      setFechaFin("");
      if (defaultClienteId) {
        setAmbito("cliente");
        setClienteId(defaultClienteId);
      } else {
        setAmbito("global");
        setClienteId("");
      }
    }
  }, [open, fecha, defaultClienteId]);

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!titulo.trim()) {
      toast.error("El título es obligatorio");
      return;
    }
    if (!fechaInicio) {
      toast.error("La fecha de inicio es obligatoria");
      return;
    }
    if (ambito === "cliente" && !clienteId) {
      toast.error("Selecciona un cliente o cambia a ámbito global");
      return;
    }
    setEnviando(true);
    try {
      const payload = {
        titulo: titulo.trim(),
        descripcion: descripcion.trim() || null,
        tipo,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin || null,
        cliente_id: ambito === "cliente" ? clienteId : null,
      };
      if (fecha) {
        await updateFechaImportante(fecha.id, payload);
        toast.success("Fecha actualizada");
      } else {
        await addFechaImportante(payload);
        toast.success("Fecha creada");
      }
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{fecha ? "Editar fecha" : "Nueva fecha importante"}</DialogTitle>
          <DialogDescription>
            Días señalados, festivos, lanzamientos o campañas. Global o específica de un cliente.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Título *</Label>
            <Input
              required
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Black Friday 2026"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Descripción</Label>
            <Textarea
              rows={2}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Tipo</Label>
              <Select value={tipo} onValueChange={(v) => setTipo(v as FechaImportante["tipo"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(TIPO_FECHA_LABEL) as FechaImportante["tipo"][]).map((t) => (
                    <SelectItem key={t} value={t}>{TIPO_FECHA_LABEL[t]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Fecha inicio *</Label>
              <Input
                type="date"
                required
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Fecha fin (opcional)</Label>
            <Input
              type="date"
              value={fechaFin}
              min={fechaInicio || undefined}
              onChange={(e) => setFechaFin(e.target.value)}
            />
            <p className="text-[11px] text-muted-foreground">Si la dejas vacía será de un solo día.</p>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Ámbito</Label>
            <RadioGroup value={ambito} onValueChange={(v) => setAmbito(v as "global" | "cliente")} className="space-y-2">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="global" id="amb-global" />
                <Label htmlFor="amb-global" className="text-sm font-normal cursor-pointer">
                  🌐 Global · afecta a todos los clientes
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="cliente" id="amb-cliente" />
                <Label htmlFor="amb-cliente" className="text-sm font-normal cursor-pointer">
                  Específica de un cliente
                </Label>
              </div>
            </RadioGroup>
            {ambito === "cliente" && (
              <Select
                value={clienteId}
                onValueChange={setClienteId}
                disabled={!!defaultClienteId}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecciona cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={enviando}>
              Cancelar
            </Button>
            <Button type="submit" disabled={enviando}>
              {enviando ? "Guardando…" : fecha ? "Guardar" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}