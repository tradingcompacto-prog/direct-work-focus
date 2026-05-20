import * as React from "react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import {
  Plus,
  Instagram,
  Facebook,
  Linkedin,
  Music2,
  CalendarIcon,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as DayCalendar } from "@/components/ui/calendar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PersonaPicker } from "@/components/PersonaPicker";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  usePlanRRSS,
  addPublicacion,
  updatePublicacion,
  removePublicacion,
  bulkUpdatePublicaciones,
  bulkShiftFechas,
  setPublicacionResponsable,
} from "@/lib/plan-rrss-store";
import {
  ESTADO_PUB_COLOR,
  ESTADO_PUB_LABEL,
  ESTADO_PUB_TOOLTIP,
  FORMATO_LABEL,
  FORMATO_TOOLTIP,
  TIPO_LABEL,
  TIPO_TOOLTIP,
  type PublicacionRRSS,
} from "@/types/database";
import { SlidesEditor } from "./SlidesEditor";
import { PublicacionAvanceRapido } from "./PublicacionAvanceRapido";

type Estado = NonNullable<PublicacionRRSS["estado"]>;
type Plat = PublicacionRRSS["plataformas"][number];

const PLATAFORMAS: Array<{ value: Plat; label: string; Icon: React.ComponentType<{ className?: string }> }> = [
  { value: "ig", label: "Instagram", Icon: Instagram },
  { value: "fb", label: "Facebook", Icon: Facebook },
  { value: "li", label: "LinkedIn", Icon: Linkedin },
  { value: "tt", label: "TikTok", Icon: Music2 },
];

const TIPOS: Array<PublicacionRRSS["tipo"]> = ["post", "reel", "carrusel", "story"];
const FORMATOS: Array<PublicacionRRSS["formato"]> = ["solo_copy", "copy_imagen", "solo_imagen", "slide"];
const ESTADOS: Estado[] = ["borrador", "diseno", "copy", "revision", "listo", "programado", "publicado"];

function siguienteFecha(ordenado: PublicacionRRSS[]): string {
  if (ordenado.length === 0) return new Date().toISOString().slice(0, 10);
  const ult = ordenado[ordenado.length - 1];
  let stepDays = 1;
  if (ordenado.length >= 2) {
    const pen = ordenado[ordenado.length - 2];
    const diff = (new Date(ult.fecha).getTime() - new Date(pen.fecha).getTime()) / 86400000;
    if (diff > 0) stepDays = Math.round(diff);
  }
  const d = new Date(ult.fecha);
  d.setDate(d.getDate() + stepDays);
  return d.toISOString().slice(0, 10);
}

function aplicaSlides(p: PublicacionRRSS) {
  return p.tipo === "carrusel" || p.formato === "slide";
}

