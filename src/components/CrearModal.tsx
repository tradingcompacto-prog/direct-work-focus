import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { useCrearModal } from "@/lib/crear-modal-context";
import { CLIENTES_MOCK, PROYECTOS_MOCK, ENTREGAS_MOCK } from "@/lib/mock-tareas";
import { EQUIPO } from "@/lib/equipo";
import { toast } from "sonner";

const TITLES: Record<string, string> = {
  tarea: "Nueva tarea",
  entrega: "Nueva entrega",
  proyecto: "Nuevo proyecto",
  cliente: "Nuevo cliente",
};

export function CrearModal() {
  const { tipo, contexto, cerrar } = useCrearModal();
  const [clienteId, setClienteId] = React.useState("");
  const [proyectoId, setProyectoId] = React.useState("");
  const [entregaId, setEntregaId] = React.useState("");

  React.useEffect(() => {
    setClienteId(contexto?.cliente_id ?? "");
    setProyectoId(contexto?.proyecto_id ?? "");
    setEntregaId(contexto?.entrega_id ?? "");
  }, [contexto, tipo]);

  // Regla: 1 cliente = 1 proyecto (mismo nombre). Auto-seleccionar proyecto al elegir cliente.
  React.useEffect(() => {
    if (clienteId) {
      const pry = PROYECTOS_MOCK.find((p) => p.cliente_id === clienteId);
      if (pry) setProyectoId(pry.id);
    } else {
      setProyectoId("");
    }
  }, [clienteId]);

  if (!tipo) return null;

  const proyectos = clienteId
    ? PROYECTOS_MOCK.filter((p) => p.cliente_id === clienteId)
    : PROYECTOS_MOCK;
  const entregas = proyectoId
    ? ENTREGAS_MOCK.filter((e) => e.proyecto_id === proyectoId)
    : ENTREGAS_MOCK;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`${TITLES[tipo]} creada (mock)`);
    cerrar();
  };

  return (
    <Dialog open onOpenChange={(o) => (o ? null : cerrar())}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{TITLES[tipo]}</DialogTitle>
          <DialogDescription>
            Rellena los datos básicos. Datos mock — sin persistencia aún.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          {tipo === "cliente" ? (
            <>
              <Field label="Nombre">
                <Input required placeholder="Nombre del cliente" />
              </Field>
              <Field label="Sector">
                <Input placeholder="Sector" />
              </Field>
              <Field label="PM">
                <PersonaSelect />
              </Field>
            </>
          ) : (
            <>
              <Field label="Cliente">
                <Select value={clienteId} onValueChange={setClienteId} disabled={!!contexto?.cliente_id}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {CLIENTES_MOCK.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              {tipo === "tarea" && (
                <Field label="Entrega">
                  <Select value={entregaId} onValueChange={setEntregaId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Trabajos puntuales" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="puntuales">Trabajos puntuales</SelectItem>
                      {entregas.map((e) => (
                        <SelectItem key={e.id} value={e.id}>
                          {e.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
              <Field label="Título">
                <Input required placeholder={`Título de la ${tipo}`} />
              </Field>
              <Field label="Descripción">
                <Textarea rows={3} />
              </Field>
              {tipo === "tarea" && (
                <>
                  <Field label="Responsable">
                    <PersonaSelect />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Fecha inicio">
                      <Input type="date" />
                    </Field>
                    <Field label="Fecha fin">
                      <Input type="date" />
                    </Field>
                  </div>
                  <Field label="Prioridad">
                    <Select defaultValue="media">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="baja">Baja</SelectItem>
                        <SelectItem value="media">Media</SelectItem>
                        <SelectItem value="alta">Alta</SelectItem>
                        <SelectItem value="critica">Crítica</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </>
              )}
              {tipo === "entrega" && (
                <Field label="Plantilla">
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sin plantilla" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rrss">Calendario RRSS mensual</SelectItem>
                      <SelectItem value="landing">Landing express</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              )}
            </>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={cerrar}>
              Cancelar
            </Button>
            <Button type="submit">Crear</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}

function PersonaSelect() {
  return (
    <Select>
      <SelectTrigger>
        <SelectValue placeholder="Seleccionar persona" />
      </SelectTrigger>
      <SelectContent>
        {EQUIPO.map((m) => (
          <SelectItem key={m.id} value={m.id}>
            {m.nombre}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
