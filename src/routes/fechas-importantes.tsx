import * as React from "react";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Plus, Pencil, Trash2, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUserCaps } from "@/lib/user-caps";
import { useAuth } from "@/lib/auth";
import { useClientes } from "@/lib/queries";
import {
  useFechasImportantes,
  removeFechaImportante,
} from "@/lib/fechas-importantes-store";
import { FechaImportanteDialog } from "@/components/FechaImportanteDialog";
import { PersonaChip } from "@/components/PersonaChip";
import {
  TIPO_FECHA_COLOR,
  TIPO_FECHA_LABEL,
  type FechaImportante,
} from "@/types/database";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { VistaHeader } from "@/components/VistaHeader";

export const Route = createFileRoute("/fechas-importantes")({
  component: FechasImportantesPage,
});

function FechasImportantesPage() {
  const caps = useUserCaps();
  const { user } = useAuth();
  const { data: fechas = [] } = useFechasImportantes();
  const { data: clientes = [] } = useClientes();
  const [ambito, setAmbito] = React.useState<"todas" | "globales" | "cliente">("todas");
  const [tipoFiltro, setTipoFiltro] = React.useState<"todos" | FechaImportante["tipo"]>("todos");
  const [openDialog, setOpenDialog] = React.useState(false);
  const [editing, setEditing] = React.useState<FechaImportante | null>(null);

  if (!(caps.isPM || caps.isDirector)) {
    return <Navigate to="/" replace />;
  }

  const clientePorId = React.useMemo(() => {
    const m = new Map(clientes.map((c) => [c.id, c.nombre]));
    return (id?: string | null) => (id ? m.get(id) ?? "—" : null);
  }, [clientes]);

  const filtradas = fechas.filter((f) => {
    if (ambito === "globales" && f.cliente_id) return false;
    if (ambito === "cliente" && !f.cliente_id) return false;
    if (tipoFiltro !== "todos" && f.tipo !== tipoFiltro) return false;
    return true;
  });

  const onEliminar = async (id: string) => {
    if (!confirm("¿Eliminar esta fecha?")) return;
    try {
      await removeFechaImportante(id);
      toast.success("Fecha eliminada");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al eliminar");
    }
  };

  return (
    <div className="p-6 space-y-4">
      <VistaHeader
        titulo="Fechas importantes"
        leyenda="Días señalados, festivos, lanzamientos y campañas. Pueden ser globales o de un cliente concreto."
        acciones={
          <Button onClick={() => { setEditing(null); setOpenDialog(true); }}>
            <Plus className="h-4 w-4 mr-1" /> Añadir fecha
          </Button>
        }
      />

      <div className="flex flex-wrap gap-2">
        <div className="inline-flex rounded-md border border-border overflow-hidden text-sm">
          {(["todas", "globales", "cliente"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setAmbito(v)}
              className={cn(
                "px-3 py-1.5 capitalize",
                ambito === v ? "bg-foreground text-background" : "",
              )}
            >
              {v === "todas" ? "Todas" : v === "globales" ? "Globales" : "Por cliente"}
            </button>
          ))}
        </div>
        <div className="inline-flex rounded-md border border-border overflow-hidden text-sm">
          <button
            onClick={() => setTipoFiltro("todos")}
            className={cn("px-3 py-1.5", tipoFiltro === "todos" ? "bg-foreground text-background" : "")}
          >
            Todos
          </button>
          {(Object.keys(TIPO_FECHA_LABEL) as FechaImportante["tipo"][]).map((t) => (
            <button
              key={t}
              onClick={() => setTipoFiltro(t)}
              className={cn("px-3 py-1.5", tipoFiltro === t ? "bg-foreground text-background" : "")}
            >
              {TIPO_FECHA_LABEL[t]}
            </button>
          ))}
        </div>
      </div>

      <div className="card-soft overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Creador</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtradas.map((f) => {
              const puedeEditar = caps.isDirector || (user && f.created_by === user.id);
              const cliNombre = clientePorId(f.cliente_id);
              return (
                <TableRow key={f.id}>
                  <TableCell className="whitespace-nowrap text-sm">
                    {format(parseISO(f.fecha_inicio), "d MMM yyyy", { locale: es })}
                    {f.fecha_fin && f.fecha_fin !== f.fecha_inicio && (
                      <> → {format(parseISO(f.fecha_fin), "d MMM", { locale: es })}</>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{f.titulo}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("border", TIPO_FECHA_COLOR[f.tipo])}>
                      {TIPO_FECHA_LABEL[f.tipo]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {f.cliente_id ? (
                      <span className="text-sm">{cliNombre}</span>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        <Globe className="h-3 w-3 mr-1" /> Global
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                    {f.descripcion ?? "—"}
                  </TableCell>
                  <TableCell>
                    {f.created_by ? <PersonaChip id={f.created_by} size="xs" /> : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    {puedeEditar && (
                      <div className="flex justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => { setEditing(f); setOpenDialog(true); }}
                          aria-label="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => onEliminar(f.id)}
                          aria-label="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            {filtradas.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-sm text-muted-foreground">
                  Sin fechas con los filtros actuales.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <FechaImportanteDialog
        open={openDialog}
        onOpenChange={(v) => { setOpenDialog(v); if (!v) setEditing(null); }}
        fecha={editing}
      />
    </div>
  );
}