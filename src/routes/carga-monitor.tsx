import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { EquipoCarga } from "@/components/views/EquipoCarga";

export const Route = createFileRoute("/carga-monitor")({
  component: CargaMonitorPage,
});

function CargaMonitorPage() {
  const qc = useQueryClient();
  const [ahora, setAhora] = React.useState(() => new Date());

  React.useEffect(() => {
    const tick = setInterval(() => setAhora(new Date()), 1000);
    const refresco = setInterval(() => {
      qc.invalidateQueries({ queryKey: ["tareas"] });
      qc.invalidateQueries({ queryKey: ["mis-tareas"] });
    }, 60_000);
    return () => { clearInterval(tick); clearInterval(refresco); };
  }, [qc]);

  return (
    <div className="min-h-screen w-full bg-background flex flex-col">
      <header className="flex items-center justify-between px-8 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground text-background font-bold text-lg">
            S
          </span>
          <div>
            <div className="font-semibold text-lg tracking-tight">Social Advisor</div>
            <div className="text-xs text-muted-foreground">Monitor de carga del equipo</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold tabular-nums">
            {format(ahora, "HH:mm:ss")}
          </div>
          <div className="text-xs text-muted-foreground capitalize">
            {format(ahora, "EEEE d MMMM yyyy", { locale: es })}
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto px-8 py-6 text-base">
        <div className="monitor-scope">
          <EquipoCarga />
        </div>
      </main>
      <footer className="px-8 py-2 text-[11px] text-muted-foreground border-t border-border">
        Última actualización: {format(ahora, "HH:mm:ss")} · Refresco automático cada 60s
      </footer>
    </div>
  );
}