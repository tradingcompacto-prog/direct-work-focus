import * as React from "react";
import { Link } from "@tanstack/react-router";
import { useTareas, useEquipo, useCategoriaPorTarea } from "@/lib/queries";
import { useTareaModal } from "@/lib/tarea-modal-context";
import { urgenciaTarea } from "@/lib/fechas";
import { PersonaChip } from "@/components/PersonaChip";
import { estimarTarea } from "@/lib/estimacion";
import { setResponsable, getResponsable, useOverrides } from "@/lib/fechas-override-store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Monitor } from "lucide-react";
import type { Tarea } from "@/types/database";
import { VistaHeader } from "@/components/VistaHeader";

const ordenUrg = { rojo: 0, amarillo: 1, azul: 2, neutro: 3 } as const;

const cardColor = {
  rojo: "bg-red-50 text-red-900 border-red-200",
  amarillo: "bg-amber-50 text-amber-900 border-amber-200",
  azul: "bg-blue-50 text-blue-900 border-blue-200",
  neutro: "bg-zinc-50 text-zinc-700 border-zinc-200",
};

/** Semáforo de carga por persona. Devuelve nivel según unidad. */
function nivelCarga(total: number, unidad: "tareas" | "horas"): "verde" | "amarillo" | "rojo" {
  if (unidad === "tareas") {
    if (total <= 5) return "verde";
    if (total <= 10) return "amarillo";
    return "rojo";
  }
  if (total <= 20) return "verde";
  if (total <= 35) return "amarillo";
  return "rojo";
}
const dotCarga: Record<"verde" | "amarillo" | "rojo", string> = {
  verde: "bg-emerald-500",
  amarillo: "bg-amber-500",
  rojo: "bg-red-500",
};

const dotEstado: Partial<Record<Tarea["estado"], { color: string; label: string }>> = {
  haciendola: { color: "bg-amber-500", label: "En proceso" },
  pausada: { color: "bg-zinc-400", label: "Pausada" },
};

