import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { miembroPorId } from "@/lib/equipo";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Props {
  ids: string[];
  max?: number;
  size?: "xs" | "sm";
}

const sizeClass = {
  xs: "h-5 w-5 text-[9px] -ml-1.5 first:ml-0 ring-2 ring-background",
  sm: "h-6 w-6 text-[10px] -ml-2 first:ml-0 ring-2 ring-background",
};

export function AvatarStack({ ids, max = 3, size = "xs" }: Props) {
  const unicos = Array.from(new Set(ids));
  const visibles = unicos.slice(0, max);
  const restantes = unicos.length - visibles.length;
  return (
    <TooltipProvider delayDuration={200}>
      <div className="inline-flex items-center">
        {visibles.map((id) => {
          const m = miembroPorId(id);
          if (!m) return null;
          return (
            <Tooltip key={id}>
              <TooltipTrigger asChild>
                <Avatar className={sizeClass[size]}>
                  <AvatarFallback className="bg-secondary text-secondary-foreground font-semibold">
                    {m.iniciales}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>{m.nombre}</TooltipContent>
            </Tooltip>
          );
        })}
        {restantes > 0 && (
          <span
            className={`${sizeClass[size]} rounded-full bg-muted text-muted-foreground font-semibold inline-flex items-center justify-center`}
          >
            +{restantes}
          </span>
        )}
      </div>
    </TooltipProvider>
  );
}