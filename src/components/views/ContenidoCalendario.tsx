import { useMemo, useState } from "react";
import { addDays, format, isSameDay, parseISO, startOfMonth, startOfWeek, endOfMonth, endOfWeek } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { POSTS_MOCK, CANAL_COLOR, CANAL_LABEL } from "@/lib/mock-contenido";
import { clientePorId } from "@/lib/mock-tareas";
import { cn } from "@/lib/utils";

export function ContenidoCalendario() {
  const [cursor, setCursor] = useState(() => new Date());
  const inicio = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 });
  const fin = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 });
  const dias = useMemo(() => {
    const out: Date[] = [];
    let d = inicio;
    while (d <= fin) {
      out.push(d);
      d = addDays(d, 1);
    }
    return out;
  }, [inicio, fin]);

  const postsPorDia = useMemo(() => {
    const m = new Map<string, typeof POSTS_MOCK>();
    for (const p of POSTS_MOCK) {
      if (p.estado !== "programado" && p.estado !== "publicado") continue;
      const k = p.fecha;
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(p);
    }
    return m;
  }, []);

  return (
    <div className="space-y-4 anim-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Calendario editorial</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setCursor(addDays(cursor, -30))} className="p-1.5 rounded hover:bg-muted">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-medium capitalize w-32 text-center">{format(cursor, "MMMM yyyy", { locale: es })}</span>
          <button onClick={() => setCursor(addDays(cursor, 30))} className="p-1.5 rounded hover:bg-muted">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="card-soft overflow-hidden">
        <div className="grid grid-cols-7 text-[11px] uppercase tracking-wider text-muted-foreground bg-muted/30">
          {["lun","mar","mié","jue","vie","sáb","dom"].map((d) => (
            <div key={d} className="px-2 py-1.5 text-center">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {dias.map((d) => {
            const posts = postsPorDia.get(format(d, "yyyy-MM-dd")) ?? [];
            const esMes = d.getMonth() === cursor.getMonth();
            const hoy = isSameDay(d, new Date());
            return (
              <div key={d.toISOString()} className={cn("min-h-[110px] border-t border-l border-border p-1.5", !esMes && "bg-muted/20 text-muted-foreground")}>
                <div className={cn("text-[11px] mb-1 inline-flex items-center justify-center h-5 w-5 rounded-full", hoy && "bg-primary text-primary-foreground font-semibold")}>
                  {format(d, "d")}
                </div>
                <div className="space-y-0.5">
                  {posts.slice(0, 3).map((p) => (
                    <div
                      key={p.id}
                      className="text-[10px] leading-tight rounded px-1.5 py-0.5 truncate text-white"
                      style={{ backgroundColor: CANAL_COLOR[p.canal] }}
                      title={`${p.titulo} · ${clientePorId(p.cliente_id)?.nombre} · ${CANAL_LABEL[p.canal]}`}
                    >
                      {p.titulo}
                    </div>
                  ))}
                  {posts.length > 3 && (
                    <div className="text-[10px] text-muted-foreground">+{posts.length - 3}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}