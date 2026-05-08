import * as React from "react";
import { Link } from "@tanstack/react-router";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { ENTREGAS_MOCK, TAREAS_MOCK } from "@/lib/mock-tareas";
import { ClienteLink } from "@/components/EntidadLinks";
import { PersonaChip } from "@/components/PersonaChip";
import { AvatarStack } from "@/components/AvatarStack";
import { colorCliente } from "@/lib/cliente-colors";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { FiltrosBar, useFiltros } from "@/components/FiltrosBar";
import { EstadoVacio } from "@/components/EstadoVacio";
import { Checkbox } from "@/components/ui/checkbox";
import { AccionesMasivasBar } from "@/components/AccionesMasivasBar";
import { toast } from "sonner";
import { startOfDay } from "date-fns";
import { useTareasVersion } from "@/lib/tareas-store";
import { labelCategoria, colorCategoria } from "@/lib/categorias";
import { cn } from "@/lib/utils";

export function MisEntregasTabla() {
  useTareasVersion();
  const [f, setF, resetF] = useFiltros("sa.filtros.misEntregas");
  const [sel, setSel] = React.useState<Set<string>>(new Set());
  const hoy = React.useMemo(() => startOfDay(new Date()), []);
  const entregas = ENTREGAS_MOCK.filter((e) => {
    if (f.q && !e.nombre.toLowerCase().includes(f.q.toLowerCase())) return false;
    if (f.cliente && e.cliente_id !== f.cliente) return false;
    if (f.responsable && e.pm_id !== f.responsable) return false;
    if (f.estado && e.estado !== f.estado) return false;
    if (f.vencidas === "1" && !(e.estado === "en_curso" && parseISO(e.fecha_fin) < hoy)) return false;
    return true;
  });
  const toggle = (id: string) =>
    setSel((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const allSelected = entregas.length > 0 && entregas.every((e) => sel.has(e.id));
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <FiltrosBar
          state={f}
          onChange={setF}
          onReset={resetF}
          placeholder="Buscar entregas…"
          estados={[
            { value: "en_curso", label: "En curso" },
            { value: "cerrada", label: "Cerrada" },
          ]}
        />
        <div className="flex-1" />
        <span className="text-xs text-muted-foreground tabular-nums">
          {entregas.length} de {ENTREGAS_MOCK.length}
        </span>
      </div>
      <div className="card-soft overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8">
              <Checkbox
                checked={allSelected}
                onCheckedChange={(v) => {
                  if (v) setSel(new Set(entregas.map((e) => e.id)));
                  else setSel(new Set());
                }}
              />
            </TableHead>
            <TableHead>Entrega</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Progreso</TableHead>
            <TableHead>Fecha entrega</TableHead>
            <TableHead>Equipo</TableHead>
            <TableHead>PM</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entregas.map((e) => {
            const ts = TAREAS_MOCK.filter((t) => t.entrega_id === e.id);
            const cerradas = ts.filter((t) => t.estado === "completada").length;
            const pct = ts.length ? Math.round((cerradas / ts.length) * 100) : 0;
            const responsables = Array.from(new Set(ts.map((t) => t.responsable_id)));
            return (
              <TableRow
                key={e.id}
                className={`cursor-pointer hover:bg-muted/40 transition-colors ${sel.has(e.id) ? "bg-blue-50/50" : ""}`}
              >
                <TableCell onClick={(ev) => ev.stopPropagation()}>
                  <Checkbox checked={sel.has(e.id)} onCheckedChange={() => toggle(e.id)} />
                </TableCell>
                <TableCell className="font-medium">
                  <Link
                    to="/entregas/$id"
                    params={{ id: e.id }}
                    className="hover:underline inline-flex items-center gap-2"
                  >
                    <span
                      className="h-2 w-2 rounded-full inline-block shrink-0"
                      style={{ backgroundColor: colorCliente(e.cliente_id).border }}
                    />
                    {e.nombre}
                  </Link>
                </TableCell>
                <TableCell>
                  <ClienteLink id={e.cliente_id} />
                </TableCell>
                <TableCell>
                  {e.categoria && (
                    <span className={cn("inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border", colorCategoria[e.categoria].badge)}>
                      <span className={cn("h-1.5 w-1.5 rounded-full", colorCategoria[e.categoria].dot)} />
                      {labelCategoria(e.categoria)}
                    </span>
                  )}
                </TableCell>
                <TableCell className="capitalize text-xs">{e.estado.replace("_", " ")}</TableCell>
                <TableCell className="min-w-[140px]">
                  <div className="flex items-center gap-2">
                    <Progress value={pct} className="h-1.5 flex-1" />
                    <span className="text-xs text-muted-foreground tabular-nums">{pct}%</span>
                  </div>
                </TableCell>
                <TableCell className="text-xs">
                  {format(parseISO(e.fecha_fin), "d MMM", { locale: es })}
                </TableCell>
                <TableCell><AvatarStack ids={responsables} size="xs" /></TableCell>
                <TableCell>
                  <PersonaChip id={e.pm_id} size="xs" />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
        {entregas.length === 0 && (
          <EstadoVacio emoji="🔍" titulo="Sin entregas" hint="Prueba a quitar los filtros." />
        )}
      </div>
      <AccionesMasivasBar
        count={sel.size}
        onClear={() => setSel(new Set())}
        onCambiarEstado={() => { toast.success(`Estado cambiado en ${sel.size} entregas`); setSel(new Set()); }}
        onReasignar={() => { toast.success(`${sel.size} entregas reasignadas`); setSel(new Set()); }}
        onExportar={() => { toast.success(`${sel.size} entregas exportadas a CSV`); }}
        onEliminar={() => { toast.success(`${sel.size} entregas eliminadas`); setSel(new Set()); }}
      />
    </div>
  );
}
