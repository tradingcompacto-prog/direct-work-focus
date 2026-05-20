import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useMisTareas,
  useTareas,
  useMisRevisiones,
} from "@/lib/queries";
import { useAuth } from "@/lib/auth";
import { useUserCaps } from "@/lib/user-caps";
import {
  AlcanceFilter,
  defaultAlcance,
  filtrarPorAlcance,
  useAlcancePersistido,
  useIncluirRevisionesPersistido,
} from "@/components/AlcanceFilter";
import { useTareaModal } from "@/lib/tarea-modal-context";
import { ClienteLink, EntregaLink } from "@/components/EntidadLinks";
import { PersonaChip } from "@/components/PersonaChip";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Download } from "lucide-react";
import { EstadoVacio } from "@/components/EstadoVacio";
import { FiltrosBar, useFiltros } from "@/components/FiltrosBar";
import { eliminarTareas } from "@/lib/tareas-store";
import { Checkbox } from "@/components/ui/checkbox";
import { AccionesMasivasBar } from "@/components/AccionesMasivasBar";
import { toast } from "sonner";
import { urgenciaTarea } from "@/lib/fechas";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const estadoBadge: Record<string, string> = {
  activa: "bg-blue-100 text-blue-800",
  haciendola: "bg-amber-100 text-amber-800",
  pausada: "bg-zinc-100 text-zinc-700",
  revision: "bg-purple-100 text-purple-800",
  completada: "bg-green-100 text-green-800",
};

