import { PUBLICACIONES_MOCK, ESTADO_COLOR, PLATAFORMA_LABEL } from "@/lib/mock-contenido";
import { clientePorId } from "@/lib/mock-tareas";
import { colorCliente } from "@/lib/cliente-colors";
import { cn } from "@/lib/utils";

export function ContenidoCalendario() {
  const hoy = new Date();
  const año = hoy.getFullYear();
  const mes = hoy.getMonth();
  const primero = new Date(año, mes, 1);
  const offset = (primero.getDay() + 6) % 7; // Lunes=0
  const diasMes = new Date(año, mes + 1, 0).getDate();
  const celdas = Array.from({ length: 42 }, (_, i) => {
    const d = i - offset + 1;
    return d >= 1 && d <= diasMes ? d : null;
  });
  const fmt = (d: number) =>
    `${año}-${String(mes + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">Calendario editorial — {primero.toLocaleDateString("es", { month: "long", year: "numeric" })}</h1>
      <div className="grid grid-cols-7 text-[10px] uppercase font-semibold text-muted-foreground">
        {["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"].map((d) => <div key={d} className="px-2 py-1">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-px bg-border rounded-md overflow-hidden">
        {celdas.map((d, i) => {
          const pubs = d ? PUBLICACIONES_MOCK.filter((p) => p.fecha === fmt(d)) : [];
          return (
            <div key={i} className={cn("bg-background min-h-[100px] p-1.5", !d && "bg-muted/30")}>
              {d && <div className="text-[11px] font-medium text-muted-foreground mb-1">{d}</div>}
              <div className="space-y-1">
                {pubs.map((p) => {
                  const c = clientePorId(p.cliente_id);
                  const col = colorCliente(p.cliente_id);
                  return (
                    <div key={p.id} className="text-[10px] rounded px-1.5 py-0.5 border-l-2 truncate"
                      style={{ borderLeftColor: col.border, backgroundColor: col.bg }}>
                      <span className="font-medium">{p.hora}</span> · {c?.nombre} · {p.tipo}
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className={cn("text-[9px] px-1 rounded", ESTADO_COLOR[p.estado])}>{p.estado}</span>
                        <span className="text-[9px] text-muted-foreground">{p.plataformas.map(pl=>PLATAFORMA_LABEL[pl][0]).join("·")}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}