export function PlanRRSSTable({
  tareaId,
  entregaId,
  clienteId,
}: {
  tareaId: string;
  entregaId: string;
  clienteId: string;
}) {
  const { data: plan = [] } = usePlanRRSS(tareaId);
  const ctx = React.useMemo(() => ({ tareaId, entregaId, clienteId }), [tareaId, entregaId, clienteId]);
  const ordenado = React.useMemo(
    () => [...plan].sort((a, b) => a.fecha.localeCompare(b.fecha)),
    [plan],
  );

  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [filtro, setFiltro] = React.useState<"todas" | "revision" | "diseno" | "programado">("todas");
  const [slidesPub, setSlidesPub] = React.useState<PublicacionRRSS | null>(null);
  const [highlightId, setHighlightId] = React.useState<string | null>(null);

  // ?pub=<id> → scroll + highlight
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    const pub = url.searchParams.get("pub");
    if (!pub || !ordenado.some((p) => p.id === pub)) return;
    setHighlightId(pub);
    setTimeout(() => {
      const el = document.querySelector(`[data-pub-id="${pub}"]`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
    const t = setTimeout(() => setHighlightId(null), 3000);
    return () => clearTimeout(t);
  }, [ordenado]);

  const visibles = React.useMemo(() => {
    if (filtro === "todas") return ordenado;
    if (filtro === "revision") return ordenado.filter((p) => p.estado === "revision");
    if (filtro === "diseno") return ordenado.filter((p) => p.estado === "diseno");
    if (filtro === "programado") return ordenado.filter((p) => p.estado === "programado");
    return ordenado;
  }, [ordenado, filtro]);

  const stats = React.useMemo(() => {
    const listas = ordenado.filter((p) => p.estado === "listo" || p.estado === "programado").length;
    const publicadas = ordenado.filter((p) => p.estado === "publicado").length;
    return { total: ordenado.length, listas, publicadas };
  }, [ordenado]);

  const toggle = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const toggleAll = () => {
    if (selected.size === visibles.length) setSelected(new Set());
    else setSelected(new Set(visibles.map((p) => p.id)));
  };

  const addNueva = () => {
    const ult = ordenado[ordenado.length - 1];
    const fecha = siguienteFecha(ordenado);
    const base: Omit<PublicacionRRSS, "id"> = ult
      ? {
          fecha,
          tipo: ult.tipo,
          formato: ult.formato,
          plataformas: ult.plataformas,
          estado: "borrador",
          responsable_diseno_id: ult.responsable_diseno_id ?? null,
          responsable_copy_id: ult.responsable_copy_id ?? null,
        }
      : {
          fecha,
          tipo: "post",
          formato: "copy_imagen",
          plataformas: ["ig"],
          estado: "borrador",
        };
    addPublicacion(ctx, base);
    toast.success("Publicación añadida");
  };

  return (
    <div className="space-y-3">
      {/* Cabecera explicativa */}
      <div className="card-soft p-3 text-xs text-muted-foreground bg-muted/30">
        Cada publicación es una pieza independiente que avanza por su propio flujo:{" "}
        <span className="font-medium text-foreground">
          Borrador → Diseño → Copy → Revisión → Listo → Programado → Publicado.
        </span>
      </div>

      {/* Controles */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Button size="sm" onClick={addNueva}>
            <Plus className="h-4 w-4 mr-1" /> Publicación
          </Button>
          <span className="text-xs text-muted-foreground">
            {stats.total} publicaciones · {stats.listas} listas · {stats.publicadas} publicada{stats.publicadas !== 1 && "s"}
          </span>
        </div>
        <div className="flex gap-1">
          {([
            ["todas", "Todas"],
            ["revision", "Por revisar"],
            ["diseno", "En diseño"],
            ["programado", "Programadas"],
          ] as const).map(([k, lbl]) => (
            <button
              key={k}
              onClick={() => setFiltro(k)}
              className={cn(
                "text-xs px-2.5 py-1 rounded-full border transition",
                filtro === k
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background hover:bg-muted border-border",
              )}
            >
              {lbl}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk bar */}
      {selected.size > 0 && (
        <BulkBar
          ids={Array.from(selected)}
          onClear={() => setSelected(new Set())}
          ctx={ctx}
        />
      )}

      {/* Tabla */}
      <div className="card-soft overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-2 py-2 w-8">
                <Checkbox
                  checked={visibles.length > 0 && selected.size === visibles.length}
                  onCheckedChange={toggleAll}
                />
              </th>
              <th className="px-2 py-2 w-8 text-left">#</th>
              <th className="px-2 py-2 text-left">Fecha</th>
              <th className="px-2 py-2 text-left">Tipo</th>
              <th className="px-2 py-2 text-left">Formato</th>
              <th className="px-2 py-2 text-left">Plataformas</th>
              <th className="px-2 py-2 text-left">Estado</th>
              <th className="px-2 py-2 text-left">Diseño</th>
              <th className="px-2 py-2 text-left">Copy</th>
              <th className="px-2 py-2 text-left min-w-[180px]">Briefing</th>
              <th className="px-2 py-2 text-left">Slides</th>
              <th className="px-2 py-2 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {visibles.length === 0 && (
              <tr>
                <td colSpan={12} className="text-center text-muted-foreground py-8">
                  Sin publicaciones que mostrar
                </td>
              </tr>
            )}
            {visibles.map((p, idx) => (
              <FilaPub
                key={p.id}
                p={p}
                idx={ordenado.indexOf(p) + 1}
                seleccionado={selected.has(p.id)}
                onToggle={() => toggle(p.id)}
                onOpenSlides={() => setSlidesPub(p)}
                ctx={ctx}
                highlight={highlightId === p.id}
              />
            ))}
          </tbody>
        </table>
      </div>

      {slidesPub && (
        <SlidesEditor
          publicacionId={slidesPub.id}
          publicacionLabel={`Pub ${ordenado.indexOf(slidesPub) + 1}`}
          slides={slidesPub.slides ?? []}
          open={!!slidesPub}
          onOpenChange={(o) => !o && setSlidesPub(null)}
        />
      )}
    </div>
  );
}

function FilaPub({
  p,
  idx,
  seleccionado,
  onToggle,
  onOpenSlides,
  ctx,
  highlight,
}: {
  p: PublicacionRRSS;
  idx: number;
  seleccionado: boolean;
  onToggle: () => void;
  onOpenSlides: () => void;
  ctx: { tareaId: string; entregaId: string; clienteId: string };
  highlight: boolean;
}) {
  const estado = (p.estado ?? "borrador") as Estado;
  const tieneSlides = aplicaSlides(p);

  return (
    <tr
      data-pub-id={p.id}
      className={cn(
        "border-t border-border transition-colors",
        ESTADO_PUB_COLOR[estado].replace("text-", "").replace(/\bbg-(\w+)-100\b/, "bg-$1-50/40"),
        highlight && "ring-2 ring-blue-500 ring-inset",
      )}
    >
      <td className="px-2 py-1.5"><Checkbox checked={seleccionado} onCheckedChange={onToggle} /></td>
      <td className="px-2 py-1.5 text-xs text-muted-foreground tabular-nums">#{idx}</td>

      <td className="px-2 py-1.5"><FechaCell p={p} /></td>

      <td className="px-2 py-1.5">
        <Select value={p.tipo} onValueChange={(v) => updatePublicacion(ctx.tareaId, p.id, { tipo: v as PublicacionRRSS["tipo"] })}>
          <SelectTrigger className="h-7 text-xs px-2 w-[110px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <TooltipProvider delayDuration={300}>
              {TIPOS.map((t) => (
                <Tooltip key={t}>
                  <TooltipTrigger asChild>
                    <SelectItem value={t}>{TIPO_LABEL[t]}</SelectItem>
                  </TooltipTrigger>
                  <TooltipContent side="right">{TIPO_TOOLTIP[t]}</TooltipContent>
                </Tooltip>
              ))}
            </TooltipProvider>
          </SelectContent>
        </Select>
      </td>

      <td className="px-2 py-1.5">
        <Select value={p.formato} onValueChange={(v) => updatePublicacion(ctx.tareaId, p.id, { formato: v as PublicacionRRSS["formato"] })}>
          <SelectTrigger className="h-7 text-xs px-2 w-[130px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <TooltipProvider delayDuration={300}>
              {FORMATOS.map((f) => (
                <Tooltip key={f}>
                  <TooltipTrigger asChild>
                    <SelectItem value={f}>{FORMATO_LABEL[f]}</SelectItem>
                  </TooltipTrigger>
                  <TooltipContent side="right">{FORMATO_TOOLTIP[f]}</TooltipContent>
                </Tooltip>
              ))}
            </TooltipProvider>
          </SelectContent>
        </Select>
      </td>

      <td className="px-2 py-1.5">
        <PlataformasCell p={p} ctx={ctx} />
      </td>

      <td className="px-2 py-1.5">
        <Select value={estado} onValueChange={(v) => updatePublicacion(ctx.tareaId, p.id, { estado: v as Estado })}>
          <SelectTrigger className={cn("h-7 text-xs px-2 w-[120px] border", ESTADO_PUB_COLOR[estado])}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <TooltipProvider delayDuration={300}>
              {ESTADOS.map((e) => (
                <Tooltip key={e}>
                  <TooltipTrigger asChild>
                    <SelectItem value={e}>{ESTADO_PUB_LABEL[e]}</SelectItem>
                  </TooltipTrigger>
                  <TooltipContent side="right">{ESTADO_PUB_TOOLTIP[e]}</TooltipContent>
                </Tooltip>
              ))}
            </TooltipProvider>
          </SelectContent>
        </Select>
      </td>

      <td className="px-2 py-1.5">
        <PersonaPicker
          value={p.responsable_diseno_id ?? undefined}
          onChange={(id) => setPublicacionResponsable(p.id, "diseno", id)}
          placeholder="—"
        />
      </td>
      <td className="px-2 py-1.5">
        <PersonaPicker
          value={p.responsable_copy_id ?? undefined}
          onChange={(id) => setPublicacionResponsable(p.id, "copy", id)}
          placeholder="—"
        />
      </td>

      <td className="px-2 py-1.5"><BriefingCell p={p} ctx={ctx} /></td>

      <td className="px-2 py-1.5">
        {tieneSlides ? (
          <button
            onClick={onOpenSlides}
            className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded hover:bg-muted border border-border"
          >
            <Layers className="h-3 w-3" />
            {p.slides?.length ?? 0}
          </button>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        )}
      </td>
      <td className="px-2 py-1.5 text-right">
        <PublicacionAvanceRapido pub={p} ctx={ctx} />
      </td>
    </tr>
  );
}

function FechaCell({ p }: { p: PublicacionRRSS }) {
  const [open, setOpen] = React.useState(false);
  const d = parseISO(p.fecha);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded hover:bg-muted">
          <CalendarIcon className="h-3 w-3 text-muted-foreground" />
          {format(d, "d MMM yyyy", { locale: es })}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <DayCalendar
          mode="single"
          selected={d}
          onSelect={(nd) => {
            if (!nd) return;
            const iso = `${nd.getFullYear()}-${String(nd.getMonth() + 1).padStart(2, "0")}-${String(nd.getDate()).padStart(2, "0")}`;
            updatePublicacion("", p.id, { fecha: iso });
            setOpen(false);
          }}
          initialFocus
          className={cn("p-3 pointer-events-auto")}
        />
      </PopoverContent>
    </Popover>
  );
}

function PlataformasCell({
  p,
  ctx,
}: {
  p: PublicacionRRSS;
  ctx: { tareaId: string; entregaId: string; clienteId: string };
}) {
  const toggle = (v: Plat) => {
    const set = new Set(p.plataformas);
    if (set.has(v)) set.delete(v);
    else set.add(v);
    updatePublicacion(ctx.tareaId, p.id, { plataformas: Array.from(set) as Plat[] });
  };
  return (
    <div className="inline-flex items-center gap-0.5">
      {PLATAFORMAS.map(({ value, label, Icon }) => {
        const on = p.plataformas.includes(value);
        return (
          <button
            key={value}
            type="button"
            title={label}
            onClick={() => toggle(value)}
            className={cn(
              "h-6 w-6 inline-flex items-center justify-center rounded transition",
              on ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:bg-muted",
            )}
          >
            <Icon className="h-3 w-3" />
          </button>
        );
      })}
    </div>
  );
}

function BriefingCell({
  p,
  ctx,
}: {
  p: PublicacionRRSS;
  ctx: { tareaId: string; entregaId: string; clienteId: string };
}) {
  const [open, setOpen] = React.useState(false);
  const [text, setText] = React.useState(p.briefing ?? "");
  React.useEffect(() => setText(p.briefing ?? ""), [p.briefing]);
  const guardar = () => {
    if ((text ?? "") !== (p.briefing ?? "")) {
      updatePublicacion(ctx.tareaId, p.id, { briefing: text.trim() || null });
    }
    setOpen(false);
  };
  return (
    <Popover open={open} onOpenChange={(o) => (o ? setOpen(true) : guardar())}>
      <PopoverTrigger asChild>
        <button className="text-left text-xs px-2 py-1 rounded hover:bg-muted w-full truncate max-w-[260px]">
          {p.briefing || <span className="text-muted-foreground italic">Sin briefing</span>}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-2" align="start">
        <Textarea
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Idea, mensaje clave, CTA…"
          className="min-h-[100px] text-sm"
        />
        <div className="flex justify-end mt-2">
          <Button size="sm" onClick={guardar}>Guardar</Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function BulkBar({
  ids,
  onClear,
  ctx,
}: {
  ids: string[];
  onClear: () => void;
  ctx: { tareaId: string; entregaId: string; clienteId: string };
}) {
  const [shift, setShift] = React.useState(7);
  return (
    <div className="card-soft p-2 px-3 flex items-center gap-2 flex-wrap bg-primary/5 border-primary/20">
      <span className="text-xs font-medium">{ids.length} seleccionada{ids.length !== 1 && "s"}</span>

      <Select onValueChange={(v) => { bulkUpdatePublicaciones(ids, { estado: v as Estado }); toast.success("Estado actualizado"); onClear(); }}>
        <SelectTrigger className="h-7 text-xs w-[140px]"><SelectValue placeholder="Cambiar estado" /></SelectTrigger>
        <SelectContent>
          {ESTADOS.map((e) => <SelectItem key={e} value={e}>{ESTADO_PUB_LABEL[e]}</SelectItem>)}
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger asChild>
          <Button size="sm" variant="outline">Cambiar fecha</Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-3 space-y-2">
          <label className="text-xs text-muted-foreground">Desplazar por días</label>
          <Input type="number" value={shift} onChange={(e) => setShift(Number(e.target.value) || 0)} className="h-8" />
          <Button size="sm" className="w-full" onClick={async () => {
            await bulkShiftFechas(ids, shift);
            toast.success(`Fechas desplazadas ${shift >= 0 ? "+" : ""}${shift} días`);
            onClear();
          }}>Aplicar</Button>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button size="sm" variant="outline">Reasignar diseño</Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2">
          <PersonaPicker onChange={(uid) => { bulkUpdatePublicaciones(ids, { responsable_diseno_id: uid }); toast.success("Diseño reasignado"); onClear(); }} />
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button size="sm" variant="outline">Reasignar copy</Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2">
          <PersonaPicker onChange={(uid) => { bulkUpdatePublicaciones(ids, { responsable_copy_id: uid }); toast.success("Copy reasignado"); onClear(); }} />
        </PopoverContent>
      </Popover>

      <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700"
        onClick={async () => {
          for (const id of ids) removePublicacion(ctx.tareaId, id);
          toast.success(`${ids.length} eliminada${ids.length !== 1 ? "s" : ""}`);
          onClear();
        }}
      >
        Eliminar
      </Button>
      <Badge variant="outline" className="ml-auto cursor-pointer" onClick={onClear}>Cancelar selección</Badge>
    </div>
  );
}