export function MisTareasTabla() {
  const { user } = useAuth();
  const caps = useUserCaps();
  const [alcance, setAlcance] = useAlcancePersistido("tareas/tabla", defaultAlcance(caps));
  const [incluirRevisiones, setIncluirRevisiones] = useIncluirRevisionesPersistido("tareas/tabla");

  const { data: misTareas = [] } = useMisTareas();
  const { data: todasTareas = [] } = useTareas();
  const { data: revisionesPM = [] } = useMisRevisiones();

  const baseTareas = React.useMemo(() => {
    if (alcance === "solo-mias") return misTareas;
    return filtrarPorAlcance(todasTareas, alcance, user?.id, caps.clientesPM);
  }, [alcance, misTareas, todasTareas, user?.id, caps.clientesPM]);

  const tareas = React.useMemo(() => {
    if (!incluirRevisiones || !caps.isPM) return baseTareas;
    const ids = new Set(baseTareas.map((t) => t.id));
    const extras = revisionesPM.filter((t) => !ids.has(t.id));
    return [...baseTareas, ...extras];
  }, [baseTareas, incluirRevisiones, caps.isPM, revisionesPM]);
  const revisionPMIds = React.useMemo(
    () => new Set(revisionesPM.map((t) => t.id)),
    [revisionesPM],
  );
  const { abrir } = useTareaModal();
  const [f, setF, resetF] = useFiltros("sa.filtros.misTareas");
  const [sel, setSel] = React.useState<Set<string>>(new Set());

  const filtered = tareas.filter((t) => {
    if (f.q && !t.titulo.toLowerCase().includes(f.q.toLowerCase())) return false;
    if (f.estado) {
      if (t.estado !== f.estado) return false;
    } else if (t.estado === "completada") {
      // Por defecto ocultamos completadas salvo que se filtre por ese estado
      return false;
    }
    if (f.cliente && t.cliente_id !== f.cliente) return false;
    if (f.responsable && t.responsable_id !== f.responsable) return false;
    if (f.vencidas === "1" && urgenciaTarea(t.fecha_fin_min, t.fecha_fin_max) !== "rojo") return false;
    return true;
  });

  const toggle = (id: string) =>
    setSel((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const allSelected = filtered.length > 0 && filtered.every((t) => sel.has(t.id));

  return (
    <TooltipProvider delayDuration={150}>
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <AlcanceFilter value={alcance} onChange={setAlcance} />
        {caps.isPM && (
          <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
            <Checkbox
              checked={incluirRevisiones}
              onCheckedChange={(v) => setIncluirRevisiones(!!v)}
            />
            Incluir revisiones pendientes
          </label>
        )}
        <FiltrosBar
          state={f}
          onChange={setF}
          onReset={resetF}
          placeholder="Buscar tareas…"
          estados={[
            { value: "activa", label: "Activa" },
            { value: "haciendola", label: "Haciéndola" },
            { value: "pausada", label: "Pausada" },
            { value: "revision", label: "En revisión" },
            { value: "completada", label: "Completada" },
          ]}
        />
        <div className="flex-1" />
        <span className="text-xs text-muted-foreground tabular-nums">
          {filtered.length} de {tareas.length}
        </span>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Download className="h-3.5 w-3.5" /> CSV
        </Button>
      </div>
      <div className="card-soft overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={(v) => {
                    if (v) setSel(new Set(filtered.map((t) => t.id)));
                    else setSel(new Set());
                  }}
                />
              </TableHead>
              <TableHead>Tarea</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Entrega</TableHead>
              <TableHead>Responsable</TableHead>
              <TableHead>Solicitante</TableHead>
              <TableHead>Fecha fin</TableHead>
              <TableHead>Prioridad</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((t) => (
              <TableRow
                key={t.id}
                onClick={(e) => {
                  if ((e.target as HTMLElement).closest("[data-noopen]")) return;
                  abrir(t.id);
                }}
                className={cn(
                  "cursor-pointer hover:bg-muted/40 transition-colors",
                  sel.has(t.id) && "bg-blue-50/50",
                  t.devuelta_at && "bg-orange-50/60 border-l-4 border-orange-500",
                  incluirRevisiones && caps.isPM && revisionPMIds.has(t.id) &&
                    "bg-blue-50/40 border-l-4 border-blue-500",
                )}
              >
                <TableCell data-noopen onClick={(e) => e.stopPropagation()}>
                  <Checkbox checked={sel.has(t.id)} onCheckedChange={() => toggle(t.id)} />
                </TableCell>
                <TableCell className="font-medium">
                  <span className="inline-flex items-center gap-1.5">
                    {t.titulo}
                    {t.devuelta_at && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="inline-flex items-center gap-0.5 rounded bg-orange-100 text-orange-800 px-1.5 py-0.5 text-[10px] font-semibold">
                            ↩ Devuelta
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          {t.motivo_devolucion ?? "Sin motivo"}
                        </TooltipContent>
                      </Tooltip>
                    )}
                    {incluirRevisiones && caps.isPM && revisionPMIds.has(t.id) && (
                      <span className="inline-flex items-center gap-0.5 rounded bg-blue-100 text-blue-800 px-1.5 py-0.5 text-[10px] font-semibold">
                        👁 Por revisar
                      </span>
                    )}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={estadoBadge[t.estado]}>
                    {t.estado}
                  </Badge>
                </TableCell>
                <TableCell>
                  <ClienteLink id={t.cliente_id} />
                </TableCell>
                <TableCell>
                  <EntregaLink id={t.entrega_id} />
                </TableCell>
                <TableCell>
                  <PersonaChip id={t.responsable_id} size="xs" />
                </TableCell>
                <TableCell>
                  <PersonaChip id={t.solicitante_id} size="xs" />
                </TableCell>
                <TableCell className="text-xs">
                  {format(parseISO(t.fecha_fin_max), "d MMM", { locale: es })}
                </TableCell>
                <TableCell className="capitalize text-xs">{t.prioridad}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filtered.length === 0 && (
          <EstadoVacio
            emoji="🔍"
            titulo="Nada por aquí"
            hint={f.q || f.estado || f.cliente || f.responsable ? "Prueba a quitar los filtros." : "No tienes tareas activas."}
          />
        )}
      </div>
      <AccionesMasivasBar
        count={sel.size}
        onClear={() => setSel(new Set())}
        onCambiarEstado={() => { toast.success(`Estado cambiado en ${sel.size} tareas`); setSel(new Set()); }}
        onReasignar={() => { toast.success(`${sel.size} tareas reasignadas`); setSel(new Set()); }}
        onExportar={() => { toast.success(`${sel.size} tareas exportadas a CSV`); }}
        onEliminar={() => { eliminarTareas(Array.from(sel)); setSel(new Set()); }}
      />
    </div>
    </TooltipProvider>
  );
}
