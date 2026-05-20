import * as React from "react";
import { ImageIcon, Film, Trash2, Plus, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addRecursoVisual, removeRecursoVisual } from "@/lib/plan-rrss-store";
import { toast } from "sonner";
import type { PublicacionRRSS } from "@/types/database";

type Recurso = NonNullable<PublicacionRRSS["recursos_visuales"]>[number];

export function PublicacionRecursos({
  publicacionId,
  recursos,
}: {
  publicacionId: string;
  recursos: Recurso[];
}) {
  const [adding, setAdding] = React.useState(false);
  const [url, setUrl] = React.useState("");
  const [tipo, setTipo] = React.useState<"imagen" | "video">("imagen");
  const [desc, setDesc] = React.useState("");

  const submit = async () => {
    if (!url.trim()) return;
    await addRecursoVisual(publicacionId, {
      url: url.trim(),
      tipo,
      descripcion: desc.trim() || undefined,
    });
    toast.success("Recurso añadido");
    setUrl(""); setDesc(""); setTipo("imagen"); setAdding(false);
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {recursos.map((r, i) => {
        const Icon = r.tipo === "video" ? Film : ImageIcon;
        const label = r.descripcion || r.url.split("/").pop() || r.url;
        return (
          <div
            key={i}
            className="group relative border border-border rounded-md p-2 bg-muted/20 hover:bg-muted/40"
          >
            <a
              href={r.url}
              target="_blank"
              rel="noreferrer"
              className="block space-y-1"
            >
              <Icon className="h-5 w-5 text-muted-foreground" />
              <div className="text-xs truncate" title={label}>{label}</div>
              <div className="text-[10px] text-muted-foreground inline-flex items-center gap-1">
                <ExternalLink className="h-2.5 w-2.5" /> abrir
              </div>
            </a>
            <button
              onClick={() => removeRecursoVisual(publicacionId, i)}
              className="opacity-0 group-hover:opacity-100 absolute top-1 right-1 p-1 text-red-600 hover:bg-red-50 rounded"
              aria-label="Quitar recurso"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        );
      })}
      {adding ? (
        <div className="col-span-2 sm:col-span-3 border border-dashed border-border rounded-md p-3 space-y-2 bg-muted/10">
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="URL del recurso (Drive, Dropbox, CDN…)"
            className="h-8"
            autoFocus
          />
          <div className="flex gap-2">
            <Select value={tipo} onValueChange={(v) => setTipo(v as "imagen" | "video")}>
              <SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="imagen">Imagen</SelectItem>
                <SelectItem value="video">Vídeo</SelectItem>
              </SelectContent>
            </Select>
            <Input
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Nombre corto (opcional)"
              className="h-8 flex-1"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>Cancelar</Button>
            <Button size="sm" onClick={submit}>Añadir</Button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="border border-dashed border-border rounded-md p-3 text-xs text-muted-foreground hover:bg-muted/30 flex flex-col items-center justify-center gap-1 min-h-[80px]"
        >
          <Plus className="h-4 w-4" /> Añadir recurso
        </button>
      )}
    </div>
  );
}