import * as React from "react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Trash2, Edit3, Check, X } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth";
import { miembroPorId } from "@/lib/equipo";
import {
  usePublicacionComentarios,
  addComentario,
  updateComentario,
  removeComentario,
} from "@/lib/publicacion-comentarios-store";

export function PublicacionComentarios({ publicacionId }: { publicacionId: string }) {
  const { data: comentarios = [] } = usePublicacionComentarios(publicacionId);
  const { user } = useAuth();
  const [draft, setDraft] = React.useState("");
  const [editId, setEditId] = React.useState<string | null>(null);
  const [editTxt, setEditTxt] = React.useState("");

  const enviar = async () => {
    if (!draft.trim()) return;
    await addComentario(publicacionId, draft);
    setDraft("");
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
        {comentarios.length === 0 && (
          <div className="text-xs text-muted-foreground italic">Aún sin comentarios.</div>
        )}
        {comentarios.map((c) => {
          const m = miembroPorId(c.user_id);
          const mine = user?.id === c.user_id;
          const editing = editId === c.id;
          return (
            <div key={c.id} className="flex gap-2 group">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="text-[10px] bg-secondary">
                  {m?.iniciales ?? "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="text-xs">
                  <span className="font-medium">{m?.nombre ?? "Usuario"}</span>
                  <span className="text-muted-foreground ml-2">
                    {formatDistanceToNow(parseISO(c.created_at), { locale: es, addSuffix: true })}
                  </span>
                </div>
                {editing ? (
                  <div className="space-y-1 mt-1">
                    <Textarea
                      value={editTxt}
                      onChange={(e) => setEditTxt(e.target.value)}
                      className="min-h-[60px] text-sm"
                    />
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => setEditId(null)}>
                        <X className="h-3 w-3" />
                      </Button>
                      <Button size="sm" onClick={async () => {
                        await updateComentario(publicacionId, c.id, editTxt);
                        setEditId(null);
                      }}>
                        <Check className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm whitespace-pre-wrap break-words">{c.contenido}</div>
                )}
                {mine && !editing && (
                  <div className="flex gap-2 mt-0.5 opacity-0 group-hover:opacity-100 transition">
                    <button
                      className="text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-0.5"
                      onClick={() => { setEditId(c.id); setEditTxt(c.contenido); }}
                    >
                      <Edit3 className="h-2.5 w-2.5" /> editar
                    </button>
                    <button
                      className="text-[11px] text-red-600 hover:text-red-700 inline-flex items-center gap-0.5"
                      onClick={() => removeComentario(publicacionId, c.id)}
                    >
                      <Trash2 className="h-2.5 w-2.5" /> borrar
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="space-y-1 border-t border-border pt-2">
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              enviar();
            }
          }}
          placeholder="Escribir comentario… (Enter para enviar, Shift+Enter salto de línea)"
          className="min-h-[60px] text-sm"
        />
        <div className="flex justify-end">
          <Button size="sm" onClick={enviar} disabled={!draft.trim()}>Enviar</Button>
        </div>
      </div>
    </div>
  );
}