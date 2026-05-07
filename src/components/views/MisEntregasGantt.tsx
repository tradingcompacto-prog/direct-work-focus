import { useMemo } from "react";
import { addDays, differenceInDays, format, isSameDay, parseISO, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { useNavigate } from "@tanstack/react-router";
import { ENTREGAS_MOCK, clientePorId } from "@/lib/mock-tareas";
import { cn } from "@/lib/utils";

const N_DIAS = 30;
const DAY_W = 28;
const ROW_H = 30;

export function MisEntregasGantt() {
  const hoy = useMemo(() => startOfDay(new Date()), []);
  const dias = useMemo(() => Array.from({ length: N_DIAS }, (_, i) => addDays(hoy, i)), [hoy]);
  const navigate = useNavigate();

  const entregas = ENTREGAS_MOCK.filter((e) => e.estado === "en_curso");
  const grupos = useMemo(() => {
    const m = new Map<string, typeof entregas>();
    for (const e of entregas) {
      const arr = m.get(e.cliente_id) ?? [];
      arr.push(e);
      m.set(e.cliente_id, arr);
    }
    return Array.from(m.entries());
  }, [entregas]);

  const colorUrgencia = (fechaFin: Date) => {
    const diff = differenceInDays(fechaFin, hoy);
    if (diff < 0) return "bg-red-500";
    if (diff <= 3) return "bg-amber-500";
    return "bg-blue-500";
  };

  return (
    <div className="card-soft overflow-x-auto">
      <div style={{ width: 240 + N_DIAS * DAY_W }}>
        <div className="flex border-b border-border bg-muted/30 sticky top-0 z-10">
          <div className="w-[240px] shrink-0 px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Entrega
          </div>
          <div className="flex">
            {dias.map((d) => {
              const esHoy = isSameDay(d, hoy);
              return (
                <div
                  key={d.toISOString()}
                  className={cn(
                    "text-center text-[10px] py-2 border-l border-border",
                    esHoy && "bg-blue-50 font-semibold",
                  )}
                  style={{ width: DAY_W }}
                >
                  {format(d, "d")}
                </div>
              );
            })}
          </div>
        </div>
        {grupos.map(([clienteId, ents]) => (
          <div key={clienteId} className="border-b border-border/60">
            <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider bg-muted/20 text-muted-foreground">
              {clientePorId(clienteId)?.nombre}
            </div>
            {ents.map((e) => {
              const inicio = parseISO(e.fecha_inicio);
              const fin = parseISO(e.fecha_fin);
              const startOffset = Math.max(0, differenceInDays(inicio, hoy));
              const endOffset = Math.min(N_DIAS - 1, differenceInDays(fin, hoy));
              if (endOffset < 0) return null;
              const left = 240 + startOffset * DAY_W + 2;
              const width = (endOffset - startOffset + 1) * DAY_W - 4;
              return (
                <div key={e.id} className="flex items-center relative" style={{ height: ROW_H }}>
                  <div className="w-[240px] shrink-0 px-3 text-xs truncate">{e.nombre}</div>
                  <button
                    onClick={() => navigate({ to: "/entregas/$id", params: { id: e.id } })}
                    className={cn(
                      "absolute top-1.5 h-5 rounded-sm text-[10px] text-white px-2 truncate text-left hover:opacity-90",
                      colorUrgencia(fin),
                    )}
                    style={{ left, width }}
                  >
                    {e.nombre}
                  </button>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
