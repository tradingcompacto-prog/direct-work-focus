import * as React from "react";
import { Check, ChevronDown, Plus } from "lucide-react";
import { useEquipo } from "@/lib/queries";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { miembroPorId } from "@/lib/equipo";

interface Props {
  value?: string | null;
  onChange: (id: string) => void;
  excludeIds?: string[];
  placeholder?: string;
  triggerVariant?: "inline" | "add";
}

export function PersonaPicker({
  value,
  onChange,
  excludeIds = [],
  placeholder = "Selecciona…",
  triggerVariant = "inline",
}: Props) {
  const { data: equipo = [] } = useEquipo();
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState("");
  const current = value ? miembroPorId(value) : undefined;
  const filtrados = React.useMemo(() => {
    const ex = new Set(excludeIds);
    return equipo.filter(
      (m) =>
        m.activo &&
        !ex.has(m.id) &&
        (!q.trim() || m.nombre.toLowerCase().includes(q.toLowerCase())),
    );
  }, [equipo, excludeIds, q]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {triggerVariant === "add" ? (
          <button
            type="button"
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-dashed border-border text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Plus className="h-3 w-3" /> Añadir
          </button>
        ) : (
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-muted text-sm"
          >
            {current ? (
              <>
                <Avatar className="h-5 w-5">
                  <AvatarFallback className="text-[9px] bg-secondary">
                    {current.iniciales}
                  </AvatarFallback>
                </Avatar>
                <span>{current.nombre}</span>
              </>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <div className="p-2 border-b border-border">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar…"
            className="h-8"
            autoFocus
          />
        </div>
        <div className="max-h-64 overflow-y-auto py-1">
          {filtrados.length === 0 && (
            <div className="px-3 py-2 text-sm text-muted-foreground">Sin resultados</div>
          )}
          {filtrados.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                onChange(m.id);
                setOpen(false);
                setQ("");
              }}
              className={cn(
                "w-full text-left flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-muted",
                value === m.id && "bg-muted",
              )}
            >
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-[10px] bg-secondary">
                  {m.iniciales}
                </AvatarFallback>
              </Avatar>
              <span className="flex-1 truncate">{m.nombre}</span>
              {value === m.id && <Check className="h-3.5 w-3.5 text-emerald-600" />}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}