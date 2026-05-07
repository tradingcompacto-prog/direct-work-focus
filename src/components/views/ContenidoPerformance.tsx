import { POSTS_MOCK, CANAL_COLOR, CANAL_LABEL, type CanalPost } from "@/lib/mock-contenido";
import { clientePorId } from "@/lib/mock-tareas";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { TrendingUp, Eye, MousePointerClick, Heart } from "lucide-react";

function fmtNum(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return String(n);
}

export function ContenidoPerformance() {
  const publicados = POSTS_MOCK.filter((p) => p.estado === "publicado");
  const totalAlcance = publicados.reduce((a, p) => a + (p.alcance ?? 0), 0);
  const totalInter = publicados.reduce((a, p) => a + (p.interacciones ?? 0), 0);
  const totalClics = publicados.reduce((a, p) => a + (p.clics ?? 0), 0);
  const er = totalAlcance > 0 ? ((totalInter / totalAlcance) * 100).toFixed(1) : "0";

  const porCanal: Record<CanalPost, { posts: number; alc: number; inter: number }> = {} as any;
  for (const p of publicados) {
    const k = p.canal;
    if (!porCanal[k]) porCanal[k] = { posts: 0, alc: 0, inter: 0 };
    porCanal[k].posts += 1;
    porCanal[k].alc += p.alcance ?? 0;
    porCanal[k].inter += p.interacciones ?? 0;
  }

  const top = [...publicados].sort((a, b) => (b.interacciones ?? 0) - (a.interacciones ?? 0)).slice(0, 8);

  return (
    <div className="space-y-5 anim-in">
      <h1 className="text-2xl font-semibold tracking-tight">Performance</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Kpi icon={Eye} label="Alcance total" value={fmtNum(totalAlcance)} />
        <Kpi icon={Heart} label="Interacciones" value={fmtNum(totalInter)} />
        <Kpi icon={MousePointerClick} label="Clics" value={fmtNum(totalClics)} />
        <Kpi icon={TrendingUp} label="Engagement rate" value={`${er}%`} />
      </div>

      <section className="card-soft p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Por canal</h3>
        <ul className="space-y-2">
          {Object.entries(porCanal).map(([canal, v]) => {
            const max = Math.max(...Object.values(porCanal).map((x) => x.alc));
            return (
              <li key={canal} className="flex items-center gap-3 text-sm">
                <span className="w-24 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: CANAL_COLOR[canal as CanalPost] }} />
                  {CANAL_LABEL[canal as CanalPost]}
                </span>
                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full" style={{ width: `${(v.alc / max) * 100}%`, backgroundColor: CANAL_COLOR[canal as CanalPost] }} />
                </div>
                <span className="w-20 text-right tabular-nums text-muted-foreground text-xs">{fmtNum(v.alc)} alc</span>
                <span className="w-12 text-right tabular-nums text-muted-foreground text-xs">{v.posts} pub</span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="card-soft p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Top posts</h3>
        <ul className="divide-y divide-border">
          {top.map((p) => (
            <li key={p.id} className="py-2 flex items-center gap-3">
              <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: CANAL_COLOR[p.canal] }} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{p.titulo}</div>
                <div className="text-xs text-muted-foreground truncate">{clientePorId(p.cliente_id)?.nombre} · {CANAL_LABEL[p.canal]} · {format(parseISO(p.fecha), "d MMM", { locale: es })}</div>
              </div>
              <div className="text-xs text-right tabular-nums text-muted-foreground shrink-0">
                <div>{fmtNum(p.alcance ?? 0)} alc</div>
                <div>{fmtNum(p.interacciones ?? 0)} int</div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Kpi({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="card-soft p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <div className="text-2xl font-semibold tabular-nums mt-1">{value}</div>
    </div>
  );
}