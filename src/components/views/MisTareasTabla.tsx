import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
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

const estadoBadge: Record<string, string> = {
  activa: "bg-blue-100 text-blue-800",
  haciendola: "bg-amber-100 text-amber-800",
  esperando: "bg-zinc-100 text-zinc-700",
  completada: "bg-green-100 text-green-800",
};

export function MisTareasTabla() {
  const { data: tareas = [] } = useMisTareas();
  const { abrir } = useTareaModal();
  const [q, setQ] = React.useState("");
  const [estado, setEstado] = React.useState<string>("");

  const filtered = tareas.filter((t) => {
    if (q && !t.titulo.toLowerCase().includes(q.toLowerCase())) return false;
    if (estado && t.estado !== estado) return false;
    return true;
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <Input
          placeholder="Buscar tareas..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="max-w-xs"
        />
        <select
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
          className="text-sm border border-border rounded-md px-2 py-1.5 bg-background"
        >
          <option value="">Todos los estados</option>
          <option value="activa">Activa</option>
          <option value="haciendola">Haciéndola</option>
          <option value="esperando">Esperando</option>
          <option value="completada">Completada</option>
        </select>
        <div className="flex-1" />
        <Button variant="outline" size="sm" className="gap-1.5">
          <Download className="h-3.5 w-3.5" /> CSV
        </Button>
      </div>
      <div className="card-soft overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
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
                onClick={() => abrir(t.id)}
                className="cursor-pointer"
              >
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
            hint={q || estado ? "Prueba a quitar los filtros." : "No tienes tareas activas."}
          />
        )}
      </div>
    </div>
  );
}
