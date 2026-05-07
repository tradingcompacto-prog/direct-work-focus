import { PUBLICACIONES_MOCK, PLATAFORMA_LABEL } from "@/lib/mock-contenido";
import { clientePorId } from "@/lib/mock-tareas";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function ContenidoPerformance() {
  const publicadas = PUBLICACIONES_MOCK.filter((p) => p.metricas).slice(0, 50);
  const top = [...publicadas].sort((a,b)=> (b.metricas!.interacciones)-(a.metricas!.interacciones)).slice(0,5);
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Performance</h1>
      <div className="card-soft p-4">
        <h2 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Top performers semana</h2>
        <ul className="space-y-1 text-sm">
          {top.map((p) => (
            <li key={p.id} className="flex justify-between">
              <span>{clientePorId(p.cliente_id)?.nombre} · {p.tipo}</span>
              <span className="tabular-nums text-muted-foreground">{p.metricas!.interacciones} int · CTR {p.metricas!.ctr}%</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="card-soft overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead><TableHead>Tipo</TableHead><TableHead>Plataformas</TableHead>
              <TableHead>Fecha</TableHead><TableHead className="text-right">Impr.</TableHead>
              <TableHead className="text-right">Alcance</TableHead><TableHead className="text-right">Inter.</TableHead>
              <TableHead className="text-right">CTR</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {publicadas.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{clientePorId(p.cliente_id)?.nombre}</TableCell>
                <TableCell>{p.tipo}</TableCell>
                <TableCell className="text-xs">{p.plataformas.map(pl=>PLATAFORMA_LABEL[pl]).join(", ")}</TableCell>
                <TableCell className="text-xs">{p.fecha}</TableCell>
                <TableCell className="text-right tabular-nums">{p.metricas!.impresiones}</TableCell>
                <TableCell className="text-right tabular-nums">{p.metricas!.alcance}</TableCell>
                <TableCell className="text-right tabular-nums">{p.metricas!.interacciones}</TableCell>
                <TableCell className="text-right tabular-nums">{p.metricas!.ctr}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}