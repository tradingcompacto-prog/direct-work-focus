import * as React from "react";
import { Link as LinkIcon, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  usePublicacionReferencias,
  addReferencia,
  removeReferencia,
} from "@/lib/publicacion-referencias-store";
import { toast } from "sonner";

export function PublicacionReferencias({ publicacionId }: { publicacionId: string }) {
  const { data: refs = [] } = usePublicacionReferencias(publicacionId);
  const [adding, setAdding] = React.useState(false);
  const [url, setUrl] = React.useState("");
  const [desc, setDesc] = React.useState("");

  const submit = async () => {
    if (!url.trim()) return;
    await addReferencia(publicacionId, url, desc);
    toast.success("Referencia añadida");
    setUrl(""); setDesc(""); setAdding(false);
  };

  return (
    <div className="space-y-2">
      {refs.length === 0 && !adding && (
        <div className="text-xs text-muted-foreground italic">Sin referencias aún.</div>
      )}
      {refs.map((r) => (
        <div
          key={r.id}
          className="group flex items-center gap-2 text-sm py-1 px-2 rounded hover:bg-muted/40"
        >
          <LinkIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <a
            href={r.url}
            target="_blank"
            rel="noreferrer"
            className="text-primary hover:underline truncate flex-1"
            title={r.url}
          >
            {r.url}
          </a>
          {r.descripcion && (
            <span className="text-xs text-muted-foreground truncate max-w-[180px]">
              · {r.descripcion}
            </span>
          )}
          <button
            onClick={() => removeReferencia(publicacionId, r.id)}
            className="opacity-0 group-hover:opacity-100 text-red-600 hover:bg-red-50 p-1 rounded"
            aria-label="Quitar referencia"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      ))}
      {adding ? (
        <div className="border border-dashed border-border rounded-md p-2 space-y-2 bg-muted/10">
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://…"
            className="h-8"
            autoFocus
          />
          <Input
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Descripción (opcional)"
            className="h-8"
          />
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>Cancelar</Button>
            <Button size="sm" onClick={submit}>Añadir</Button>
          </div>
        </div>
      ) : (
        <Button size="sm" variant="outline" onClick={() => setAdding(true)}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Añadir referencia
        </Button>
      )}
    </div>
  );
}