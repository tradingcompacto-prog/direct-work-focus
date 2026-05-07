import * as React from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useBusquedaGlobal } from "@/lib/busqueda-context";
import {
  CLIENTES_MOCK,
  PROYECTOS_MOCK,
  ENTREGAS_MOCK,
  TAREAS_MOCK,
  clientePorId,
  proyectoPorId,
} from "@/lib/mock-tareas";
import { EQUIPO } from "@/lib/equipo";
import { useTareaModal } from "@/lib/tarea-modal-context";
import { Building2, Folder, Package, ListChecks, User } from "lucide-react";

export function BusquedaGlobal() {
  const { abierto, cerrar } = useBusquedaGlobal();
  const [q, setQ] = React.useState("");
  const navigate = useNavigate();
  const { abrir } = useTareaModal();

  React.useEffect(() => {
    if (!abierto) setQ("");
  }, [abierto]);

  const ql = q.trim().toLowerCase();
  const filtra = <T extends { nombre?: string; titulo?: string }>(arr: T[], n: number): T[] =>
    !ql
      ? arr.slice(0, n)
      : arr.filter((x) => (x.nombre ?? x.titulo ?? "").toLowerCase().includes(ql)).slice(0, n);

  const clientes = filtra(CLIENTES_MOCK, 3);
  const proyectos = filtra(PROYECTOS_MOCK, 3);
  const entregas = filtra(ENTREGAS_MOCK, 5);
  const tareas = filtra(TAREAS_MOCK, 5);
  const personas = filtra(EQUIPO, 3);

  const ir = (path: string, params?: Record<string, string>) => {
    cerrar();
    navigate({ to: path as never, params: params as never });
  };

  return (
    <CommandDialog open={abierto} onOpenChange={(o) => (o ? null : cerrar())}>
      <CommandInput placeholder="Buscar clientes, proyectos, entregas, tareas..." value={q} onValueChange={setQ} />
      <CommandList>
        <CommandEmpty>Sin resultados</CommandEmpty>
        {clientes.length > 0 && (
          <CommandGroup heading="Clientes">
            {clientes.map((c) => (
              <CommandItem key={c.id} onSelect={() => ir("/clientes/$id", { id: c.id })}>
                <Building2 className="mr-2 h-4 w-4" /> {c.nombre}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        {proyectos.length > 0 && (
          <CommandGroup heading="Proyectos">
            {proyectos.map((p) => (
              <CommandItem key={p.id} onSelect={() => ir("/proyectos/$id", { id: p.id })}>
                <Folder className="mr-2 h-4 w-4" /> {p.nombre}
                <span className="ml-auto text-xs text-muted-foreground">
                  {clientePorId(p.cliente_id)?.nombre}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        {entregas.length > 0 && (
          <CommandGroup heading="Entregas">
            {entregas.map((e) => (
              <CommandItem key={e.id} onSelect={() => ir("/entregas/$id", { id: e.id })}>
                <Package className="mr-2 h-4 w-4" /> {e.nombre}
                <span className="ml-auto text-xs text-muted-foreground">
                  {clientePorId(e.cliente_id)?.nombre}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        {tareas.length > 0 && (
          <CommandGroup heading="Tareas">
            {tareas.map((t) => (
              <CommandItem
                key={t.id}
                onSelect={() => {
                  cerrar();
                  abrir(t.id);
                }}
              >
                <ListChecks className="mr-2 h-4 w-4" /> {t.titulo}
                <span className="ml-auto text-xs text-muted-foreground">
                  {clientePorId(t.cliente_id)?.nombre}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        {personas.length > 0 && (
          <CommandGroup heading="Personas">
            {personas.map((p) => (
              <CommandItem key={p.id} onSelect={() => ir("/personas/$id", { id: p.id })}>
                <User className="mr-2 h-4 w-4" /> {p.nombre}
                <span className="ml-auto text-xs text-muted-foreground">{p.rol}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
