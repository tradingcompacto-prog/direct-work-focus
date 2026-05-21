import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link } from "@tanstack/react-router";
import { useClientes, useProyectos, useEntregas } from "@/lib/queries";
import { PersonaChip } from "@/components/PersonaChip";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowUpDown } from "lucide-react";
import { PRIORIDAD_COLOR, PRIORIDAD_LABEL } from "@/types/database";

const saludColor = { verde: "bg-green-500", amarillo: "bg-amber-500", rojo: "bg-red-500" };

export function ClientesTabla() {
  const { data = [] } = useClientes();
  const { data: proyectos = [] } = useProyectos();
  const { data: entregas = [] } = useEntregas();
  const [busqueda, setBusqueda] = React.useState("");
  const [filtroPrio, setFiltroPrio] = React.useState<"todas" | 1 | 2 | 3>("todas");
  const [sortBy, setSortBy] = React.useState<"prioridad" | "nombre">("prioridad");

  const filtrados = React.useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    let arr = data.filter((c) => {
      if (filtroPrio !== "todas" && (c.prioridad ?? 2) !== filtroPrio) return false;
      if (!q) return true;
      return (
        c.nombre.toLowerCase().includes(q) ||
        (c.sector ?? "").toLowerCase().includes(q)
      );
    });
    arr = [...arr].sort((a, b) => {
      if (sortBy === "prioridad") {
        const pa = a.prioridad ?? 2;
        const pb = b.prioridad ?? 2;
        if (pa !== pb) return pa - pb;
      }
      return a.nombre.localeCompare(b.nombre);
    });
    return arr;
  }, [data, busqueda, filtroPrio, sortBy]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar cliente o sector…"
            className="pl-8"
          />
        </div>
        <div className="inline-flex rounded-md border border-border overflow-hidden text-sm">
          {(["todas", 1, 2, 3] as const).map((v) => (
            <button
              key={String(v)}
              onClick={() => setFiltroPrio(v)}
              className={cn("px-3 py-1.5", filtroPrio === v ? "bg-foreground text-background" : "")}
            >
              {v === "todas" ? "Todas" : PRIORIDAD_LABEL[v]}
            </button>
          ))}
        </div>
      </div>
      <div className="card-soft overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead>Sector</TableHead>
            <TableHead>PM</TableHead>
            <TableHead>
              <button
                onClick={() => setSortBy(sortBy === "prioridad" ? "nombre" : "prioridad")}
                className="inline-flex items-center gap-1 hover:text-foreground"
              >
                Prioridad <ArrowUpDown className="h-3 w-3" />
              </button>
            </TableHead>
            <TableHead>Proyectos</TableHead>
            <TableHead>Entregas activas</TableHead>
            <TableHead>Salud</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtrados.map((c) => (
            <TableRow key={c.id} className="cursor-pointer hover:bg-muted/40 transition-colors">
              <TableCell className="font-medium">
                <Link to="/clientes/$id" params={{ id: c.id }} className="hover:underline">
                  {c.nombre}
                </Link>
              </TableCell>
              <TableCell>{c.sector}</TableCell>
              <TableCell>
                <PersonaChip id={c.pm_id} size="xs" />
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={cn("border", PRIORIDAD_COLOR[c.prioridad ?? 2])}>
                  {PRIORIDAD_LABEL[c.prioridad ?? 2]}
                </Badge>
              </TableCell>
              <TableCell>{proyectos.filter((p) => p.cliente_id === c.id).length}</TableCell>
              <TableCell>
                {entregas.filter((e) => e.cliente_id === c.id && e.estado === "en_curso").length}
              </TableCell>
              <TableCell>
                <span className={cn("inline-block h-2.5 w-2.5 rounded-full", saludColor[c.salud] ?? "bg-zinc-300")} />
              </TableCell>
            </TableRow>
          ))}
          {filtrados.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-6 text-sm text-muted-foreground">
                Sin resultados.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      </div>
    </div>
  );
}
