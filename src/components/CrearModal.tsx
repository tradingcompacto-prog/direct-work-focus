import * as React from "react";
import { useNavigate } from "@tanstack/react-router";
import { Instagram, Facebook, Linkedin, Music2 } from "lucide-react";
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
import { useTareaModal } from "@/lib/tarea-modal-context";
import { EQUIPO } from "@/lib/equipo";
import { estimar } from "@/lib/estimacion";
import {
  useClientes,
  useProyectos,
  useEntregas,
  useTareas,
  useCategoriaPorTarea,
  useResponsablesPermitidos,
  useEquipo,
} from "@/lib/queries";
import { supabase } from "@/lib/supabase";
import { invalidateKeys } from "@/lib/qc";
import { useAuth } from "@/lib/auth";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ComboboxCrear } from "@/components/ComboboxCrear";
import { CATEGORIAS_ENTREGA, labelCategoria } from "@/lib/categorias";
import { Checkbox } from "@/components/ui/checkbox";
import type { CategoriaEntrega, PublicacionRRSS } from "@/types/database";
import { TIPO_LABEL, FORMATO_LABEL } from "@/types/database";
import { PersonaPicker } from "@/components/PersonaPicker";
import { useUserCaps } from "@/lib/user-caps";
import { AvisoVacaciones } from "@/components/AvisoVacaciones";
import { useVacacionConflicto, useVacacionConflictoBatch } from "@/lib/vacaciones-store";
import { nombrePorId } from "@/lib/equipo";

const TITLES: Record<string, string> = {
  tarea: "Nueva tarea",
  proyecto: "Nuevo proyecto",
  cliente: "Nuevo cliente",
};

