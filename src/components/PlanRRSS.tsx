import * as React from "react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Plus, Copy, Trash2, Instagram, Facebook, Linkedin, Music2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as DayCalendar } from "@/components/ui/calendar";
import {
  usePlanRRSS,
  addPublicacion,
  updatePublicacion,
  removePublicacion,
  duplicarPublicacion,
} from "@/lib/plan-rrss-store";
import type { PublicacionRRSS } from "@/types/database";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Plat = PublicacionRRSS["plataformas"][number];
type Tipo = PublicacionRRSS["tipo"];
type Formato = PublicacionRRSS["formato"];

const TIPOS: { value: Tipo; label: string }[] = [
  { value: "post", label: "Post" },
  { value: "reel", label: "Reel" },
  { value: "carrusel", label: "Carrusel" },
  { value: "story", label: "Story" },
];
const FORMATOS: { value: Formato; label: string }[] = [
  { value: "solo_copy", label: "Solo copy" },
  { value: "copy_imagen", label: "Copy + imagen" },
  { value: "solo_imagen", label: "Solo imagen" },
  { value: "slide", label: "Slides" },
];
const PLATAFORMAS: { value: Plat; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { value: "ig", label: "Instagram", Icon: Instagram },
  { value: "fb", label: "Facebook", Icon: Facebook },
  { value: "li", label: "LinkedIn", Icon: Linkedin },
  { value: "tt", label: "TikTok", Icon: Music2 },
];

const tipoColor: Record<Tipo, string> = {
  post: "bg-blue-100 text-blue-700 border-blue-200",
  reel: "bg-pink-100 text-pink-700 border-pink-200",
  carrusel: "bg-violet-100 text-violet-700 border-violet-200",
  story: "bg-amber-100 text-amber-700 border-amber-200",
};

export function PlanRRSS({
  tareaId,
  entregaId,
  clienteId,
}: {
  tareaId: string;
  entregaId: string;
  clienteId: string;
}) {
  const { data: plan = [] } = usePlanRRSS(tareaId);
  const [editing, setEditing] = React.useState<PublicacionRRSS | null>(null);
  const [creando, setCreando] = React.useState(false);
  const ctx = { tareaId, entregaId, clienteId };

  const ordenado = [...plan].sort((a, b) => a.fecha.localeCompare(b.fecha));

  return (
    <div className="card-soft p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Plan de contenido
          </h3>
          <p className="text-xs text-muted-foreground/80 mt-0.5">
            {ordenado.length} publicacion{ordenado.length === 1 ? "" : "es"} planificada{ordenado.length === 1 ? "" : "s"}
          </p>
        </div>
        <Button size="sm" onClick={() => setCreando(true)}>
          <Plus className="h-4 w-4 mr-1" /> Publicación
        </Button>
      </div>

      {ordenado.length === 0 ? (
        <div className="text-sm text-muted-foreground py-8 text-center">
          Aún no hay publicaciones. Empieza añadiendo la primera.
        </div>
      ) : (
        <div className="space-y-1.5">
          {ordenado.map((p) => (
            <FilaPublicacion
              key={p.id}
              p={p}
              onClick={() => setEditing(p)}
              onDuplicar={() => {
                duplicarPublicacion(ctx, p.id);
                toast.success("Publicación duplicada");
              }}
              onEliminar={() => {
                removePublicacion(tareaId, p.id);
                toast.success("Publicación eliminada");
              }}
            />
          ))}
        </div>
      )}

      {creando && (
        <PublicacionDialog
          onClose={() => setCreando(false)}
          onSubmit={(data) => {
            addPublicacion(ctx, data);
            setCreando(false);
            toast.success("Publicación añadida");
          }}
        />
      )}
      {editing && (
        <PublicacionDialog
          inicial={editing}
          onClose={() => setEditing(null)}
          onSubmit={(data) => {
            updatePublicacion(tareaId, editing.id, data);
            setEditing(null);
            toast.success("Publicación actualizada");
          }}
        />
      )}
    </div>
  );
}

