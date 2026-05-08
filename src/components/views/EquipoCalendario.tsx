import * as React from "react";
import {
  addDays,
  addMonths,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { es } from "date-fns/locale";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Sparkles, Megaphone, Package, Plane } from "lucide-react";
import { ENTREGAS_MOCK, clientePorId } from "@/lib/mock-tareas";
import { FECHAS_IMPORTANTES_MOCK } from "@/lib/mock-fechas-importantes";
import { nombrePorId } from "@/lib/equipo";
import { cn } from "@/lib/utils";
import { Toggle } from "@/components/ui/toggle";

type Capa = "entregas" | "campanas" | "fechas" | "vacaciones";

const colorEstado: Record<string, string> = {
  en_curso: "bg-blue-100 text-blue-800",
  cerrada: "bg-green-100 text-green-800",
};

export function EquipoCalendario() {
  const [mes, setMes] = React.useState(() => startOfMonth(new Date()));
  const [capas, setCapas] = React.useState<Record<Capa, boolean>>({
    entregas: true,
    campanas: true,
    fechas: true,
    vacaciones: true,
  });
  const toggle = (c: Capa) => setCapas((s) => ({ ...s, [c]: !s[c] }));

  const inicio = startOfWeek(startOfMonth(mes), { weekStartsOn: 1 });
  const dias = Array.from({ length: 42 }, (_, i) => addDays(inicio, i));
  const hoy = new Date();

  // Separamos entregas normales y campañas
  const entregasNormales = React.useMemo(
    () => ENTREGAS_MOCK.filter((e) => e.categoria !== "campanas_activas" && e.categoria !== "campana"),
    [],
  );
  const campanas = React.useMemo(
    () => ENTREGAS_MOCK.filter((e) => e.categoria === "campanas_activas" || e.categoria === "campana"),
    [],
  );

  const entregasPorDia = React.useMemo(() => {
    const m = new Map<string, typeof ENTREGAS_MOCK>();
    for (const e of entregasNormales) {
      const arr = m.get(e.fecha_fin) ?? [];
      arr.push(e);
      m.set(e.fecha_fin, arr);
    }
    return m;
  }, [entregasNormales]);

  // Eventos con rango (campañas + fechas + vacaciones) → expandir a cada día
  const eventosPorDia = React.useMemo(() => {
    const m = new Map<string, Array<{ id: string; tipo: Capa; label: string; sub?: string; href?: { to: string; params: { id: string } } }>>();
    const push = (k: string, ev: { id: string; tipo: Capa; label: string; sub?: string; href?: { to: string; params: { id: string } } }) => {
      const arr = m.get(k) ?? [];
      arr.push(ev);
      m.set(k, arr);
    };
    // Campañas
    for (const c of campanas) {
      const ini = parseISO(c.fecha_inicio);
      const fin = parseISO(c.fecha_fin);
      for (let d = new Date(ini); d <= fin; d = addDays(d, 1)) {
        push(format(d, "yyyy-MM-dd"), {
          id: c.id,
          tipo: "campanas",
          label: c.nombre,
          sub: clientePorId(c.cliente_id)?.nombre,
          href: { to: "/entregas/$id", params: { id: c.id } },
        });
      }
    }
    // Fechas importantes / vacaciones
    for (const f of FECHAS_IMPORTANTES_MOCK) {
      const ini = parseISO(f.fecha_inicio);
      const fin = parseISO(f.fecha_fin);
      for (let d = new Date(ini); d <= fin; d = addDays(d, 1)) {
        push(format(d, "yyyy-MM-dd"), {
          id: f.id,
          tipo: f.tipo === "vacaciones" ? "vacaciones" : "fechas",
          label: f.tipo === "vacaciones" ? `${nombrePorId(f.persona_id ?? "")} fuera` : f.titulo,
        });
      }
    }
    return m;
  }, [campanas]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold capitalize">
          {format(mes, "MMMM yyyy", { locale: es })}
        </h2>
        <div className="flex gap-1">
          <Button size="sm" variant="outline" onClick={() => setMes(subMonths(mes, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => setMes(startOfMonth(new Date()))}>
            Hoy
          </Button>
          <Button size="sm" variant="outline" onClick={() => setMes(addMonths(mes, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Toggle size="sm" pressed={capas.entregas} onPressedChange={() => toggle("entregas")} className="data-[state=on]:bg-blue-100 data-[state=on]:text-blue-800">
          <Package className="h-3.5 w-3.5 mr-1" /> Entregas
        </Toggle>
        <Toggle size="sm" pressed={capas.campanas} onPressedChange={() => toggle("campanas")} className="data-[state=on]:bg-purple-100 data-[state=on]:text-purple-800">
          <Megaphone className="h-3.5 w-3.5 mr-1" /> Campañas activas
        </Toggle>
        <Toggle size="sm" pressed={capas.fechas} onPressedChange={() => toggle("fechas")} className="data-[state=on]:bg-amber-100 data-[state=on]:text-amber-800">
          <Sparkles className="h-3.5 w-3.5 mr-1" /> Fechas importantes
        </Toggle>
        <Toggle size="sm" pressed={capas.vacaciones} onPressedChange={() => toggle("vacaciones")} className="data-[state=on]:bg-emerald-100 data-[state=on]:text-emerald-800">
          <Plane className="h-3.5 w-3.5 mr-1" /> Vacaciones
        </Toggle>
      </div>
      <div className="card-soft overflow-hidden">
        <div className="grid grid-cols-7 border-b border-border bg-muted/30 text-[11px] font-semibold uppercase text-muted-foreground">
          {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d) => (
            <div key={d} className="px-2 py-2 text-center">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {dias.map((d) => {
            const k = format(d, "yyyy-MM-dd");
            const items = entregasPorDia.get(k) ?? [];
            const eventos = eventosPorDia.get(k) ?? [];
            const esHoy = isSameDay(d, hoy);
            const fueraMes = !isSameMonth(d, mes);
            return (
              <div
                key={k}
                className={cn(
                  "min-h-[110px] border-b border-r border-border p-1.5 text-xs",
                  fueraMes && "bg-muted/20 text-muted-foreground/50",
                )}
              >
                <div className={cn("text-right mb-1", esHoy && "font-bold text-blue-600")}>
                  {format(d, "d")}
                </div>
                <div className="space-y-1">
                  {capas.entregas &&
                    items.map((e) => (
                      <Link
                        key={e.id}
                        to="/entregas/$id"
                        params={{ id: e.id }}
                        className={cn(
                          "block px-1.5 py-0.5 rounded text-[10px] truncate",
                          colorEstado[e.estado],
                        )}
                      >
                        {clientePorId(e.cliente_id)?.nombre}: {e.nombre}
                      </Link>
                    ))}
                  {eventos.map((ev) => {
                    if (!capas[ev.tipo]) return null;
                    const cls =
                      ev.tipo === "campanas"
                        ? "bg-purple-100 text-purple-800"
                        : ev.tipo === "fechas"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-emerald-100 text-emerald-800";
                    const content = (
                      <span className={cn("block px-1.5 py-0.5 rounded text-[10px] truncate", cls)}>
                        {ev.label}
                      </span>
                    );
                    return ev.href ? (
                      <Link key={ev.id + k} to={ev.href.to} params={ev.href.params}>
                        {content}
                      </Link>
                    ) : (
                      <div key={ev.id + k}>{content}</div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