export function CrearModal() {
  const { tipo, contexto, cerrar } = useCrearModal();
  const navigate = useNavigate();
  const { abrir: abrirTareaModal } = useTareaModal();
  const { user } = useAuth();
  const caps = useUserCaps();
  const { data: clientesDB = [] } = useClientes();
  const { data: proyectosDB = [] } = useProyectos();
  const { data: entregasDB = [] } = useEntregas();
  const { data: tareasDB = [] } = useTareas();
  const categoriaPorTarea = useCategoriaPorTarea();
  const [clienteId, setClienteId] = React.useState("");
  const [proyectoId, setProyectoId] = React.useState("");
  const [categoriaTarea, setCategoriaTarea] = React.useState<CategoriaEntrega | "">("");
  const [titulo, setTitulo] = React.useState("");
  const [responsableId, setResponsableId] = React.useState("");
  const [colaboradoresIds, setColaboradoresIds] = React.useState<string[]>([]);
  const [fechaInicio, setFechaInicio] = React.useState<string>("");
  const [fechaFin, setFechaFin] = React.useState<string>("");
  const [usarRango, setUsarRango] = React.useState(false);
  const [nombreCliente, setNombreCliente] = React.useState("");
  const [sectorCliente, setSectorCliente] = React.useState("");
  const [pmCliente, setPmCliente] = React.useState("");
  const [catsCliente, setCatsCliente] = React.useState<CategoriaEntrega[]>(
    CATEGORIAS_ENTREGA.map((c) => c.value),
  );
  const [prioridadCliente, setPrioridadCliente] = React.useState<"1" | "2" | "3">("2");
  const [descripcion, setDescripcion] = React.useState("");
  const [prioridad, setPrioridad] = React.useState<"baja" | "media" | "alta" | "critica">("media");
  const [numPubs, setNumPubs] = React.useState(4);
  const [distrib, setDistrib] = React.useState<"uniforme" | "mismo-dia" | "personalizada">("uniforme");
  const [tipoDefault, setTipoDefault] = React.useState<PublicacionRRSS["tipo"]>("post");
  const [formatoDefault, setFormatoDefault] = React.useState<PublicacionRRSS["formato"]>("copy_imagen");
  const [plataformasDefault, setPlataformasDefault] = React.useState<PublicacionRRSS["plataformas"]>(["ig"]);
  const [disenoDefault, setDisenoDefault] = React.useState<string>("");
  const [copyDefault, setCopyDefault] = React.useState<string>("");
  const [enviando, setEnviando] = React.useState(false);

  React.useEffect(() => {
    setClienteId(contexto?.cliente_id ?? "");
    setProyectoId(contexto?.proyecto_id ?? "");
    setCategoriaTarea("");
    setTitulo("");
    setResponsableId("");
    setColaboradoresIds([]);
    setFechaInicio("");
    setFechaFin("");
    setUsarRango(false);
    setNombreCliente("");
    setSectorCliente("");
    setPmCliente("");
    setCatsCliente(CATEGORIAS_ENTREGA.map((c) => c.value));
    setPrioridadCliente("2");
    setDescripcion("");
    setPrioridad("media");
    setNumPubs(4);
    setDistrib("uniforme");
    setTipoDefault("post");
    setFormatoDefault("copy_imagen");
    setPlataformasDefault(["ig"]);
    setDisenoDefault("");
    // Copy por defecto = usuario actual (PM normalmente escribe). Diseño vacío.
    setCopyDefault(user?.id ?? "");
  }, [contexto, tipo, user?.id]);

  // Regla: 1 cliente = 1 proyecto. Auto-seleccionar proyecto al elegir cliente.
  React.useEffect(() => {
    if (clienteId) {
      const pry = proyectosDB.find((p) => p.cliente_id === clienteId);
      if (pry) setProyectoId(pry.id);
    } else {
      setProyectoId("");
    }
  }, [clienteId, proyectosDB]);

  // Categorías habilitadas del cliente (entregas permanentes existentes).
  const categoriasCliente = React.useMemo<CategoriaEntrega[]>(() => {
    if (!clienteId) return [];
    return Array.from(
      new Set(
        entregasDB
          .filter((e) => e.cliente_id === clienteId)
          .map((e) => e.categoria as CategoriaEntrega),
      ),
    );
  }, [clienteId, entregasDB]);

  // Detectar contexto RRSS: la categoría elegida es redes_sociales.
  const esRRSS = tipo === "tarea" && categoriaTarea === "redes_sociales";

  // Restringir responsable a PMs del cliente + directores
  const responsablesPermitidos = useResponsablesPermitidos(clienteId);
  const { data: equipoCompleto = [] } = useEquipo();

  // Default responsable cuando cambia la lista de permitidos
  React.useEffect(() => {
    if (tipo !== "tarea") return;
    if (responsablesPermitidos.length === 0) {
      setResponsableId("");
      return;
    }
    setResponsableId((prev) => {
      if (prev && responsablesPermitidos.some((m) => m.id === prev)) return prev;
      if (user && responsablesPermitidos.some((m) => m.id === user.id)) return user.id;
      return responsablesPermitidos[0].id;
    });
  }, [responsablesPermitidos, tipo, user]);

  if (!tipo) return null;
  // Bloqueo defensivo: solo directores pueden crear clientes.
  if (tipo === "cliente" && !caps.isDirector) {
    toast.error("Solo los directores pueden crear clientes");
    cerrar();
    return null;
  }

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!user) {
      toast.error("Sesión no disponible");
      return;
    }
    setEnviando(true);
    try {
      if (tipo === "cliente") {
        const nombre = nombreCliente.trim();
        if (!nombre) throw new Error("Nombre obligatorio");
        const pmId = pmCliente || user.id;
        const { data: cli, error } = await supabase
          .from("clientes")
          .insert({
            nombre,
            sector: sectorCliente || null,
            pm_principal_id: pmId,
            salud: "verde",
            activo: true,
            prioridad: parseInt(prioridadCliente, 10),
          })
          .select("id")
          .single();
        if (error) throw error;
        // Proyecto sombrilla (las entregas las crea el trigger T3 al
        // insertar las filas de cliente_categorias).
        await supabase.from("proyectos").insert({
          nombre,
          cliente_id: cli!.id,
          pm_id: pmId,
          estado: "activo",
          fecha_inicio: hoyISO(),
        });
        // Habilitar categorías seleccionadas → BD crea las entregas.
        if (catsCliente.length) {
          const filas = catsCliente.map((c) => ({
            cliente_id: cli!.id,
            categoria: c,
            habilitada_por: user.id,
          }));
          const { error: ec } = await supabase.from("cliente_categorias").insert(filas);
          if (ec) throw ec;
        }
        invalidateKeys(["clientes"], ["proyectos"], ["entregas"], ["cliente_categorias", cli!.id]);
        toast.success(`Cliente «${nombre}» creado`);
      } else if (tipo === "proyecto") {
        if (!clienteId) throw new Error("Selecciona cliente");
        const { error } = await supabase.from("proyectos").insert({
          nombre: titulo,
          cliente_id: clienteId,
          pm_id: responsableId || user.id,
          estado: "activo",
          fecha_inicio: fechaInicio || hoyISO(),
          fecha_fin: fechaFin || null,
        });
        if (error) throw error;
        invalidateKeys(["proyectos"]);
        toast.success("Proyecto creado");
      } else if (tipo === "tarea") {
        if (!clienteId) throw new Error("Selecciona cliente");
        if (!categoriaTarea) throw new Error("Selecciona categoría");
        // Resolver entrega permanente por (cliente, categoría).
        const { data: ent, error: eEnt } = await supabase
          .from("entregas")
          .select("id, proyecto_id")
          .eq("cliente_id", clienteId)
          .eq("categoria", categoriaTarea)
          .maybeSingle();
        if (eEnt) throw eEnt;
        if (!ent) throw new Error("La categoría no está habilitada para este cliente");
        const entregaTargetId = ent.id as string;
        const proyectoTargetId = (ent.proyecto_id as string) || proyectoId;

        const inicio = fechaInicio || fechaFin || hoyISO();
        const fin = fechaFin || fechaInicio || hoyISO();

        // --- Rama RRSS: tarea sombrilla + N filas en publicaciones_rrss ---
        if (esRRSS) {
          const { data: t, error } = await supabase
            .from("tareas")
            .insert({
              titulo: titulo || `Plan contenido ${nombreMes()}`,
              descripcion: descripcion || null,
              cliente_id: clienteId,
              proyecto_id: proyectoTargetId,
              entrega_id: entregaTargetId,
              responsable_id: responsableId || user.id,
              solicitante_id: user.id,
              estado: "activa",
              prioridad,
              fecha_inicio: inicio,
              fecha_fin_min: fin,
              fecha_fin_max: fin,
            })
            .select("id")
            .single();
          if (error) throw error;
          const fechas = distribuirFechas(inicio, fin, Math.max(1, numPubs), distrib);
          const filas = fechas.map((fechaPub) => ({
            tarea_id: t!.id,
            cliente_id: clienteId,
            entrega_id: entregaTargetId,
            fecha: fechaPub,
            tipo: tipoDefault,
            formato: formatoDefault,
            plataformas: plataformasDefault,
            estado: "activa",
            briefing: null,
            responsable_diseno_id: disenoDefault || null,
            responsable_copy_id: copyDefault || null,
          }));
          const { error: e2 } = await supabase.from("publicaciones_rrss").insert(filas);
          if (e2) throw e2;
          await insertColaboradores(t!.id, colaboradoresIds);
          invalidateKeys(["tareas"], ["mis-tareas"], ["plan-rrss", t!.id]);
          toast.success(`Plan creado con ${numPubs} publicaciones. Configúralas desde la tarea.`);
          cerrar();
          abrirTareaModal(t!.id);
          return;
        } else {
          const { data: t, error } = await supabase.from("tareas").insert({
            titulo,
            descripcion: descripcion || null,
            cliente_id: clienteId,
            proyecto_id: proyectoTargetId,
            entrega_id: entregaTargetId,
            responsable_id: responsableId || user.id,
            solicitante_id: user.id,
            estado: "activa",
            prioridad,
            fecha_inicio: inicio,
            fecha_fin_min: fin,
            fecha_fin_max: fin,
          }).select("id").single();
          if (error) throw error;
          await insertColaboradores(t!.id as string, colaboradoresIds);
          invalidateKeys(["tareas"], ["mis-tareas"]);
          toast.success("Tarea creada");
        }
      }
      cerrar();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setEnviando(false);
    }
  };

  const estimacion =
    tipo === "tarea"
      ? estimar(
          {
            titulo: titulo || undefined,
            categoria: (categoriaTarea || undefined) as CategoriaEntrega | undefined,
            cliente_id: clienteId || undefined,
            responsable_id: responsableId || undefined,
          },
          tareasDB,
          categoriaPorTarea,
        )
      : null;

  // Conflictos de vacaciones (solo si hay fecha y es tarea)
  const fechaParaConflicto = tipo === "tarea" ? (fechaFin || fechaInicio || "") : "";
  const conflictoResp = useVacacionConflicto(responsableId || null, fechaParaConflicto || null);
  const conflictosColab = useVacacionConflictoBatch(colaboradoresIds, fechaParaConflicto || null);

  return (
    <Dialog open onOpenChange={(o) => (o ? null : cerrar())}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{TITLES[tipo]}</DialogTitle>
          <DialogDescription>
            {esRRSS
              ? "Plan de contenido RRSS: 1 tarea + N publicaciones."
              : "Rellena los datos básicos."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          {tipo === "cliente" ? (
            <>
              <Field label="Nombre">
                <Input
                  required
                  placeholder="Nombre del cliente"
                  value={nombreCliente}
                  onChange={(e) => setNombreCliente(e.target.value)}
                />
              </Field>
              <Field label="Sector">
                <Input
                  placeholder="Sector"
                  value={sectorCliente}
                  onChange={(e) => setSectorCliente(e.target.value)}
                />
              </Field>
              <Field label="PM">
                <PersonaSelect value={pmCliente} onChange={setPmCliente} />
              </Field>
              <Field label="Prioridad">
                <Select value={prioridadCliente} onValueChange={(v) => setPrioridadCliente(v as "1" | "2" | "3")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">🔴 Alta</SelectItem>
                    <SelectItem value="2">🟡 Media</SelectItem>
                    <SelectItem value="3">⚪ Baja</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Categorías habilitadas">
                <div className="grid grid-cols-2 gap-2 rounded-md border border-border p-3 max-h-56 overflow-auto">
                  {CATEGORIAS_ENTREGA.map((c) => {
                    const checked = catsCliente.includes(c.value);
                    return (
                      <label
                        key={c.value}
                        className="flex items-center gap-2 text-sm cursor-pointer"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(v) =>
                            setCatsCliente((prev) =>
                              v
                                ? Array.from(new Set([...prev, c.value]))
                                : prev.filter((x) => x !== c.value),
                            )
                          }
                        />
                        <span>{labelCategoria(c.value)}</span>
                      </label>
                    );
                  })}
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Se creará una entrega permanente por cada categoría marcada.
                </p>
              </Field>
            </>
          ) : (
            <>
              <Field label="Cliente">
                <ComboboxCrear
                  options={clientesDB.map((c) => ({
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
                <Field label="Categoría">
                  <Select
                    value={categoriaTarea}
                    onValueChange={(v) => setCategoriaTarea(v as CategoriaEntrega)}
                    disabled={!clienteId}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          clienteId ? "Selecciona categoría" : "Elige cliente primero"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {categoriasCliente.length === 0 && (
                        <div className="px-2 py-1.5 text-xs text-muted-foreground">
                          Sin categorías habilitadas
                        </div>
                      )}
                      {categoriasCliente.map((c) => (
                        <SelectItem key={c} value={c}>
                          {labelCategoria(c)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
              <Field label="Título">
                <Input
                  required
                  placeholder={esRRSS ? "Plan contenido mayo 2026" : `Título de la ${tipo}`}
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                />
              </Field>
              <Field label="Descripción">
                <Textarea
                  rows={3}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                />
              </Field>
              {tipo === "tarea" && (
                <>
                  <Field label="Responsable (PM supervisor)">
                    {clienteId ? (
                      responsablesPermitidos.length === 0 ? (
                        <p className="text-xs text-amber-700">
                          Este cliente no tiene PM asignado. Asígnalo desde la ficha del cliente.
                        </p>
                      ) : (
                        <PersonaPicker
                          value={responsableId}
                          onChange={setResponsableId}
                          candidatos={responsablesPermitidos}
                          placeholder="Selecciona responsable"
                          fechaRelevante={fechaParaConflicto || undefined}
                        />
                      )
                    ) : (
                      <p className="text-xs text-muted-foreground">Elige cliente primero</p>
                    )}
                  </Field>
                  <Field label="Colaboradores (ejecutores)">
                    <ColaboradoresMultiSelect
                      equipo={equipoCompleto.filter((m) => m.activo)}
                      seleccionados={colaboradoresIds}
                      onToggle={(id) =>
                        setColaboradoresIds((prev) =>
                          prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
                        )
                      }
                    />
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Quienes realmente ejecutan la tarea. Opcional.
                    </p>
                  </Field>
                  {esRRSS && (
                    <RRSSDefaultsBloque
                      numPubs={numPubs} setNumPubs={setNumPubs}
                      distrib={distrib} setDistrib={setDistrib}
                      tipoDefault={tipoDefault} setTipoDefault={setTipoDefault}
                      formatoDefault={formatoDefault} setFormatoDefault={setFormatoDefault}
                      plataformasDefault={plataformasDefault} setPlataformasDefault={setPlataformasDefault}
                      disenoDefault={disenoDefault} setDisenoDefault={setDisenoDefault}
                      copyDefault={copyDefault} setCopyDefault={setCopyDefault}
                    />
                  )}
                  {!usarRango ? (
                    <Field label="Fecha">
                      <div className="flex items-center gap-2">
                        <Input
                          type="date"
                          value={fechaFin}
                          onChange={(e) => {
                            setFechaFin(e.target.value);
                            setFechaInicio(e.target.value);
                          }}
                          className="flex-1"
                        />
                        <button
                          type="button"
                          onClick={() => setUsarRango(true)}
                          className="text-[11px] text-muted-foreground hover:text-foreground underline underline-offset-2 shrink-0"
                        >
                          + rango de fechas
                        </button>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        Por defecto, la tarea ocupa un solo día.
                      </p>
                    </Field>
                  ) : (
                    <div>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Fecha inicio">
                          <Input
                            type="date"
                            value={fechaInicio}
                            onChange={(e) => setFechaInicio(e.target.value)}
                          />
                        </Field>
                        <Field label="Fecha fin">
                          <Input
                            type="date"
                            value={fechaFin}
                            min={fechaInicio || undefined}
                            onChange={(e) => setFechaFin(e.target.value)}
                          />
                        </Field>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setUsarRango(false);
                          setFechaInicio(fechaFin || fechaInicio);
                        }}
                        className="text-[11px] text-muted-foreground hover:text-foreground underline underline-offset-2 mt-1"
                      >
                        − usar una sola fecha
                      </button>
                    </div>
                  )}
                  <Field label="Prioridad">
                    <Select value={prioridad} onValueChange={(v) => setPrioridad(v as typeof prioridad)}>
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
            </>
          )}
          {tipo === "tarea" && (conflictoResp || conflictosColab.size > 0) && (
            <AvisoVacaciones
              conflictos={[
                ...(conflictoResp
                  ? [{
                      persona: { id: conflictoResp.user_id, nombre: nombrePorId(conflictoResp.user_id) },
                      vacacion: conflictoResp,
                      rol: "responsable",
                    }]
                  : []),
                ...Array.from(conflictosColab.entries()).map(([uid, v]) => ({
                  persona: { id: uid, nombre: nombrePorId(uid) },
                  vacacion: v,
                  rol: "colaborador",
                })),
              ]}
            />
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={cerrar} disabled={enviando}>
              Cancelar
            </Button>
            <Button type="submit" disabled={enviando}>
              {enviando ? "Guardando…" : esRRSS ? `Crear plan + ${numPubs} pubs` : "Crear"}
            </Button>
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

function hoyISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function enDiasISO(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function nombreMes() {
  return new Date().toLocaleDateString("es-ES", { month: "long", year: "numeric" });
}

async function insertColaboradores(tareaId: string, userIds: string[]) {
  if (!userIds.length) return;
  const filas = userIds.map((uid) => ({ tarea_id: tareaId, user_id: uid }));
  const { error } = await supabase.from("tarea_colaboradores").insert(filas);
  if (error) {
    // eslint-disable-next-line no-console
    console.error("[insertColaboradores]", error);
  }
  invalidateKeys(["colaboradores", tareaId], ["colaboradores"], ["mis-tareas"]);
}

function ColaboradoresMultiSelect({
  equipo,
  seleccionados,
  onToggle,
}: {
  equipo: Array<{ id: string; nombre: string; iniciales: string }>;
  seleccionados: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5 rounded-md border border-border p-2 max-h-40 overflow-auto">
      {equipo.length === 0 && (
        <span className="text-xs text-muted-foreground">Sin miembros</span>
      )}
      {equipo.map((m) => {
        const on = seleccionados.includes(m.id);
        return (
          <button
            key={m.id}
            type="button"
            onClick={() => onToggle(m.id)}
            className={cn(
              "inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs transition",
              on
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background border-border hover:bg-muted",
            )}
          >
            {m.nombre}
          </button>
        );
      })}
    </div>
  );
}

function distribuirFechas(
  inicio: string,
  fin: string,
  n: number,
  modo: "uniforme" | "mismo-dia" | "personalizada",
): string[] {
  if (modo === "mismo-dia" || modo === "personalizada" || !fin || inicio === fin) {
    return Array.from({ length: n }, () => inicio);
  }
  const inicioMs = new Date(inicio).getTime();
  const finMs = new Date(fin).getTime();
  if (n === 1) return [inicio];
  const step = (finMs - inicioMs) / (n - 1);
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(inicioMs + step * i);
    return d.toISOString().slice(0, 10);
  });
}

const PLAT_META: Array<{ value: PublicacionRRSS["plataformas"][number]; label: string; Icon: React.ComponentType<{ className?: string }> }> = [
  { value: "ig", label: "Instagram", Icon: Instagram },
  { value: "fb", label: "Facebook", Icon: Facebook },
  { value: "li", label: "LinkedIn", Icon: Linkedin },
  { value: "tt", label: "TikTok", Icon: Music2 },
];

function RRSSDefaultsBloque(props: {
  numPubs: number; setNumPubs: (n: number) => void;
  distrib: "uniforme" | "mismo-dia" | "personalizada"; setDistrib: (v: "uniforme" | "mismo-dia" | "personalizada") => void;
  tipoDefault: PublicacionRRSS["tipo"]; setTipoDefault: (v: PublicacionRRSS["tipo"]) => void;
  formatoDefault: PublicacionRRSS["formato"]; setFormatoDefault: (v: PublicacionRRSS["formato"]) => void;
  plataformasDefault: PublicacionRRSS["plataformas"]; setPlataformasDefault: (v: PublicacionRRSS["plataformas"]) => void;
  disenoDefault: string; setDisenoDefault: (v: string) => void;
  copyDefault: string; setCopyDefault: (v: string) => void;
}) {
  const togglePlat = (v: PublicacionRRSS["plataformas"][number]) => {
    const set = new Set(props.plataformasDefault);
    if (set.has(v)) set.delete(v); else set.add(v);
    props.setPlataformasDefault(Array.from(set) as PublicacionRRSS["plataformas"]);
  };
  return (
    <div className="space-y-3 rounded-md border border-border p-3 bg-muted/20">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Defaults del plan
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Número de publicaciones">
          <Input type="number" min={1} max={60} value={props.numPubs}
            onChange={(e) => props.setNumPubs(Number(e.target.value) || 1)} />
        </Field>
        <Field label="Distribución">
          <Select value={props.distrib} onValueChange={(v) => props.setDistrib(v as typeof props.distrib)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="uniforme">Uniforme en el rango</SelectItem>
              <SelectItem value="mismo-dia">Todas el mismo día</SelectItem>
              <SelectItem value="personalizada">Personalizada (editar después)</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Tipo por defecto">
          <Select value={props.tipoDefault} onValueChange={(v) => props.setTipoDefault(v as PublicacionRRSS["tipo"])}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {(["post", "reel", "carrusel", "story"] as const).map((t) => (
                <SelectItem key={t} value={t}>{TIPO_LABEL[t]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Formato por defecto">
          <Select value={props.formatoDefault} onValueChange={(v) => props.setFormatoDefault(v as PublicacionRRSS["formato"])}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {(["solo_copy", "copy_imagen", "solo_imagen", "slide"] as const).map((f) => (
                <SelectItem key={f} value={f}>{FORMATO_LABEL[f]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>
      <Field label="Plataformas por defecto">
        <div className="flex flex-wrap gap-1.5">
          {PLAT_META.map(({ value, label, Icon }) => {
            const on = props.plataformasDefault.includes(value);
            return (
              <button key={value} type="button" onClick={() => togglePlat(value)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium transition",
                  on ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border hover:bg-muted",
                )}
              >
                <Icon className="h-3 w-3" /> {label}
              </button>
            );
          })}
        </div>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Responsable diseño (opcional)">
          <PersonaPicker value={props.disenoDefault || undefined} onChange={props.setDisenoDefault} placeholder="—" />
        </Field>
        <Field label="Responsable copy (opcional)">
          <PersonaPicker value={props.copyDefault || undefined} onChange={props.setCopyDefault} placeholder="—" />
        </Field>
      </div>
    </div>
  );
}