export function EquipoCarga() {
  useOverrides();
  const [modo, setModo] = React.useState<"fichas" | "cards" | "barras">("fichas");
  const [unidad, setUnidad] = React.useState<"tareas" | "horas">("tareas");
  const { data: tareas = [] } = useTareas();
  const { data: equipo = [] } = useEquipo();
  const categoriaPorTarea = useCategoriaPorTarea();
  const { abrir } = useTareaModal();
  const [overTarget, setOverTarget] = React.useState<string | null>(null);

  const activas = tareas.filter(
    (t) => t.estado === "activa" || t.estado === "haciendola" || t.estado === "pausada",
  );

  const porPersona = new Map<string, Tarea[]>();
  for (const m of equipo) porPersona.set(m.id, []);
  for (const t of activas) {
    const respId = getResponsable(t.id) ?? t.responsable_id;
    if (porPersona.has(respId)) porPersona.get(respId)!.push(t);
  }

  const horasDe = (t: Tarea) => {
    if (typeof t.horas_estimadas === "number") return t.horas_estimadas;
    const e = estimarTarea(t, tareas, categoriaPorTarea);
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
      <VistaHeader
        titulo="Carga del equipo"
        leyenda="Cuántas tareas tiene cada persona. Verde, ámbar o rojo según volumen."
      />
      <div className="flex flex-wrap justify-end gap-2">
        <Button asChild variant="outline" size="sm" className="mr-auto">
          <a href="/carga-monitor" target="_blank" rel="noreferrer">
            <Monitor className="h-4 w-4 mr-1" /> Modo monitor
          </a>
        </Button>
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
            onClick={() => setModo("fichas")}
            className={cn("px-3 py-1.5", modo === "fichas" ? "bg-foreground text-background" : "")}
          >
            Fichas
          </button>
          <button
            onClick={() => setModo("cards")}
            className={cn("px-3 py-1.5", modo === "cards" ? "bg-foreground text-background" : "")}
          >
            Kanban
          </button>
          <button
            onClick={() => setModo("barras")}
            className={cn("px-3 py-1.5", modo === "barras" ? "bg-foreground text-background" : "")}
          >
            Barras
          </button>
        </div>
      </div>

      {modo === "fichas" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {equipo.map((m) => {
            const lista = porPersona.get(m.id) ?? [];
            const total = totalPersona(lista);
            const nivel = nivelCarga(total, unidad);
            const max = unidad === "tareas" ? 10 : 35;
            const pct = Math.min(100, Math.round((total / max) * 100));
            const tono = {
              verde: { bg: "bg-emerald-50", border: "border-emerald-200", bar: "bg-emerald-500", text: "text-emerald-800", label: "Carga sana" },
              amarillo: { bg: "bg-amber-50", border: "border-amber-200", bar: "bg-amber-500", text: "text-amber-800", label: "Carga alta" },
              rojo: { bg: "bg-red-50", border: "border-red-200", bar: "bg-red-500", text: "text-red-800", label: "Sobrecargado" },
            }[nivel];
            const cont = { rojo: 0, amarillo: 0, azul: 0, neutro: 0 };
            for (const t of lista) cont[urgenciaTarea(t.fecha_fin_min, t.fecha_fin_max)]++;
            return (
              <Link
                key={m.id}
                to="/personas/$id"
                params={{ id: m.id }}
                className={cn(
                  "card-soft p-6 min-h-[200px] flex flex-col gap-3 border-2 transition hover:shadow-md hover:-translate-y-0.5",
                  tono.bg,
                  tono.border,
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <PersonaChip id={m.id} size="md" link={false} />
                    <div className="text-sm text-muted-foreground mt-1 truncate">{m.rol}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold tabular-nums leading-none">
                      {total}
                      <span className="text-base font-normal text-muted-foreground">
                        {unidad === "horas" ? "h" : ""}
                      </span>
                    </div>
                    <div className={cn("text-xs font-medium mt-1", tono.text)}>{tono.label}</div>
                  </div>
                </div>
                <div className="mt-auto space-y-2">
                  <div className="h-2.5 w-full rounded-full bg-white/60 overflow-hidden">
                    <div className={cn("h-full transition-all", tono.bar)} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {cont.rojo > 0 && <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" />{cont.rojo} urgentes</span>}
                    {cont.amarillo > 0 && <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" />{cont.amarillo} próximas</span>}
                    {cont.azul > 0 && <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500" />{cont.azul} holgura</span>}
                    {lista.length === 0 && <span>Sin tareas activas 🍃</span>}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : modo === "cards" ? (
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
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span
                        className={cn("h-2 w-2 rounded-full shrink-0", dotCarga[nivelCarga(totalPersona(lista), unidad)])}
                        title={`Carga ${nivelCarga(totalPersona(lista), unidad)}`}
                      />
                      <PersonaChip id={m.id} size="sm" />
                    </div>
                    <Link
                      to="/personas/$id"
                      params={{ id: m.id }}
                      className="text-xs text-muted-foreground tabular-nums hover:text-foreground hover:underline"
                      title="Ver todas las tareas"
                    >
                      {totalPersona(lista)}
                      {unidad === "horas" ? "h" : ""}
                    </Link>
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
                            "flex items-center gap-1.5 w-full text-left text-xs px-2 py-1.5 rounded border cursor-grab active:cursor-grabbing",
                            cardColor[u],
                          )}
                        >
                          {dotEstado[t.estado] && (
                            <span
                              className={cn("h-1.5 w-1.5 rounded-full shrink-0", dotEstado[t.estado]!.color)}
                              title={dotEstado[t.estado]!.label}
                            />
                          )}
                          <span className="truncate">{t.titulo}</span>
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
              <Link
                key={m.id}
                to="/personas/$id"
                params={{ id: m.id }}
                className="flex items-center gap-3 rounded-md px-2 py-1 -mx-2 hover:bg-muted/50 transition"
                title="Ver tareas de la persona"
              >
                <div className="w-40 shrink-0">
                  <PersonaChip id={m.id} size="sm" link={false} />
                </div>
                <div className="flex-1 h-6 bg-muted rounded overflow-hidden flex">
                  {cont.rojo > 0 && <div className="bg-red-500" style={{ width: `${(cont.rojo / total) * 100}%` }} title={`${cont.rojo} urgentes`} />}
                  {cont.amarillo > 0 && <div className="bg-amber-500" style={{ width: `${(cont.amarillo / total) * 100}%` }} title={`${cont.amarillo} próximas`} />}
                  {cont.azul > 0 && <div className="bg-blue-500" style={{ width: `${(cont.azul / total) * 100}%` }} title={`${cont.azul} con holgura`} />}
                </div>
                <div className="w-14 text-right text-sm font-medium tabular-nums">
                  {totalPersona(lista)}
                  {unidad === "horas" ? "h" : ""}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
