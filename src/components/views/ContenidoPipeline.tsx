import * as React from "react";
import { POSTS_MOCK, ESTADO_LABEL, CANAL_COLOR, CANAL_LABEL, type EstadoPost, type Post } from "@/lib/mock-contenido";
import { clientePorId } from "@/lib/mock-tareas";
import { PersonaChip } from "@/components/PersonaChip";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { aplicarOverridesPosts, moverPost, usePostsOverridesVersion } from "@/lib/contenido-store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { FiltrosBar, useFiltros } from "@/components/FiltrosBar";

const COLUMNAS: EstadoPost[] = ["idea", "redaccion", "diseno", "revision", "programado", "publicado"];

export function ContenidoPipeline() {
  usePostsOverridesVersion();
  const todos = aplicarOverridesPosts(POSTS_MOCK);
  const [f, setF, resetF] = useFiltros("sa.filtros.pipeline");
  const [canal, setCanal] = React.useState<string>(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("sa.filtros.pipeline.canal") ?? "";
  });
  React.useEffect(() => {
    try {
      if (canal) localStorage.setItem("sa.filtros.pipeline.canal", canal);
      else localStorage.removeItem("sa.filtros.pipeline.canal");
    } catch {}
  }, [canal]);
  const posts = todos.filter((p) => {
    if (f.q && !p.titulo.toLowerCase().includes(f.q.toLowerCase())) return false;
    if (f.cliente && p.cliente_id !== f.cliente) return false;
    if (f.responsable && p.responsable_id !== f.responsable) return false;
    if (canal && p.canal !== canal) return false;
    return true;
  });
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const activePost = activeId ? posts.find((p) => p.id === activeId) : null;

  const onDragStart = (e: DragStartEvent) => setActiveId(String(e.active.id));
  const onDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    const id = String(e.active.id);
    const dest = e.over?.id as EstadoPost | undefined;
    if (!dest) return;
    const p = posts.find((x) => x.id === id);
    if (!p || p.estado === dest) return;
    moverPost(id, dest);
    toast.success(`«${p.titulo}» → ${ESTADO_LABEL[dest]}`);
  };

  return (
    <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <div className="space-y-4 anim-in">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Pipeline de contenido</h1>
          <p className="text-sm text-muted-foreground mt-1">Arrastra los posts entre columnas para cambiar su estado.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <FiltrosBar state={f} onChange={setF} onReset={() => { resetF(); setCanal(""); }} placeholder="Buscar posts…" />
          <select
            value={canal}
            onChange={(e) => setCanal(e.target.value)}
            className={cn(
              "text-sm border border-border rounded-md px-2 h-9 bg-background hover:bg-muted/40 transition cursor-pointer",
              canal && "border-blue-400 bg-blue-50/30 text-blue-900",
            )}
          >
            <option value="">Todos los canales</option>
            {Object.entries(CANAL_LABEL).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
          <div className="flex-1" />
          <span className="text-xs text-muted-foreground tabular-nums">
            {posts.length} de {todos.length}
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {COLUMNAS.map((col) => (
            <Columna key={col} estado={col} posts={posts.filter((p) => p.estado === col)} />
          ))}
        </div>
      </div>
      <DragOverlay>{activePost && <Tarjeta post={activePost} overlay />}</DragOverlay>
    </DndContext>
  );
}

function Columna({ estado, posts }: { estado: EstadoPost; posts: Post[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: estado });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "card-soft p-2 flex flex-col gap-2 min-h-[200px] transition-colors",
        isOver && "ring-2 ring-blue-400 ring-offset-2 bg-blue-50/40",
      )}
    >
      <div className="flex items-center justify-between px-1.5 pt-0.5">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{ESTADO_LABEL[estado]}</span>
        <span className="text-[10px] tabular-nums text-muted-foreground">{posts.length}</span>
      </div>
      <div className="space-y-1.5">
        {posts.length === 0 ? (
          <div className="text-center text-[10px] text-muted-foreground py-6 px-1">Suelta aquí</div>
        ) : (
          posts.map((p) => <Draggable key={p.id} post={p} />)
        )}
      </div>
    </div>
  );
}

function Draggable({ post }: { post: Post }) {
  const { setNodeRef, listeners, attributes, isDragging } = useDraggable({ id: post.id });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn("touch-none cursor-grab active:cursor-grabbing", isDragging && "opacity-30")}
    >
      <Tarjeta post={post} />
    </div>
  );
}

function Tarjeta({ post: p, overlay }: { post: Post; overlay?: boolean }) {
  return (
    <div className={cn("rounded-md border border-border bg-card p-2 hover:shadow-sm transition", overlay && "shadow-xl rotate-1")}>
      <div className="flex items-center gap-1.5 mb-1">
        <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: CANAL_COLOR[p.canal] }} />
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{CANAL_LABEL[p.canal]}</span>
      </div>
      <div className="text-xs font-medium leading-snug">{p.titulo}</div>
      <div className="text-[10px] text-muted-foreground truncate mt-0.5">{clientePorId(p.cliente_id)?.nombre}</div>
      <div className="flex items-center justify-between mt-2">
        <PersonaChip id={p.responsable_id} size="xs" showName={false} />
        <span className="text-[10px] text-muted-foreground">{format(parseISO(p.fecha), "d MMM", { locale: es })}</span>
      </div>
    </div>
  );
}
