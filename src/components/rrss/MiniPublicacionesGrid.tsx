import * as React from "react";
import { useNavigate } from "@tanstack/react-router";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Instagram, Facebook, Linkedin, Music2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePlanRRSS } from "@/lib/plan-rrss-store";
import {
  ESTADO_PUB_COLOR,
  ESTADO_PUB_LABEL,
  TIPO_LABEL,
  type PublicacionRRSS,
} from "@/types/database";

const ICONS: Record<PublicacionRRSS["plataformas"][number], React.ComponentType<{ className?: string }>> = {
  ig: Instagram, fb: Facebook, li: Linkedin, tt: Music2,
};

export function MiniPublicacionesGrid({
  tareaId,
  entregaId,
  onNavigate,
}: {
  tareaId: string;
  entregaId: string;
  onNavigate?: () => void;
}) {
  const { data: plan = [] } = usePlanRRSS(tareaId);
  const navigate = useNavigate();
  if (plan.length === 0) return null;
  const ordenado = [...plan].sort((a, b) => a.fecha.localeCompare(b.fecha));

  const ir = (pub?: string) => {
    onNavigate?.();
    navigate({
      to: "/entregas/$id",
      params: { id: entregaId },
      search: pub ? { pub } : undefined,
    } as never);
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {ordenado.map((p, idx) => {
          const estado = (p.estado ?? "borrador") as NonNullable<PublicacionRRSS["estado"]>;
          return (
            <button
              key={p.id}
              onClick={() => ir(p.id)}
              className={cn(
                "text-left rounded-md border-2 p-2 hover:shadow transition bg-background",
                ESTADO_PUB_COLOR[estado].split(" ").filter((c) => c.startsWith("border-")).join(" "),
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-semibold text-muted-foreground">#{idx + 1}</span>
                <span className={cn("text-[9px] px-1.5 py-0.5 rounded border", ESTADO_PUB_COLOR[estado])}>
                  {ESTADO_PUB_LABEL[estado]}
                </span>
              </div>
              <div className="text-xs font-medium">{format(parseISO(p.fecha), "d MMM", { locale: es })}</div>
              <div className="text-[10px] text-muted-foreground">{TIPO_LABEL[p.tipo]}</div>
              <div className="flex gap-0.5 mt-1">
                {p.plataformas.map((pl) => {
                  const Icon = ICONS[pl];
                  return <Icon key={pl} className="h-3 w-3 text-muted-foreground" />;
                })}
              </div>
            </button>
          );
        })}
      </div>
      <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => ir()}>
        Ver y editar todas →
      </Button>
    </div>
  );
}