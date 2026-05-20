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
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useMisDevoluciones } from "@/lib/queries";
import { useTareaModal } from "@/lib/tarea-modal-context";
import { ClienteLink, EntregaLink } from "@/components/EntidadLinks";
import { EstadoVacio } from "@/components/EstadoVacio";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/mis-devoluciones")({
  component: MisDevolucionesPage,
});

function MisDevolucionesPage() {
  const { data: tareas = [], isLoading } = useMisDevoluciones();
  const { abrir } = useTareaModal();

  return (
    <TooltipProvider delayDuration={150}>
      <div className="p-6 space-y-4">
        <header>
          <h1 className="text-2xl font-bold">Mis devoluciones</h1>
          <p className="text-sm text-muted-foreground">
            Tareas que te devolvió un PM o director para corregir antes de enviar de nuevo a revisión.
          </p>
        </header>
        <div className="card-soft overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tarea</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Entrega</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead>Devuelta</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tareas.map((t) => (
                <TableRow
                  key={t.id}
                  onClick={() => abrir(t.id)}
                  className={cn(
                    "cursor-pointer hover:bg-muted/40 transition-colors",
                    "bg-orange-50/60 border-l-4 border-orange-500",
                  )}
                >
                  <TableCell className="font-medium">{t.titulo}</TableCell>
                  <TableCell><ClienteLink id={t.cliente_id} /></TableCell>
                  <TableCell><EntregaLink id={t.entrega_id} /></TableCell>
                  <TableCell className="max-w-[280px]">
                    {t.motivo_devolucion ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="truncate block text-xs text-orange-900">
                            {t.motivo_devolucion}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-sm">
                          {t.motivo_devolucion}
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {t.devuelta_at
                      ? format(parseISO(t.devuelta_at), "d MMM HH:mm", { locale: es })
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                      {t.estado}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!isLoading && tareas.length === 0 && (
            <EstadoVacio
              emoji="🎉"
              titulo="Sin devoluciones"
              hint="Nadie te ha devuelto ninguna tarea. Sigue así."
            />
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}