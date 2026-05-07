import { PUBLICACIONES_MOCK, ESTADO_LABEL, type EstadoPub } from "@/lib/mock-contenido";
import { clientePorId } from "@/lib/mock-tareas";
import { PersonaChip } from "@/components/PersonaChip";
import { colorCliente } from "@/lib/cliente-colors";

const COLS: EstadoPub[] = ["idea","diseno","copy","revision","listo","programado","publicado"];

export function ContenidoPipeline() {
  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">Pipeline de producción</h1>
      <div className="grid grid-cols-7 gap-2 overflow-x-auto">
        {COLS.map((col) => {
          const items = PUBLICACIONES_MOCK.filter((p) => p.estado === col);
          return (
            <div key={col} className="bg-muted/30 rounded-md p-2 min-w-[160px]">
              <div className="text-[11px] font-semibold uppercase text-muted-foreground mb-2">
                {ESTADO_LABEL[col]} <span className="text-muted-foreground/60">({items.length})</span>
              </div>
              <div className="space-y-1.5">
                {items.map((p) => {
                  const c = clientePorId(p.cliente_id);
                  const col2 = colorCliente(p.cliente_id);
                  return (
                    <div key={p.id} className="card-soft p-2 border-l-4" style={{ borderLeftColor: col2.border }}>
                      <div className="text-xs font-medium truncate">{c?.nombre}</div>
                      <div className="text-[10px] text-muted-foreground">{p.tipo} · {p.fecha} {p.hora}</div>
                      <div className="flex items-center gap-1 mt-1">
                        <PersonaChip id={p.responsable_diseno} size="xs" showName={false} />
                        <PersonaChip id={p.responsable_copy} size="xs" showName={false} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}