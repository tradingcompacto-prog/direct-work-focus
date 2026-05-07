import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link } from "@tanstack/react-router";
import { useClientes } from "@/lib/queries";
import { PROYECTOS_MOCK, ENTREGAS_MOCK } from "@/lib/mock-tareas";
import { PersonaChip } from "@/components/PersonaChip";
import { cn } from "@/lib/utils";

const saludColor = { verde: "bg-green-500", amarillo: "bg-amber-500", rojo: "bg-red-500" };

export function ClientesTabla() {
  const { data = [] } = useClientes();
  return (
    <div className="card-soft overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead>Sector</TableHead>
            <TableHead>PM</TableHead>
            <TableHead>Proyectos</TableHead>
            <TableHead>Entregas activas</TableHead>
            <TableHead>Salud</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((c) => (
            <TableRow key={c.id} className="cursor-pointer">
              <TableCell className="font-medium">
                <Link to="/clientes/$id" params={{ id: c.id }} className="hover:underline">
                  {c.nombre}
                </Link>
              </TableCell>
              <TableCell>{c.sector}</TableCell>
              <TableCell>
                <PersonaChip id={c.pm_id} size="xs" />
              </TableCell>
              <TableCell>{PROYECTOS_MOCK.filter((p) => p.cliente_id === c.id).length}</TableCell>
              <TableCell>
                {ENTREGAS_MOCK.filter((e) => e.cliente_id === c.id && e.estado === "en_curso").length}
              </TableCell>
              <TableCell>
                <span className={cn("inline-block h-2.5 w-2.5 rounded-full", saludColor[c.salud])} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