function FilaPublicacion({
  p, onClick, onDuplicar, onEliminar,
}: {
  p: PublicacionRRSS;
  onClick: () => void;
  onDuplicar: () => void;
  onEliminar: () => void;
}) {
  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-md border border-border hover:bg-muted/40 transition group">
      <div className="text-xs font-medium tabular-nums text-muted-foreground w-16 shrink-0">
        {format(parseISO(p.fecha), "d MMM", { locale: es })}
      </div>
      <Badge variant="outline" className={cn("text-[10px] shrink-0", tipoColor[p.tipo])}>
        {TIPOS.find((t) => t.value === p.tipo)?.label}
      </Badge>
      <button onClick={onClick} className="flex-1 text-left text-sm truncate">
        {p.briefing || <span className="text-muted-foreground italic">Sin briefing</span>}
      </button>
      <div className="flex items-center gap-1 shrink-0">
        {p.plataformas.map((pl) => {
          const meta = PLATAFORMAS.find((x) => x.value === pl);
          if (!meta) return null;
          const { Icon } = meta;
          return <Icon key={pl} className="h-3.5 w-3.5 text-muted-foreground" />;
        })}
      </div>
      <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition">
        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onDuplicar} title="Duplicar">
          <Copy className="h-3.5 w-3.5" />
        </Button>
        <Button size="icon" variant="ghost" className="h-7 w-7 text-red-600 hover:text-red-700" onClick={onEliminar} title="Eliminar">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

function PublicacionDialog({
  inicial, onClose, onSubmit,
}: {
  inicial?: PublicacionRRSS;
  onClose: () => void;
  onSubmit: (data: Omit<PublicacionRRSS, "id">) => void;
}) {
  const [fecha, setFecha] = React.useState(inicial?.fecha ?? new Date().toISOString().slice(0, 10));
  const [tipo, setTipo] = React.useState<Tipo>(inicial?.tipo ?? "post");
  const [formato, setFormato] = React.useState<Formato>(inicial?.formato ?? "copy_imagen");
  const [plataformas, setPlataformas] = React.useState<Plat[]>(inicial?.plataformas ?? ["ig"]);
  const [briefing, setBriefing] = React.useState(inicial?.briefing ?? "");
  const [slides, setSlides] = React.useState<string[]>(inicial?.slides ?? []);
  const [openCal, setOpenCal] = React.useState(false);

  const togglePlat = (p: Plat) =>
    setPlataformas((arr) => (arr.includes(p) ? arr.filter((x) => x !== p) : [...arr, p]));

  const submit = () => {
    if (plataformas.length === 0) {
      toast.error("Selecciona al menos una plataforma");
      return;
    }
    onSubmit({
      fecha, tipo, formato, plataformas, briefing: briefing.trim() || undefined,
      slides: formato === "slide" ? slides.filter((s) => s.trim()) : undefined,
    });
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{inicial ? "Editar publicación" : "Nueva publicación"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Fecha</label>
              <Popover open={openCal} onOpenChange={setOpenCal}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start font-normal mt-1">
                    {format(parseISO(fecha), "d MMM yyyy", { locale: es })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <DayCalendar
                    mode="single"
                    selected={parseISO(fecha)}
                    onSelect={(d) => {
                      if (!d) return;
                      setFecha(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
                      setOpenCal(false);
                    }}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Tipo</label>
              <Select value={tipo} onValueChange={(v) => setTipo(v as Tipo)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TIPOS.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">Formato</label>
            <Select value={formato} onValueChange={(v) => setFormato(v as Formato)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {FORMATOS.map((f) => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">Plataformas</label>
            <div className="flex flex-wrap gap-2 mt-1.5">
              {PLATAFORMAS.map(({ value, label, Icon }) => {
                const on = plataformas.includes(value);
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => togglePlat(value)}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium transition",
                      on
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-foreground border-border hover:bg-muted",
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">Briefing</label>
            <Textarea
              value={briefing}
              onChange={(e) => setBriefing(e.target.value)}
              placeholder="Idea, mensaje clave, CTA…"
              className="mt-1 min-h-[80px]"
            />
          </div>

          {formato === "slide" && (
            <div>
              <label className="text-xs font-medium text-muted-foreground">Slides</label>
              <div className="space-y-1.5 mt-1.5">
                {slides.map((s, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-xs text-muted-foreground w-5 shrink-0 self-center">{i + 1}</span>
                    <Input
                      value={s}
                      onChange={(e) => setSlides((arr) => arr.map((x, idx) => (idx === i ? e.target.value : x)))}
                      placeholder={`Slide ${i + 1}`}
                    />
                    <Button size="icon" variant="ghost" className="h-9 w-9 shrink-0" onClick={() => setSlides((arr) => arr.filter((_, idx) => idx !== i))}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
                <Button size="sm" variant="outline" onClick={() => setSlides((arr) => [...arr, ""])}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Añadir slide
                </Button>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={submit}>{inicial ? "Guardar" : "Añadir"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}