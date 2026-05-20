import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { clientePorId, PROYECTOS_MOCK, ENTREGAS_MOCK, TAREAS_MOCK, ACTIVIDAD_MOCK } from "@/lib/mock-tareas";
import { Key, Users2, Lightbulb, BookOpen } from "lucide-react";
import { PersonaChip } from "@/components/PersonaChip";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useCrearModal } from "@/lib/crear-modal-context";
import { useTareaModal } from "@/lib/tarea-modal-context";
import { Plus, Globe, Hash, Activity, FolderKanban, Package, ListChecks, Users, History, StickyNote, Layers } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { colorCliente, bordeIzqCliente } from "@/lib/cliente-colors";
import { etiquetaFechaRelativa, urgenciaTarea, tiempoRelativo } from "@/lib/fechas";
import { cn } from "@/lib/utils";
import { useTareasVersion } from "@/lib/tareas-store";
import { CATEGORIAS_ENTREGA, labelCategoria } from "@/lib/categorias";
import { useCategoriasHabilitadas } from "@/lib/queries";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/lib/supabase";
import { invalidateKeys } from "@/lib/qc";
import { toast } from "sonner";
import type { CategoriaEntrega } from "@/types/database";

export const Route = createFileRoute("/clientes/$id")({
  component: FichaCliente,
});

