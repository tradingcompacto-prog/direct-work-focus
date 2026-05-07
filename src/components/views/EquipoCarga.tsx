import * as React from "react";
import { useTareas, useEquipo } from "@/lib/queries";
import { useTareaModal } from "@/lib/tarea-modal-context";
import { urgenciaTarea } from "@/lib/fechas";
import { PersonaChip } from "@/components/PersonaChip";
import { estimarTarea } from "@/lib/estimacion";
import { TAREAS_MOCK } from "@/lib/mock-tareas";
import { setResponsable, getResponsable, useOverrides } from "@/lib/fechas-override-store";
import { toast } from "sonner";
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
  useOverrides();
  const [modo, setModo] = React.useState<"cards" | "barras">("cards");
  const [unidad, setUnidad] = React.useState<"tareas" | "horas">("tareas");
  const { data: tareas = [] } = useTareas();
  const { data: equipo = [] } = useEquipo();
  const { abrir } = useTareaModal();
  const [overTarget, setOverTarget] = React.useState<string | null>(null);

  const activas = tareas.filter(
    (t) => t.estado === "activa" || t.estado === "haciendola" || t.estado === "esperando",
  );

  const porPersona = new Map<string, Tarea[]>();
  for (const m of equipo) porPersona.set(m.id, []);
  for (const t of activas) {
    const respId = getResponsable(t.id) ?? t.responsable_id;
    if (porPersona.has(respId)) porPersona.get(respId)!.push(t);
  }

  const horasDe = (t: Tarea) => {
    if (typeof t.horas_estimadas === "number") return t.horas_estimadas;
    const e = estimarTarea(t, TAREAS_MOCK);
    return e?.horas ?? 1;
  };
  const totalPersona = (lista: Tarea[]) =>
    unidad === "tareas" ? lista.length : Math.round(lista.reduce((a, t) => a + horasDe(t), 0) * 10) / 10;
  for (const [, lista] of porPersona) {
    lista.sort((a, b) => {
      const ua = urgenciaTarea(a.fecha_fin_min, a.fecha_fin_max);
      const ub = urgenciaTarea(b.fecha_fin_min, b.fecha_fin_max);
      return ordenUrg[ua] - ordenUrg[ub];
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end gap-2">
        <div className="inline-flex rounded-md border border-border overflow-hidden text-sm">
          <button
            onClick={() => setUnidad("tareas")}
            className={cn("px-3 py-1.5", unidad === "tareas" ? "bg-foreground text-background" : "")}
          >
            Por nº tareas
          </button>
          <button
            onClick={() => setUnidad("horas")}
            className={cn("px-3 py-1.5", unidad === "horas" ? "bg-foreground text-background" : "")}
          >
            Por horas
          </button>
        </div>
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
                <div
                  key={m.id}
                  className={cn(
                    "card-soft w-[260px] shrink-0 transition-colors",
                    overTarget === m.id && "ring-2 ring-blue-400 bg-blue-50/30",
                  )}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setOverTarget(m.id);
                  }}
                  onDragLeave={() => setOverTarget((t) => (t === m.id ? null : t))}
                  onDrop={(e) => {
                    e.preventDefault();
                    const id = e.dataTransfer.getData("text/tarea");
                    setOverTarget(null);
                    if (!id) return;
                    setResponsable(id, m.id);
                    toast.success(`Reasignada a ${m.nombre}`);
                  }}
                >
                  <div className="px-3 py-2 border-b border-border flex items-center justify-between">
                    <PersonaChip id={m.id} size="sm" />
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {totalPersona(lista)}
                      {unidad === "horas" ? "h" : ""}
                    </span>
                  </div>
                  <div className="p-2 space-y-1.5 max-h-[60vh] overflow-y-auto">
                    {lista.map((t) => {
                      const u = urgenciaTarea(t.fecha_fin_min, t.fecha_fin_max);
                      return (
                        <button
                          key={t.id}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData("text/tarea", t.id);
                            e.dataTransfer.effectAllowed = "move";
                          }}
                          onClick={() => abrir(t.id)}
                          className={cn(
                            "block w-full text-left text-xs px-2 py-1.5 rounded border cursor-grab active:cursor-grabbing",
                            cardColor[u],
                          )}
                        >
                          {t.titulo}
                        </button>
                      );
                    })}
                    {lista.length === 0 && (
                      <div className="text-xs text-muted-foreground text-center py-6">
                        <span className="text-2xl block mb-1">🍃</span>
                        Sin tareas activas
                      </div>
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
                <div className="w-14 text-right text-sm font-medium tabular-nums">
                  {totalPersona(lista)}
                  {unidad === "horas" ? "h" : ""}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
