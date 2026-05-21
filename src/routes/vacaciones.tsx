import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Plus, Check, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PersonaChip } from "@/components/PersonaChip";
import { SolicitarVacacionesDialog } from "@/components/SolicitarVacacionesDialog";
import { RechazarVacacionesDialog } from "@/components/RechazarVacacionesDialog";
import { useUserCaps } from "@/lib/user-caps";
import {
  useMisVacaciones,
  useVacacionesPorAprobar,
  aprobarVacacion,
  cancelarVacacion,
  diasEntre,
} from "@/lib/vacaciones-store";
import { ESTADO_VAC_COLOR, ESTADO_VAC_LABEL, type Vacacion } from "@/types/database";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { VistaHeader } from "@/components/VistaHeader";

export const Route = createFileRoute("/vacaciones")({
  component: VacacionesPage,
});

function VacacionesPage() {
  const caps = useUserCaps();
  const { data: mias = [] } = useMisVacaciones();
  const { data: porAprobar = [] } = useVacacionesPorAprobar();

  const [openSolicitar, setOpenSolicitar] = React.useState(false);
  const [rechazarId, setRechazarId] = React.useState<string | null>(null);

  const onAprobar = async (id: string) => {
    try {
      await aprobarVacacion(id);
      toast.success("Solicitud aprobada");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al aprobar");
    }
  };

  const onCancelar = async (id: string) => {
    if (!confirm("¿Cancelar esta solicitud?")) return;
    try {
      await cancelarVacacion(id);
      toast.success("Solicitud cancelada");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al cancelar");
    }
  };

  return (
    <div className="p-6 space-y-4">
      <VistaHeader
        titulo="Vacaciones"
        leyenda="Solicitar vacaciones y, si eres director, aprobar las del equipo."
        acciones={
          <Button onClick={() => setOpenSolicitar(true)}>
            <Plus className="h-4 w-4 mr-1" /> Solicitar vacaciones
          </Button>
        }
      />

      <Tabs defaultValue="mias">
        <TabsList>
          <TabsTrigger value="mias">Mis vacaciones</TabsTrigger>
          {caps.isDirector && (
            <TabsTrigger value="por-aprobar">
              Por aprobar
              {porAprobar.length > 0 && (
                <span className="ml-1.5 text-[10px] tabular-nums font-semibold rounded px-1.5 py-0.5 bg-amber-100 text-amber-700">
                  {porAprobar.length}
                </span>
              )}
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="mias" className="mt-4">
          <div className="card-soft overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fechas</TableHead>
                  <TableHead>Días</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Aprobado por</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mias.map((v) => (
                  <FilaMia
                    key={v.id}
                    v={v}
                    onCancelar={onCancelar}
                  />
                ))}
                {mias.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-sm text-muted-foreground">
                      Aún no has solicitado vacaciones.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {caps.isDirector && (
          <TabsContent value="por-aprobar" className="mt-4">
            <div className="card-soft overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Persona</TableHead>
                    <TableHead>Fechas</TableHead>
                    <TableHead>Días</TableHead>
                    <TableHead>Motivo</TableHead>
                    <TableHead>Solicitado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {porAprobar.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell>
                        <PersonaChip id={v.user_id} size="sm" />
                      </TableCell>
                      <TableCell className="text-sm whitespace-nowrap">
                        {format(parseISO(v.fecha_inicio), "d MMM", { locale: es })} → {format(parseISO(v.fecha_fin), "d MMM yyyy", { locale: es })}
                      </TableCell>
                      <TableCell className="tabular-nums">{diasEntre(v.fecha_inicio, v.fecha_fin)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                        {v.motivo ?? "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {format(parseISO(v.created_at), "d MMM yyyy", { locale: es })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button size="sm" variant="outline" onClick={() => onAprobar(v.id)}>
                            <Check className="h-3.5 w-3.5 mr-1" /> Aprobar
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setRechazarId(v.id)}>
                            <X className="h-3.5 w-3.5 mr-1" /> Rechazar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {porAprobar.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-sm text-muted-foreground">
                        Sin solicitudes pendientes.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        )}
      </Tabs>

      <SolicitarVacacionesDialog open={openSolicitar} onOpenChange={setOpenSolicitar} />
      <RechazarVacacionesDialog
        open={!!rechazarId}
        onOpenChange={(v) => { if (!v) setRechazarId(null); }}
        vacacionId={rechazarId}
      />
    </div>
  );
}

function FilaMia({ v, onCancelar }: { v: Vacacion; onCancelar: (id: string) => void }) {
  return (
    <TableRow>
      <TableCell className="text-sm whitespace-nowrap">
        {format(parseISO(v.fecha_inicio), "d MMM", { locale: es })} → {format(parseISO(v.fecha_fin), "d MMM yyyy", { locale: es })}
      </TableCell>
      <TableCell className="tabular-nums">{diasEntre(v.fecha_inicio, v.fecha_fin)}</TableCell>
      <TableCell>
        <div className="flex items-center gap-1.5">
          <Badge variant="outline" className={cn("border", ESTADO_VAC_COLOR[v.estado])}>
            {ESTADO_VAC_LABEL[v.estado]}
          </Badge>
          {v.estado === "rechazada" && v.motivo_rechazo && (
            <span title={v.motivo_rechazo}>
              <AlertCircle className="h-3.5 w-3.5 text-red-600" />
            </span>
          )}
        </div>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
        {v.estado === "rechazada" && v.motivo_rechazo ? (
          <span className="text-red-700">Rechazo: {v.motivo_rechazo}</span>
        ) : (
          v.motivo ?? "—"
        )}
      </TableCell>
      <TableCell>
        {v.aprobado_por ? <PersonaChip id={v.aprobado_por} size="xs" /> : "—"}
      </TableCell>
      <TableCell className="text-right">
        {v.estado === "pendiente" && (
          <Button size="sm" variant="outline" onClick={() => onCancelar(v.id)}>
            Cancelar
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
}