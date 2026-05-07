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
import { useMisTareas } from "@/lib/queries";
import { useTareaModal } from "@/lib/tarea-modal-context";
import { ClienteLink, EntregaLink } from "@/components/EntidadLinks";
import { PersonaChip } from "@/components/PersonaChip";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Download } from "lucide-react";
import { EstadoVacio } from "@/components/EstadoVacio";
import { FiltrosBar, useFiltros } from "@/components/FiltrosBar";
import { Checkbox } from "@/components/ui/checkbox";
import { AccionesMasivasBar } from "@/components/AccionesMasivasBar";
import { toast } from "sonner";

const estadoBadge: Record<string, string> = {
  activa: "bg-blue-100 text-blue-800",
  haciendola: "bg-amber-100 text-amber-800",
  esperando: "bg-zinc-100 text-zinc-700",
  completada: "bg-green-100 text-green-800",
};

export function MisTareasTabla() {
  const { data: tareas = [] } = useMisTareas();
  const { abrir } = useTareaModal();
  const [f, setF, resetF] = useFiltros("sa.filtros.misTareas");
  const [sel, setSel] = React.useState<Set<string>>(new Set());

  const filtered = tareas.filter((t) => {
    if (f.q && !t.titulo.toLowerCase().includes(f.q.toLowerCase())) return false;
    if (f.estado && t.estado !== f.estado) return false;
    if (f.cliente && t.cliente_id !== f.cliente) return false;
    if (f.responsable && t.responsable_id !== f.responsable) return false;
    return true;
  });

  const toggle = (id: string) =>
    setSel((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const allSelected = filtered.length > 0 && filtered.every((t) => sel.has(t.id));

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <FiltrosBar
          state={f}
          onChange={setF}
          onReset={resetF}
          placeholder="Buscar tareas…"
          estados={[
            { value: "activa", label: "Activa" },
            { value: "haciendola", label: "Haciéndola" },
            { value: "esperando", label: "Esperando" },
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
                className={`cursor-pointer hover:bg-muted/40 transition-colors ${sel.has(t.id) ? "bg-blue-50/50" : ""}`}
              >
                <TableCell data-noopen onClick={(e) => e.stopPropagation()}>
                  <Checkbox checked={sel.has(t.id)} onCheckedChange={() => toggle(t.id)} />
                </TableCell>
                <TableCell className="font-medium">{t.titulo}</TableCell>
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
        onEliminar={() => { toast.success(`${sel.size} tareas eliminadas`); setSel(new Set()); }}
      />
    </div>
  );
}
