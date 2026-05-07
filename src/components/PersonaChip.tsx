import { Link } from "@tanstack/react-router";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { miembroPorId } from "@/lib/equipo";
import { cn } from "@/lib/utils";

interface Props {
  id: string;
  size?: "xs" | "sm" | "md" | "lg";
  showName?: boolean;
  link?: boolean;
  className?: string;
}

const sizeClass = {
  xs: "h-5 w-5 text-[9px]",
  sm: "h-6 w-6 text-[10px]",
  md: "h-8 w-8 text-xs",
  lg: "h-12 w-12 text-sm",
};

export function PersonaChip({ id, size = "sm", showName = true, link = true, className }: Props) {
  const m = miembroPorId(id);
  if (!m) return <span className="text-muted-foreground text-xs">—</span>;
  const content = (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <Avatar className={sizeClass[size]}>
        <AvatarFallback className="bg-secondary text-secondary-foreground font-semibold">
          {m.iniciales}
        </AvatarFallback>
      </Avatar>
      {showName && <span className="text-sm">{m.nombre}</span>}
    </span>
  );
  if (!link) return content;
  return (
    <Link
      to="/personas/$id"
      params={{ id: m.id }}
      className="hover:underline underline-offset-2"
      onClick={(e) => e.stopPropagation()}
    >
      {content}
    </Link>
  );
}
