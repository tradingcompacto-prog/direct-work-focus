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
import { CLIENTES_MOCK, PROYECTOS_MOCK, ENTREGAS_MOCK, TAREAS_MOCK } from "@/lib/mock-tareas";
import { EQUIPO } from "@/lib/equipo";
import { estimar } from "@/lib/estimacion";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ComboboxCrear } from "@/components/ComboboxCrear";

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
  const [titulo, setTitulo] = React.useState("");
  const [tipoTarea, setTipoTarea] = React.useState<string>("");
  const [responsableId, setResponsableId] = React.useState("");

  React.useEffect(() => {
    setClienteId(contexto?.cliente_id ?? "");
    setProyectoId(contexto?.proyecto_id ?? "");
    setEntregaId(contexto?.entrega_id ?? "");
    setTitulo("");
    setTipoTarea("");
    setResponsableId("");
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

  const entregas = proyectoId
    ? ENTREGAS_MOCK.filter((e) => e.proyecto_id === proyectoId)
    : ENTREGAS_MOCK;

  const [entregaNuevaNombre, setEntregaNuevaNombre] = React.useState<string | null>(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`${TITLES[tipo]} creada (mock)`);
    cerrar();
  };

  const estimacion =
    tipo === "tarea"
      ? estimar(
          {
            titulo: titulo || undefined,
            tipo: (tipoTarea || undefined) as never,
            cliente_id: clienteId || undefined,
            responsable_id: responsableId || undefined,
          },
          TAREAS_MOCK,
        )
      : null;

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
                <ComboboxCrear
                  options={CLIENTES_MOCK.map((c) => ({
                    value: c.id,
                    label: c.nombre,
                    hint: c.sector,
                  }))}
                  value={clienteId}
                  onChange={setClienteId}
                  disabled={!!contexto?.cliente_id}
                  placeholder="Selecciona cliente"
                  searchPlaceholder="Buscar cliente…"
                  emptyText="Sin clientes"
                  onCrearNuevo={(nombre) => {
                    toast.success(`Cliente «${nombre}» creado (mock)`);
                  }}
                  crearLabel="Crear cliente"
                />
              </Field>
              {tipo === "tarea" && (
                <Field label="Entrega">
                  <ComboboxCrear
                    options={[
                      { value: "puntuales", label: "Trabajos puntuales" },
                      ...entregas.map((e) => ({ value: e.id, label: e.nombre })),
                    ]}
                    value={entregaNuevaNombre ? `__nueva__` : entregaId}
                    onChange={(v) => {
                      setEntregaId(v);
                      setEntregaNuevaNombre(null);
                    }}
                    placeholder="Trabajos puntuales"
                    searchPlaceholder="Buscar entrega…"
                    emptyText="Sin entregas"
                    onCrearNuevo={(nombre) => {
                      setEntregaNuevaNombre(nombre);
                      setEntregaId("__nueva__");
                      toast.success(`Entrega «${nombre}» se creará al guardar`);
                    }}
                    crearLabel="Crear entrega"
                  />
                  {entregaNuevaNombre && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Nueva entrega: <span className="font-medium">{entregaNuevaNombre}</span>
                    </p>
                  )}
                </Field>
              )}
              <Field label="Título">
                <Input
                  required
                  placeholder={`Título de la ${tipo}`}
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                />
              </Field>
              <Field label="Descripción">
                <Textarea rows={3} />
              </Field>
              {tipo === "tarea" && (
                <>
                  <Field label="Tipo">
                    <Select value={tipoTarea} onValueChange={setTipoTarea}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="diseno">Diseño</SelectItem>
                        <SelectItem value="copy">Copy</SelectItem>
                        <SelectItem value="web">Web</SelectItem>
                        <SelectItem value="campanas">Campañas</SelectItem>
                        <SelectItem value="seo">SEO</SelectItem>
                        <SelectItem value="estrategia">Estrategia</SelectItem>
                        <SelectItem value="otro">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Responsable">
                    <PersonaSelect value={responsableId} onChange={setResponsableId} />
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
                  <div className="rounded-md border border-border bg-muted/30 px-3 py-2 text-xs flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    {estimacion ? (
                      <span>
                        Estimación automática:{" "}
                        <span className="font-semibold">{estimacion.horas}h</span>
                        <span
                          className={cn(
                            "ml-1.5 px-1.5 py-0.5 rounded text-[10px]",
                            estimacion.confianza === "alta"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700",
                          )}
                        >
                          {estimacion.confianza === "alta" ? "alta" : "baja"} confianza · {estimacion.muestras} ref.
                        </span>
                      </span>
                    ) : (
                      <span className="text-muted-foreground">
                        Sin datos suficientes para estimar todavía.
                      </span>
                    )}
                  </div>
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

function PersonaSelect({
  value,
  onChange,
}: {
  value?: string;
  onChange?: (v: string) => void;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
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
