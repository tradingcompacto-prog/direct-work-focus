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
  borrador:   [{ label: "Marcar como En diseño", to: "diseno", tone: "primary" }],
  diseno:     [{ label: "Marcar como En copy", to: "copy", tone: "primary" }, { label: "Volver a borrador", to: "borrador" }],
  copy:       [{ label: "Marcar como En revisión", to: "revision", tone: "primary" }, { label: "Volver a diseño", to: "diseno" }],
  revision:   [{ label: "Aprobar (Listo)", to: "listo", tone: "primary" }, { label: "Devolver a copy", to: "copy" }, { label: "Devolver a diseño", to: "diseno" }],
  listo:      [{ label: "Marcar como Programado", to: "programado", tone: "primary" }],
  programado: [{ label: "Marcar como Publicado", to: "publicado", tone: "primary" }],
  publicado:  [{ label: "Reabrir como Listo", to: "listo" }],
};

export function PublicacionAvanceRapido({
  pub,
  ctx,
}: {
  pub: PublicacionRRSS;
  ctx: { tareaId: string; entregaId: string; clienteId: string };
}) {
  const estado = (pub.estado ?? "borrador") as Estado;
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