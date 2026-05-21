import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  AlcanceFilter,
  defaultAlcance,
  filtrarPorAlcance,
  useAlcancePersistido,
} from "@/components/AlcanceFilter";
import { useMisRevisiones } from "@/lib/queries";
import { useUserCaps } from "@/lib/user-caps";
import { useAuth } from "@/lib/auth";
import { useTareaModal } from "@/lib/tarea-modal-context";
import { ClienteLink, EntregaLink } from "@/components/EntidadLinks";
import { PersonaChip } from "@/components/PersonaChip";
import { EstadoVacio } from "@/components/EstadoVacio";
import { DevolverTareaDialog } from "@/components/DevolverTareaDialog";
import { completarTarea } from "@/lib/tareas-store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { VistaHeader } from "@/components/VistaHeader";

export const Route = createFileRoute("/mis-revisiones")({
  component: MisRevisionesPage,
});

function MisRevisionesPage() {
  const { user } = useAuth();
  const caps = useUserCaps();
  const [alcance, setAlcance] = useAlcancePersistido(
    "mis-revisiones",
    defaultAlcance({ isDirector: false, isPM: caps.isPM }),
  );
  const { data: misRev = [] } = useMisRevisiones();
  const base = misRev;
  const tareas = React.useMemo(
    () => filtrarPorAlcance(base, alcance, user?.id, caps.clientesPM),
    [base, alcance, user?.id, caps.clientesPM],
  );
  const { abrir } = useTareaModal();
  const [sel, setSel] = React.useState<Set<string>>(new Set());
  const [devOpen, setDevOpen] = React.useState(false);

  const toggle = (id: string) =>
    setSel((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  const allSel = tareas.length > 0 && tareas.every((t) => sel.has(t.id));

  const aprobar = async () => {
    if (sel.size === 0) return;
    await Promise.all(Array.from(sel).map((id) => completarTarea(id)));
    toast.success(`${sel.size} tareas aprobadas`);
    setSel(new Set());
  };

  return (
    <div className="p-6 space-y-4">
      <VistaHeader
        titulo="Mis revisiones"
        leyenda="Tareas en revisión de los proyectos donde soy Project Manager."
        acciones={<AlcanceFilter value={alcance} onChange={setAlcance} hideTodo={true} />}
      />
      <div className="card-soft overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8">
                <Checkbox
                  checked={allSel}
                  onCheckedChange={(v) =>
                    setSel(v ? new Set(tareas.map((t) => t.id)) : new Set())
                  }
                />
              </TableHead>
              <TableHead>Tarea</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Entrega</TableHead>
              <TableHead>Responsable</TableHead>
              <TableHead>Entrega máx</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tareas.map((t) => (
              <TableRow
                key={t.id}
                onClick={(e) => {
                  if ((e.target as HTMLElement).closest("[data-noopen]")) return;
                  abrir(t.id);
                }}
                className={cn(
                  "cursor-pointer hover:bg-muted/40 transition-colors",
                  sel.has(t.id) && "bg-blue-50/50",
                  "border-l-4 border-purple-500",
                )}
              >
                <TableCell data-noopen onClick={(e) => e.stopPropagation()}>
                  <Checkbox checked={sel.has(t.id)} onCheckedChange={() => toggle(t.id)} />
                </TableCell>
                <TableCell className="font-medium">{t.titulo}</TableCell>
                <TableCell><ClienteLink id={t.cliente_id} /></TableCell>
                <TableCell><EntregaLink id={t.entrega_id} /></TableCell>
                <TableCell><PersonaChip id={t.responsable_id} size="xs" /></TableCell>
                <TableCell className="text-xs">
                  {format(parseISO(t.fecha_fin_max), "d MMM", { locale: es })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {tareas.length === 0 && (
          <EstadoVacio
            emoji="✅"
            titulo="Nada por revisar"
            hint="No hay tareas en revisión en tus proyectos."
          />
        )}
      </div>
      {sel.size > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 card-soft shadow-lg border border-border bg-background px-4 py-2 flex items-center gap-3">
          <span className="text-sm font-medium">{sel.size} seleccionadas</span>
          <Button size="sm" variant="ghost" onClick={() => setSel(new Set())}>
            Quitar
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-orange-300 text-orange-700 hover:bg-orange-50"
            onClick={() => setDevOpen(true)}
          >
            Devolver
          </Button>
          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={aprobar}>
            Aprobar
          </Button>
        </div>
      )}
      <DevolverTareaDialog
        open={devOpen}
        onOpenChange={setDevOpen}
        tareaIds={Array.from(sel)}
        onSuccess={() => setSel(new Set())}
      />
    </div>
  );
}