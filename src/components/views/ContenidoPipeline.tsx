import { POSTS_MOCK, ESTADO_LABEL, CANAL_COLOR, CANAL_LABEL, type EstadoPost } from "@/lib/mock-contenido";
import { clientePorId } from "@/lib/mock-tareas";
import { PersonaChip } from "@/components/PersonaChip";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

const COLUMNAS: EstadoPost[] = ["idea", "redaccion", "diseno", "revision", "programado", "publicado"];

export function ContenidoPipeline() {
  return (
    <div className="space-y-4 anim-in">
      <h1 className="text-2xl font-semibold tracking-tight">Pipeline de contenido</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {COLUMNAS.map((col) => {
          const posts = POSTS_MOCK.filter((p) => p.estado === col);
          return (
            <div key={col} className="card-soft p-2 flex flex-col gap-2 min-h-[200px]">
              <div className="flex items-center justify-between px-1.5 pt-0.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{ESTADO_LABEL[col]}</span>
                <span className="text-[10px] tabular-nums text-muted-foreground">{posts.length}</span>
              </div>
              <div className="space-y-1.5">
                {posts.map((p) => (
                  <div key={p.id} className="rounded-md border border-border bg-card p-2 hover:shadow-sm transition cursor-pointer">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: CANAL_COLOR[p.canal] }} />
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{CANAL_LABEL[p.canal]}</span>
                    </div>
                    <div className="text-xs font-medium leading-snug">{p.titulo}</div>
                    <div className="text-[10px] text-muted-foreground truncate mt-0.5">{clientePorId(p.cliente_id)?.nombre}</div>
                    <div className="flex items-center justify-between mt-2">
                      <PersonaChip id={p.responsable_id} size="xs" showName={false} />
                      <span className="text-[10px] text-muted-foreground">{format(parseISO(p.fecha), "d MMM", { locale: es })}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}