function FichaCliente() {
  const { id } = Route.useParams();
  useTareasVersion();
  const c = clientePorId(id);
  const { abrir } = useCrearModal();
  const { abrir: abrirTarea } = useTareaModal();
  const [tab, setTab] = useState("resumen");

  if (!c) return <div className="p-6">Cliente no encontrado</div>;

  const proyectos = PROYECTOS_MOCK.filter((p) => p.cliente_id === c.id);
  const proyectoPrincipal = proyectos[0];
  const clienteDesde = proyectoPrincipal
    ? format(parseISO(proyectoPrincipal.fecha_inicio), "MMM yyyy", { locale: es })
    : "—";
  const entregas = ENTREGAS_MOCK.filter((e) => e.cliente_id === c.id);
  const tareas = TAREAS_MOCK.filter((t) => t.cliente_id === c.id);
  const tareasActivas = tareas.filter((t) => t.estado !== "completada");
  const tareasCerradas = tareas.filter((t) => t.estado === "completada");
  const entregasAbiertas = entregas.filter((e) => e.estado === "en_curso");
  const equipoIds = Array.from(new Set(tareas.map((t) => t.responsable_id)));
  const actividad = ACTIVIDAD_MOCK.filter((a) => {
    const t = tareas.find((x) => x.id === a.tarea_id);
    return !!t;
  });

  const color = colorCliente(c.id);
  const saludColor = c.salud === "verde" ? "bg-emerald-500" : c.salud === "amarillo" ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <header className="card-soft p-5 border-l-4" style={bordeIzqCliente(c.id)}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className="h-14 w-14 rounded-xl flex items-center justify-center font-bold text-lg shrink-0"
              style={{ backgroundColor: color.bg, color: color.text }}
            >
              {c.nombre.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight">{c.nombre}</h1>
                <span className={cn("h-2.5 w-2.5 rounded-full", saludColor)} title={`Salud: ${c.salud}`} />
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-muted-foreground">
                <Badge variant="secondary">{c.sector}</Badge>
                <span>·</span>
                <span className="flex items-center gap-1"><span className="text-xs">PM</span> <PersonaChip id={c.pm_id} size="xs" /></span>
                {c.web && <a href={`https://${c.web}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline"><Globe className="h-3 w-3" /> {c.web}</a>}
                {c.slack && <span className="flex items-center gap-1"><Hash className="h-3 w-3" /> {c.slack}</span>}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => abrir("proyecto", { cliente_id: c.id })}>
              <Plus className="h-4 w-4 mr-1" /> Proyecto
            </Button>
          </div>
        </div>

        {/* Mini stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
          <Stat label="Cliente desde" textoValor={clienteDesde} />
          <Stat label="Entregas abiertas" valor={entregasAbiertas.length} to="/entregas/tabla" search={{ cliente: c.id, estado: "en_curso" }} />
          <Stat label="Tareas activas" valor={tareasActivas.length} to="/tareas/tabla" search={{ cliente: c.id }} />
          <Stat label="Equipo asignado" valor={equipoIds.length} />
        </div>
      </header>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="resumen"><Activity className="h-3.5 w-3.5 mr-1" /> Resumen</TabsTrigger>
          <TabsTrigger value="proyectos"><FolderKanban className="h-3.5 w-3.5 mr-1" /> Proyectos</TabsTrigger>
          <TabsTrigger value="entregas"><Package className="h-3.5 w-3.5 mr-1" /> Entregas</TabsTrigger>
          <TabsTrigger value="categorias"><Layers className="h-3.5 w-3.5 mr-1" /> Categorías</TabsTrigger>
          <TabsTrigger value="tareas"><ListChecks className="h-3.5 w-3.5 mr-1" /> Tareas</TabsTrigger>
          <TabsTrigger value="equipo"><Users className="h-3.5 w-3.5 mr-1" /> Equipo</TabsTrigger>
          <TabsTrigger value="actividad"><History className="h-3.5 w-3.5 mr-1" /> Actividad</TabsTrigger>
          <TabsTrigger value="notas"><StickyNote className="h-3.5 w-3.5 mr-1" /> Notas</TabsTrigger>
        </TabsList>

        {/* Resumen */}
        <TabsContent value="resumen" className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="card-soft p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Próximas entregas</h3>
            <ul className="space-y-1">
              {entregasAbiertas.slice(0, 5).map((e) => (
                <li key={e.id}>
                  <Link to="/entregas/$id" params={{ id: e.id }} className="flex items-center justify-between text-sm px-2 py-1.5 rounded hover:bg-muted/50">
                    <span className="truncate">{e.nombre}</span>
                    <span className="text-xs text-muted-foreground shrink-0">{etiquetaFechaRelativa(e.fecha_fin)}</span>
                  </Link>
                </li>
              ))}
              {entregasAbiertas.length === 0 && <li className="text-sm text-muted-foreground">Sin entregas abiertas</li>}
            </ul>
          </div>
          <div className="card-soft p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Tareas urgentes</h3>
            <ul className="space-y-1">
              {tareasActivas
                .filter((t) => urgenciaTarea(t.fecha_fin_min, t.fecha_fin_max) !== "azul")
                .slice(0, 6)
                .map((t) => (
                  <li key={t.id}>
                    <button onClick={() => abrirTarea(t.id)} className="w-full text-left flex items-center justify-between text-sm px-2 py-1.5 rounded hover:bg-muted/50">
                      <span className="truncate">{t.titulo}</span>
                      <span className="text-xs text-muted-foreground shrink-0">{etiquetaFechaRelativa(t.fecha_fin_max)}</span>
                    </button>
                  </li>
                ))}
              {tareasActivas.filter((t) => urgenciaTarea(t.fecha_fin_min, t.fecha_fin_max) !== "azul").length === 0 && (
                <li className="text-sm text-muted-foreground">Sin urgencias 👌</li>
              )}
            </ul>
          </div>
        </TabsContent>

        {/* Proyectos */}
        <TabsContent value="proyectos" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {proyectos.map((p) => (
              <Link key={p.id} to="/proyectos/$id" params={{ id: p.id }} className="card-soft p-4 hover:shadow-md transition">
                <div className="font-medium">{p.nombre}</div>
                <div className="text-xs text-muted-foreground mt-1">Estado: {p.estado} · Inicio {format(parseISO(p.fecha_inicio), "d MMM yyyy", { locale: es })}</div>
              </Link>
            ))}
          </div>
        </TabsContent>

        {/* Entregas */}
        <TabsContent value="entregas" className="mt-4 space-y-1">
          {entregas.map((e) => (
            <Link key={e.id} to="/entregas/$id" params={{ id: e.id }} className="card-soft p-3 flex justify-between text-sm hover:shadow-sm transition">
              <span className="truncate">{e.nombre} <Badge variant="outline" className="ml-2">{e.estado}</Badge></span>
              <span className="text-xs text-muted-foreground shrink-0">{format(parseISO(e.fecha_fin), "d MMM", { locale: es })}</span>
            </Link>
          ))}
        </TabsContent>

        {/* Categorías habilitadas */}
        <TabsContent value="categorias" className="mt-4">
          <CategoriasHabilitadasSection clienteId={c.id} />
        </TabsContent>

        {/* Tareas */}
        <TabsContent value="tareas" className="mt-4 space-y-1">
          {tareasActivas.map((t) => (
            <button key={t.id} onClick={() => abrirTarea(t.id)} className="w-full text-left card-soft p-3 flex items-center justify-between gap-3 text-sm hover:shadow-sm transition">
              <div className="flex items-center gap-2 min-w-0">
                <PersonaChip id={t.responsable_id} size="xs" showName={false} />
                <span className="truncate">{t.titulo}</span>
              </div>
              <span className="text-xs text-muted-foreground shrink-0">{etiquetaFechaRelativa(t.fecha_fin_max)}</span>
            </button>
          ))}
          {tareasCerradas.length > 0 && (
            <details className="mt-3">
              <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">Cerradas ({tareasCerradas.length})</summary>
              <div className="mt-2 space-y-1">
                {tareasCerradas.map((t) => (
                  <button key={t.id} onClick={() => abrirTarea(t.id)} className="w-full text-left text-sm px-3 py-1.5 rounded hover:bg-muted/50 line-through text-muted-foreground">
                    {t.titulo}
                  </button>
                ))}
              </div>
            </details>
          )}
        </TabsContent>

        {/* Equipo */}
        <TabsContent value="equipo" className="mt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {equipoIds.map((uid) => {
              const n = tareas.filter((t) => t.responsable_id === uid && t.estado !== "completada").length;
              return (
                <div key={uid} className="card-soft p-3 flex items-center gap-2">
                  <PersonaChip id={uid} size="sm" />
                  <span className="ml-auto text-xs text-muted-foreground">{n} activas</span>
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* Actividad */}
        <TabsContent value="actividad" className="mt-4">
          <ul className="space-y-2">
            {actividad.map((a) => (
              <li key={a.id} className="text-sm flex items-center gap-2">
                <PersonaChip id={a.actor_id} size="xs" showName={false} />
                <span className="text-muted-foreground flex-1 truncate">{a.texto}</span>
                <span className="text-xs text-muted-foreground shrink-0">{tiempoRelativo(a.fecha)}</span>
              </li>
            ))}
            {actividad.length === 0 && <li className="text-sm text-muted-foreground">Sin actividad reciente</li>}
          </ul>
        </TabsContent>

        {/* Notas */}
        <TabsContent value="notas" className="mt-4">
          <NotasCliente clienteId={c.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Stat({
  label,
  valor,
  textoValor,
  to,
  search,
}: {
  label: string;
  valor?: number;
  textoValor?: string;
  to?: string;
  search?: Record<string, string>;
}) {
  const inner = (
    <>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-xl font-semibold tabular-nums capitalize">{textoValor ?? valor}</div>
    </>
  );
  if (to) {
    return (
      <Link
        to={to as never}
        search={search as never}
        className="rounded-lg bg-muted/40 px-3 py-2 hover:bg-muted/70 transition cursor-pointer block"
      >
        {inner}
      </Link>
    );
  }
  return <div className="rounded-lg bg-muted/40 px-3 py-2">{inner}</div>;
}

function NotasCliente({ clienteId }: { clienteId: string }) {
  // Mock simple: contenido informativo por sección. Persistencia futura.
  const bloques = [
    {
      Icon: BookOpen,
      titulo: "Briefing y contexto",
      texto:
        "Marca con tono cercano y honesto. El cliente prefiere comunicación por Slack en horario laboral. Aprobaciones por correo el viernes.",
    },
    {
      Icon: Users2,
      titulo: "Contactos clave",
      texto:
        "Contacto principal: Marta Ruiz (CMO). Aprobación final: Jorge L. (Director). CC siempre a marketing@cliente.com.",
    },
    {
      Icon: Key,
      titulo: "Accesos",
      texto:
        "Las credenciales de Meta Ads, GA4 y Search Console están en el gestor compartido. Pedir acceso a Paula antes de tocar la cuenta.",
    },
    {
      Icon: Lightbulb,
      titulo: "Particularidades y lecciones",
      texto:
        "Evitar enviar piezas en agosto (cierre de oficina). Han funcionado mejor los formatos verticales con texto corto y CTA único.",
    },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {bloques.map(({ Icon, titulo, texto }) => (
        <div key={titulo} className="card-soft p-4 flex items-start gap-3">
          <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center shrink-0">
            <Icon className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <div className="font-medium text-sm mb-1">{titulo}</div>
            <p className="text-sm text-muted-foreground leading-relaxed">{texto}</p>
          </div>
        </div>
      ))}
      <p className="md:col-span-2 text-[11px] text-muted-foreground text-center mt-1">
        Las notas son visibles para todo el equipo. Edición próximamente.
      </p>
    </div>
  );
}

function CategoriasHabilitadasSection({ clienteId }: { clienteId: string }) {
  const { data: habilitadas = [], isLoading } = useCategoriasHabilitadas(clienteId);
  const setHab = new Set(habilitadas);

  const toggle = async (cat: CategoriaEntrega, on: boolean) => {
    if (on) {
      const { error } = await supabase
        .from("cliente_categorias")
        .insert({ cliente_id: clienteId, categoria: cat });
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success(`«${labelCategoria(cat)}» habilitada`);
    } else {
      // Sólo permitir desactivar si la entrega no tiene tareas activas (Supabase).
      const { data: ent, error: entErr } = await supabase
        .from("entregas")
        .select("id")
        .eq("cliente_id", clienteId)
        .eq("categoria", cat)
        .maybeSingle();
      if (entErr) {
        toast.error("Error al comprobar la entrega");
        return;
      }
      if (ent) {
        const { count, error: countErr } = await supabase
          .from("tareas")
          .select("id", { count: "exact", head: true })
          .eq("entrega_id", ent.id)
          .neq("estado", "completada");
        if (countErr) {
          toast.error("Error al comprobar tareas");
          return;
        }
        if ((count ?? 0) > 0) {
          toast.error(`No se puede desactivar: la entrega tiene ${count} tareas activas`);
          return;
        }
      }
      const { error } = await supabase
        .from("cliente_categorias")
        .delete()
        .eq("cliente_id", clienteId)
        .eq("categoria", cat);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success(`«${labelCategoria(cat)}» desactivada`);
    }
    invalidateKeys(["cliente_categorias", clienteId], ["entregas"], ["tareas"]);
  };

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Cargando…</div>;
  }
  return (
    <div className="card-soft p-4">
      <p className="text-xs text-muted-foreground mb-3">
        Activa las categorías de trabajo para este cliente. Cada categoría activa
        crea una entrega permanente donde colgar las tareas.
      </p>
      <ul className="divide-y divide-border">
        {CATEGORIAS_ENTREGA.map((c) => {
          const on = setHab.has(c.value);
          return (
            <li key={c.value} className="flex items-center justify-between py-2.5">
              <span className="text-sm">{labelCategoria(c.value)}</span>
              <Switch checked={on} onCheckedChange={(v) => toggle(c.value, !!v)} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
