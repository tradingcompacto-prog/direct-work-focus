import * as React from "react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  CalendarIcon,
  Instagram,
  Facebook,
  Linkedin,
  Music2,
  ChevronUp,
  ChevronDown,
  Trash2,
  Plus,
  Table as TableIcon,
  X,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PersonaPicker } from "@/components/PersonaPicker";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  usePublicacion,
  usePlanRRSS,
  updatePublicacion,
  setPublicacionCopy,
  setPublicacionResponsable,
} from "@/lib/plan-rrss-store";
import { useDataset } from "@/lib/queries";
import {
  ESTADO_PUB_COLOR,
  ESTADO_PUB_LABEL,
  FORMATO_LABEL,
  TIPO_LABEL,
  type PublicacionRRSS,
} from "@/types/database";
import { PublicacionRecursos } from "./PublicacionRecursos";
import { PublicacionReferencias } from "./PublicacionReferencias";
import { PublicacionComentarios } from "./PublicacionComentarios";

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

function aplicaSlides(p: PublicacionRRSS) {
  return p.tipo === "carrusel" || p.formato === "slide";
}

interface Props {
  publicacionId: string | null;
  onOpenChange: (open: boolean) => void;
  onChangeId?: (id: string) => void;
}

export function PublicacionPanel({ publicacionId, onOpenChange, onChangeId }: Props) {
  const open = !!publicacionId;
  const { data: pub } = usePublicacion(publicacionId);
  const { data: siblings = [] } = usePlanRRSS(pub?.tarea_id);
  const ordenado = React.useMemo(
    () => [...siblings].sort((a, b) => a.fecha.localeCompare(b.fecha)),
    [siblings],
  );
  const ds = useDataset();

  const idx = pub ? ordenado.findIndex((p) => p.id === pub.id) : -1;
  const prev = idx > 0 ? ordenado[idx - 1] : null;
  const next = idx >= 0 && idx < ordenado.length - 1 ? ordenado[idx + 1] : null;

  const tareaTitulo = pub?.tarea_id ? ds.tituloTarea(pub.tarea_id) : "";
  const clienteNombre = pub?.cliente_id ? ds.nombreCliente(pub.cliente_id) : "";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl lg:max-w-3xl p-0 flex flex-col gap-0"
      >
        {!pub ? (
          <div className="p-6 text-sm text-muted-foreground">Cargando…</div>
        ) : (
          <>
            {/* Cabecera fija */}
            <div className="border-b border-border px-5 py-3 flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  disabled={!prev}
                  onClick={() => prev && onChangeId?.(prev.id)}
                  title="Anterior"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  disabled={!next}
                  onClick={() => next && onChangeId?.(next.id)}
                  title="Siguiente"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1 min-w-0">
                <SheetTitle className="text-base truncate">
                  Pub #{idx + 1}
                  {tareaTitulo && (
                    <span className="text-muted-foreground font-normal"> · {tareaTitulo}</span>
                  )}
                  {clienteNombre && (
                    <span className="text-muted-foreground font-normal"> · {clienteNombre}</span>
                  )}
                </SheetTitle>
                <SheetDescription className="sr-only">Editor de publicación</SheetDescription>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                <TableIcon className="h-3.5 w-3.5 mr-1" /> Ver tabla
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Cuerpo scrollable */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              <PropiedadesRapidas pub={pub} />

              <Accordion
                type="multiple"
                defaultValue={["briefing", "copy", "recursos"]}
                className="space-y-1"
              >
                <Seccion
                  id="briefing"
                  titulo="Briefing"
                  ayuda="Qué queremos contar/lograr. La idea conceptual."
                >
                  <BriefingEditor pub={pub} />
                </Seccion>

                <Seccion
                  id="copy"
                  titulo="Copy (caption final)"
                  ayuda="El texto exacto que va publicado en redes."
                >
                  <CopyEditor pub={pub} />
                </Seccion>

                <Seccion
                  id="recursos"
                  titulo={`Recursos visuales (${pub.recursos_visuales?.length ?? 0})`}
                  ayuda="Imágenes y vídeos finales que se publican."
                >
                  <PublicacionRecursos
                    publicacionId={pub.id}
                    recursos={pub.recursos_visuales ?? []}
                  />
                </Seccion>

                <Seccion
                  id="referencias"
                  titulo="Referencias / Inspiración"
                  ayuda="Links a ejemplos, capturas, ideas que nos inspiran."
                >
                  <PublicacionReferencias publicacionId={pub.id} />
                </Seccion>

                {aplicaSlides(pub) && (
                  <Seccion
                    id="slides"
                    titulo={`Slides (${pub.slides?.length ?? 0})`}
                    ayuda="Cada slide del carrusel: texto + imagen."
                  >
                    <SlidesInline pub={pub} />
                  </Seccion>
                )}

                <Seccion
                  id="comentarios"
                  titulo="Comentarios"
                  ayuda="Hilo de conversación interna del equipo."
                >
                  <PublicacionComentarios publicacionId={pub.id} />
                </Seccion>

                {pub.estado === "publicado" && (
                  <Seccion
                    id="metricas"
                    titulo="Métricas"
                    ayuda="Datos de rendimiento tras publicar. Edición manual."
                  >
                    <MetricasEditor pub={pub} />
                  </Seccion>
                )}
              </Accordion>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Seccion({
  id, titulo, ayuda, children,
}: { id: string; titulo: string; ayuda: string; children: React.ReactNode }) {
  return (
    <AccordionItem value={id} className="border border-border rounded-md bg-background">
      <AccordionTrigger className="px-3 py-2 hover:no-underline text-sm font-semibold">
        {titulo}
      </AccordionTrigger>
      <AccordionContent className="px-3 pb-3">
        <div className="text-[11px] text-muted-foreground mb-2">{ayuda}</div>
        {children}
      </AccordionContent>
    </AccordionItem>
  );
}

function PropiedadesRapidas({ pub }: { pub: PublicacionRRSS }) {
  const estado = (pub.estado ?? "borrador") as Estado;
  const guardar = (patch: Partial<PublicacionRRSS>) => {
    updatePublicacion("", pub.id, patch);
  };
  const togglePlat = (v: Plat) => {
    const set = new Set(pub.plataformas);
    if (set.has(v)) set.delete(v); else set.add(v);
    guardar({ plataformas: Array.from(set) as Plat[] });
  };
  const fecha = parseISO(pub.fecha);
  const [fechaOpen, setFechaOpen] = React.useState(false);

  return (
    <div className="card-soft p-3 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
      {/* Fecha */}
      <div>
        <label className="text-[10px] text-muted-foreground block mb-0.5">Fecha</label>
        <Popover open={fechaOpen} onOpenChange={setFechaOpen}>
          <PopoverTrigger asChild>
            <button className="inline-flex items-center gap-1 px-2 py-1 rounded border border-border hover:bg-muted w-full justify-start">
              <CalendarIcon className="h-3 w-3" />
              {format(fecha, "d MMM yyyy", { locale: es })}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <DayCalendar
              mode="single"
              selected={fecha}
              onSelect={(nd) => {
                if (!nd) return;
                const iso = `${nd.getFullYear()}-${String(nd.getMonth() + 1).padStart(2, "0")}-${String(nd.getDate()).padStart(2, "0")}`;
                guardar({ fecha: iso });
                setFechaOpen(false);
              }}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Hora */}
      <div>
        <label className="text-[10px] text-muted-foreground block mb-0.5">Hora</label>
        <Input
          type="time"
          defaultValue={pub.hora ?? ""}
          onBlur={(e) => {
            const v = e.target.value || null;
            if (v !== (pub.hora ?? null)) guardar({ hora: v });
          }}
          className="h-7 text-xs"
        />
      </div>

      {/* Estado */}
      <div>
        <label className="text-[10px] text-muted-foreground block mb-0.5">Estado</label>
        <Select value={estado} onValueChange={(v) => guardar({ estado: v as Estado })}>
          <SelectTrigger className={cn("h-7 text-xs border", ESTADO_PUB_COLOR[estado])}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ESTADOS.map((e) => (
              <SelectItem key={e} value={e}>{ESTADO_PUB_LABEL[e]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tipo */}
      <div>
        <label className="text-[10px] text-muted-foreground block mb-0.5">Tipo</label>
        <Select value={pub.tipo} onValueChange={(v) => guardar({ tipo: v as PublicacionRRSS["tipo"] })}>
          <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {TIPOS.map((t) => <SelectItem key={t} value={t}>{TIPO_LABEL[t]}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Formato */}
      <div>
        <label className="text-[10px] text-muted-foreground block mb-0.5">Formato</label>
        <Select value={pub.formato} onValueChange={(v) => guardar({ formato: v as PublicacionRRSS["formato"] })}>
          <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {FORMATOS.map((f) => <SelectItem key={f} value={f}>{FORMATO_LABEL[f]}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Plataformas */}
      <div>
        <label className="text-[10px] text-muted-foreground block mb-0.5">Plataformas</label>
        <div className="inline-flex items-center gap-0.5">
          {PLATAFORMAS.map(({ value, label, Icon }) => {
            const on = pub.plataformas.includes(value);
            return (
              <button
                key={value}
                title={label}
                onClick={() => togglePlat(value)}
                className={cn(
                  "h-7 w-7 inline-flex items-center justify-center rounded transition",
                  on ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:bg-muted",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Responsables */}
      <div>
        <label className="text-[10px] text-muted-foreground block mb-0.5">Diseño</label>
        <PersonaPicker
          value={pub.responsable_diseno_id ?? undefined}
          onChange={(id) => setPublicacionResponsable(pub.id, "diseno", id)}
          placeholder="—"
        />
      </div>
      <div>
        <label className="text-[10px] text-muted-foreground block mb-0.5">Copy</label>
        <PersonaPicker
          value={pub.responsable_copy_id ?? undefined}
          onChange={(id) => setPublicacionResponsable(pub.id, "copy", id)}
          placeholder="—"
        />
      </div>
    </div>
  );
}

function BriefingEditor({ pub }: { pub: PublicacionRRSS }) {
  const [val, setVal] = React.useState(pub.briefing ?? "");
  React.useEffect(() => setVal(pub.briefing ?? ""), [pub.id, pub.briefing]);
  return (
    <Textarea
      value={val}
      onChange={(e) => setVal(e.target.value)}
      onBlur={() => {
        if ((val ?? "") !== (pub.briefing ?? "")) {
          updatePublicacion("", pub.id, { briefing: val.trim() || null });
          toast.success("Guardado", { duration: 1200 });
        }
      }}
      placeholder="Ej: lanzamiento del curso, tono inspirador, para inversores principiantes…"
      className="min-h-[100px] text-sm"
    />
  );
}

function CopyEditor({ pub }: { pub: PublicacionRRSS }) {
  const [val, setVal] = React.useState(pub.copy_final ?? "");
  React.useEffect(() => setVal(pub.copy_final ?? ""), [pub.id, pub.copy_final]);
  const len = val.length;
  const igExceed = pub.plataformas.includes("ig") && len > 2200;
  const ttExceed = pub.plataformas.includes("tt") && len > 300;
  return (
    <div className="space-y-1">
      <Textarea
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={() => {
          if ((val ?? "") !== (pub.copy_final ?? "")) {
            setPublicacionCopy(pub.id, val);
            toast.success("Guardado", { duration: 1200 });
          }
        }}
        placeholder="El texto que se publica…"
        className="min-h-[140px] text-sm"
      />
      <div className="flex items-center justify-between text-[11px]">
        <div className="space-x-2">
          {igExceed && <span className="text-red-600">Excede el límite de Instagram (2200)</span>}
          {ttExceed && <span className="text-red-600">Excede el límite de TikTok (300)</span>}
        </div>
        <span className="text-muted-foreground tabular-nums">{len} caracteres</span>
      </div>
    </div>
  );
}

function SlidesInline({ pub }: { pub: PublicacionRRSS }) {
  const [slides, setSlides] = React.useState(pub.slides ?? []);
  React.useEffect(() => setSlides(pub.slides ?? []), [pub.id, pub.slides]);

  const persist = (next: typeof slides) => {
    const limpio = next
      .map((s) => ({
        texto: s.texto?.trim() || undefined,
        imagen_url: s.imagen_url?.trim() || undefined,
      }))
      .filter((s) => s.texto || s.imagen_url);
    updatePublicacion("", pub.id, { slides: limpio });
    toast.success("Guardado", { duration: 1200 });
  };

  const mover = (i: number, delta: -1 | 1) => {
    const j = i + delta;
    if (j < 0 || j >= slides.length) return;
    const arr = [...slides];
    [arr[i], arr[j]] = [arr[j], arr[i]];
    setSlides(arr);
    persist(arr);
  };

  return (
    <div className="space-y-2">
      {slides.map((s, i) => (
        <div key={i} className="border border-border rounded-md p-2 space-y-2 bg-muted/20">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground">Slide {i + 1}</span>
            <div className="flex gap-0.5">
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => mover(i, -1)} disabled={i === 0}>
                <ChevronUp className="h-3 w-3" />
              </Button>
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => mover(i, 1)} disabled={i === slides.length - 1}>
                <ChevronDown className="h-3 w-3" />
              </Button>
              <Button
                size="icon" variant="ghost" className="h-6 w-6 text-red-600"
                onClick={() => {
                  const arr = slides.filter((_, idx) => idx !== i);
                  setSlides(arr);
                  persist(arr);
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <Textarea
            value={s.texto ?? ""}
            onChange={(e) => setSlides((arr) => arr.map((x, idx) => idx === i ? { ...x, texto: e.target.value } : x))}
            onBlur={() => persist(slides)}
            placeholder="Texto del slide…"
            className="min-h-[50px] text-sm"
          />
          <Input
            value={s.imagen_url ?? ""}
            onChange={(e) => setSlides((arr) => arr.map((x, idx) => idx === i ? { ...x, imagen_url: e.target.value } : x))}
            onBlur={() => persist(slides)}
            placeholder="URL imagen"
            className="h-7 text-xs"
          />
        </div>
      ))}
      <Button
        size="sm" variant="outline"
        onClick={() => {
          const arr = [...slides, { texto: "", imagen_url: "" }];
          setSlides(arr);
        }}
      >
        <Plus className="h-3.5 w-3.5 mr-1" /> Añadir slide
      </Button>
    </div>
  );
}

function MetricasEditor({ pub }: { pub: PublicacionRRSS }) {
  type K = "impresiones" | "alcance" | "interacciones" | "ctr";
  const labels: Record<K, string> = {
    impresiones: "Impresiones",
    alcance: "Alcance",
    interacciones: "Interacciones",
    ctr: "CTR (%)",
  };
  const guardar = (k: K, raw: string) => {
    const num = raw === "" ? null : Number(raw);
    if (raw !== "" && Number.isNaN(num)) return;
    if ((pub[k] ?? null) !== num) {
      updatePublicacion("", pub.id, { [k]: num } as Partial<PublicacionRRSS>);
      toast.success("Guardado", { duration: 1200 });
    }
  };
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {(Object.keys(labels) as K[]).map((k) => (
        <div key={k}>
          <label className="text-[10px] text-muted-foreground block mb-0.5">{labels[k]}</label>
          <Input
            type="number"
            step={k === "ctr" ? "0.1" : "1"}
            defaultValue={pub[k] ?? ""}
            onBlur={(e) => guardar(k, e.target.value)}
            className="h-8 text-sm"
          />
        </div>
      ))}
    </div>
  );
}