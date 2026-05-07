import * as React from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface ComboboxOption {
  value: string;
  label: string;
  hint?: string;
}

interface Props {
  options: ComboboxOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  /** Callback con el texto introducido para crear una nueva entrada */
  onCrearNuevo?: (texto: string) => void;
  crearLabel?: string;
  disabled?: boolean;
}

/** Combobox buscable con opción de crear una entrada nueva en línea. */
export function ComboboxCrear({
  options,
  value,
  onChange,
  placeholder = "Selecciona…",
  searchPlaceholder = "Buscar…",
  emptyText = "Sin resultados",
  onCrearNuevo,
  crearLabel = "Crear",
  disabled,
}: Props) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const seleccionado = options.find((o) => o.value === value);
  const queryNorm = query.trim();
  const yaExiste = queryNorm
    ? options.some(
        (o) => o.label.toLowerCase() === queryNorm.toLowerCase(),
      )
    : false;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          disabled={disabled}
          className={cn(
            "w-full justify-between font-normal",
            !seleccionado && "text-muted-foreground",
          )}
        >
          {seleccionado ? seleccionado.label : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[--radix-popover-trigger-width]" align="start">
        <Command shouldFilter>
          <CommandInput
            placeholder={searchPlaceholder}
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((o) => (
                <CommandItem
                  key={o.value}
                  value={`${o.label} ${o.hint ?? ""}`}
                  onSelect={() => {
                    onChange(o.value);
                    setOpen(false);
                    setQuery("");
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === o.value ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <span className="flex-1 truncate">{o.label}</span>
                  {o.hint && (
                    <span className="ml-2 text-xs text-muted-foreground truncate">
                      {o.hint}
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
            {onCrearNuevo && queryNorm && !yaExiste && (
              <CommandGroup heading="Crear nuevo">
                <CommandItem
                  value={`__crear__${queryNorm}`}
                  onSelect={() => {
                    onCrearNuevo(queryNorm);
                    setOpen(false);
                    setQuery("");
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {crearLabel} «{queryNorm}»
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
