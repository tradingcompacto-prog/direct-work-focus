import * as React from "react";
import { ChevronUp, ChevronDown, Trash2, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { updatePublicacion } from "@/lib/plan-rrss-store";

type Slide = { texto?: string; imagen_url?: string };

export function SlidesEditor({
  publicacionId,
  publicacionLabel,
  slides: initial,
  open,
  onOpenChange,
}: {
  publicacionId: string;
  publicacionLabel: string;
  slides: Slide[];
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [slides, setSlides] = React.useState<Slide[]>(initial ?? []);

  React.useEffect(() => {
    if (open) setSlides(initial ?? []);
  }, [open, initial]);

  const mover = (i: number, delta: -1 | 1) => {
    const j = i + delta;
    if (j < 0 || j >= slides.length) return;
    const arr = [...slides];
    [arr[i], arr[j]] = [arr[j], arr[i]];
    setSlides(arr);
  };

  const editar = (i: number, patch: Partial<Slide>) =>
    setSlides((arr) => arr.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));

  const guardar = () => {
    const limpio = slides
      .map((s) => ({
        texto: s.texto?.trim() || undefined,
        imagen_url: s.imagen_url?.trim() || undefined,
      }))
      .filter((s) => s.texto || s.imagen_url);
    updatePublicacion("", publicacionId, { slides: limpio });
    toast.success(`Slides guardados (${limpio.length})`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Slides — {publicacionLabel}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {slides.length === 0 && (
            <div className="text-sm text-muted-foreground py-6 text-center border border-dashed rounded-md">
              Aún no hay slides. Añade el primero.
            </div>
          )}
          {slides.map((s, i) => (
            <div key={i} className="border border-border rounded-md p-3 space-y-2 bg-muted/20">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">
                  Slide {i + 1}
                </span>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" className="h-7 w-7"
                    onClick={() => mover(i, -1)} disabled={i === 0}>
                    <ChevronUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7"
                    onClick={() => mover(i, 1)} disabled={i === slides.length - 1}>
                    <ChevronDown className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-red-600"
                    onClick={() => setSlides((arr) => arr.filter((_, idx) => idx !== i))}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground">Texto</label>
                <Textarea
                  value={s.texto ?? ""}
                  onChange={(e) => editar(i, { texto: e.target.value })}
                  placeholder="Título atractivo, copy del slide…"
                  className="min-h-[60px] text-sm"
                />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground">URL imagen</label>
                <Input
                  value={s.imagen_url ?? ""}
                  onChange={(e) => editar(i, { imagen_url: e.target.value })}
                  placeholder="https://…"
                  className="h-8 text-sm"
                />
              </div>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSlides((arr) => [...arr, { texto: "", imagen_url: "" }])}
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Añadir slide
          </Button>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={guardar}>Cerrar y guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}