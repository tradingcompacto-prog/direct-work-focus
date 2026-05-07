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

export function MisEntregasTabla() {
  return (
    <div className="card-soft overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Entrega</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Progreso</TableHead>
            <TableHead>Fecha entrega</TableHead>
            <TableHead>Equipo</TableHead>
            <TableHead>PM</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ENTREGAS_MOCK.map((e) => {
            const ts = TAREAS_MOCK.filter((t) => t.entrega_id === e.id);
            const cerradas = ts.filter((t) => t.estado === "completada").length;
            const pct = ts.length ? Math.round((cerradas / ts.length) * 100) : 0;
            const responsables = Array.from(new Set(ts.map((t) => t.responsable_id)));
            return (
              <TableRow key={e.id} className="cursor-pointer hover:bg-muted/40 transition-colors">
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
    </div>
  );
}
