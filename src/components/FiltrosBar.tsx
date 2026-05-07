import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Search, Filter } from "lucide-react";
import { CLIENTES_MOCK } from "@/lib/mock-tareas";
import { EQUIPO } from "@/lib/equipo";
import { cn } from "@/lib/utils";

export interface FiltrosState {
  q: string;
  cliente: string;
  responsable: string;
  estado: string;
}

const VACIO: FiltrosState = { q: "", cliente: "", responsable: "", estado: "" };

export function useFiltros(storageKey: string): [FiltrosState, (n: Partial<FiltrosState>) => void, () => void] {
  const [state, setState] = React.useState<FiltrosState>(VACIO);
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setState({ ...VACIO, ...JSON.parse(raw) });
    } catch {}
  }, [storageKey]);
  const update = React.useCallback((n: Partial<FiltrosState>) => {
    setState((prev) => {
      const next = { ...prev, ...n };
      try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch {}
      return next;
    });
  }, [storageKey]);
  const reset = React.useCallback(() => {
    setState(VACIO);
    try { localStorage.removeItem(storageKey); } catch {}
  }, [storageKey]);
  return [state, update, reset];
}

interface Props {
  state: FiltrosState;
  onChange: (n: Partial<FiltrosState>) => void;
  onReset: () => void;
  estados?: { value: string; label: string }[];
  placeholder?: string;
  hideCliente?: boolean;
  hideResponsable?: boolean;
}

export function FiltrosBar({ state, onChange, onReset, estados, placeholder = "Buscar…", hideCliente, hideResponsable }: Props) {
  const activos =
    (state.q ? 1 : 0) +
    (state.cliente ? 1 : 0) +
    (state.responsable ? 1 : 0) +
    (state.estado ? 1 : 0);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="relative max-w-xs flex-1 min-w-[200px]">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          value={state.q}
          onChange={(e) => onChange({ q: e.target.value })}
          className="pl-8 h-9"
        />
      </div>
      {!hideCliente && (
        <Select value={state.cliente} onChange={(v) => onChange({ cliente: v })} placeholder="Cliente">
          <option value="">Todos los clientes</option>
          {CLIENTES_MOCK.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </Select>
      )}
      {!hideResponsable && (
        <Select value={state.responsable} onChange={(v) => onChange({ responsable: v })} placeholder="Persona">
          <option value="">Toda la gente</option>
          {EQUIPO.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
        </Select>
      )}
      {estados && (
        <Select value={state.estado} onChange={(v) => onChange({ estado: v })} placeholder="Estado">
          <option value="">Todos los estados</option>
          {estados.map((e) => <option key={e.value} value={e.value}>{e.label}</option>)}
        </Select>
      )}
      {activos > 0 && (
        <Button variant="ghost" size="sm" onClick={onReset} className="h-9 gap-1.5 text-muted-foreground">
          <X className="h-3.5 w-3.5" />
          Limpiar ({activos})
        </Button>
      )}
      {activos > 0 && (
        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
          <Filter className="h-3 w-3" /> filtrando
        </span>
      )}
    </div>
  );
}

function Select({ value, onChange, children, placeholder }: { value: string; onChange: (v: string) => void; children: React.ReactNode; placeholder?: string }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "text-sm border border-border rounded-md px-2 h-9 bg-background hover:bg-muted/40 transition cursor-pointer",
        value && "border-blue-400 bg-blue-50/30 text-blue-900",
      )}
      aria-label={placeholder}
    >
      {children}
    </select>
  );
}
