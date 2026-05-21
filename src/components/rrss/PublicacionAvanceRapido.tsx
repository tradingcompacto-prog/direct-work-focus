import * as React from "react";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  setPublicacionEstado,
  removePublicacion,
  duplicarPublicacion,
} from "@/lib/plan-rrss-store";
import type { PublicacionRRSS } from "@/types/database";
import { toast } from "sonner";

type Estado = NonNullable<PublicacionRRSS["estado"]>;

const TRANSICIONES: Record<Estado, Array<{ label: string; to: Estado; tone?: "danger" | "primary" }>> = {
  activa:     [{ label: "Empezar", to: "haciendola", tone: "primary" }, { label: "Pausar", to: "pausada" }],
  haciendola: [{ label: "Marcar para revisión", to: "revision", tone: "primary" }, { label: "Pausar", to: "pausada" }],
  pausada:    [{ label: "Reanudar", to: "haciendola", tone: "primary" }, { label: "Volver a activa", to: "activa" }],
  revision:   [{ label: "Aprobar (completar)", to: "completada", tone: "primary" }, { label: "Devolver a producción", to: "haciendola" }],
  completada: [{ label: "Reabrir", to: "revision" }],
};

export function PublicacionAvanceRapido({
  pub,
  ctx,
}: {
  pub: PublicacionRRSS;
  ctx: { tareaId: string; entregaId: string; clienteId: string };
}) {
  const estado = (pub.estado ?? "activa") as Estado;
  const items = TRANSICIONES[estado];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="h-7 w-7 inline-flex items-center justify-center rounded hover:bg-muted">
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {items.map((it) => (
          <DropdownMenuItem
            key={it.to}
            onClick={() => {
              setPublicacionEstado(pub.id, it.to);
              toast.success(`Estado → ${it.label}`);
            }}
            className={it.tone === "primary" ? "font-medium" : ""}
          >
            {it.label}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => duplicarPublicacion(ctx, pub.id)}>
          Duplicar
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-red-600 focus:text-red-700"
          onClick={() => {
            removePublicacion(ctx.tareaId, pub.id);
            toast.success("Publicación eliminada");
          }}
        >
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}