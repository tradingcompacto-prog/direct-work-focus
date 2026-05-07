import * as React from "react";
import { useTareas, useEquipo } from "@/lib/queries";
import { useTareaModal } from "@/lib/tarea-modal-context";
import { urgenciaTarea } from "@/lib/fechas";
import { PersonaChip } from "@/components/PersonaChip";
import { cn } from "@/lib/utils";
import type { Tarea } from "@/types/database";

const ordenUrg = { rojo: 0, amarillo: 1, azul: 2, neutro: 3 } as const;

const cardColor = {
  rojo: "bg-red-50 text-red-900 border-red-200",
  amarillo: "bg-amber-50 text-amber-900 border-amber-200",
  azul: "bg-blue-50 text-blue-900 border-blue-200",
  neutro: "bg-zinc-50 text-zinc-700 border-zinc-200",
};

export function EquipoCarga() {
  const [modo, setModo] = React.useState<"cards" | "barras">("cards");
  const { data: tareas = [] } = useTareas();
  const { data: equipo = [] } = useEquipo();
  const { abrir } = useTareaModal();

  const activas = tareas.filter(
    (t) => t.estado === "activa" || t.estado === "haciendola" || t.estado === "esperando",
  );

  const porPersona = new Map<string, Tarea[]>();
  for (const m of equipo) porPersona.set(m.id, []);
  for (const t of activas) {
    if (porPersona.has(t.responsable_id)) porPersona.get(t.responsable_id)!.push(t);
  }
  for (const [, lista] of porPersona) {
    lista.sort((a, b) => {
      const ua = urgenciaTarea(a.fecha_fin_min, a.fecha_fin_max);
      const ub = urgenciaTarea(b.fecha_fin_min, b.fecha_fin_max);
      return ordenUrg[ua] - ordenUrg[ub];
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <div className="inline-flex rounded-md border border-border overflow-hidden text-sm">
          <button
            onClick={() => setModo("cards")}
            className={cn("px-3 py-1.5", modo === "cards" ? "bg-foreground text-background" : "")}
          >
            Cards
          </button>
          <button
            onClick={() => setModo("barras")}
            className={cn("px-3 py-1.5", modo === "barras" ? "bg-foreground text-background" : "")}
          >
            Barras
          </button>
        </div>
      </div>

      {modo === "cards" ? (
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-3 min-w-max">
            {equipo.map((m) => {
              const lista = porPersona.get(m.id) ?? [];
              return (
                <div key={m.id} className="card-soft w-[260px] shrink-0">
                  <div className="px-3 py-2 border-b border-border flex items-center justify-between">
                    <PersonaChip id={m.id} size="sm" />
                    <span className="text-xs text-muted-foreground">{lista.length}</span>
                  </div>
                  <div className="p-2 space-y-1.5 max-h-[60vh] overflow-y-auto">
                    {lista.map((t) => {
                      const u = urgenciaTarea(t.fecha_fin_min, t.fecha_fin_max);
                      return (
                        <button
                          key={t.id}
                          onClick={() => abrir(t.id)}
                          className={cn(
                            "block w-full text-left text-xs px-2 py-1.5 rounded border",
                            cardColor[u],
                          )}
                        >
                          {t.titulo}
                        </button>
                      );
                    })}
                    {lista.length === 0 && (
                      <div className="text-xs text-muted-foreground text-center py-4">Sin tareas</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="card-soft p-4 space-y-3">
          {equipo.map((m) => {
            const lista = porPersona.get(m.id) ?? [];
            const cont = { rojo: 0, amarillo: 0, azul: 0, neutro: 0 };
            for (const t of lista) cont[urgenciaTarea(t.fecha_fin_min, t.fecha_fin_max)]++;
            const total = lista.length || 1;
            return (
              <div key={m.id} className="flex items-center gap-3">
                <div className="w-40 shrink-0">
                  <PersonaChip id={m.id} size="sm" />
                </div>
                <div className="flex-1 h-6 bg-muted rounded overflow-hidden flex">
                  {cont.rojo > 0 && <div className="bg-red-500" style={{ width: `${(cont.rojo / total) * 100}%` }} />}
                  {cont.amarillo > 0 && <div className="bg-amber-500" style={{ width: `${(cont.amarillo / total) * 100}%` }} />}
                  {cont.azul > 0 && <div className="bg-blue-500" style={{ width: `${(cont.azul / total) * 100}%` }} />}
                </div>
                <div className="w-12 text-right text-sm font-medium tabular-nums">{lista.length}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
