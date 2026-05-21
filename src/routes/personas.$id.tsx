import { createFileRoute } from "@tanstack/react-router";
import { miembroPorId } from "@/lib/equipo";
import { useTareaModal } from "@/lib/tarea-modal-context";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { urgenciaTarea } from "@/lib/fechas";
import { precisionPersona } from "@/lib/estimacion";
import { useTareas, useUserRoles } from "@/lib/queries";
import { useUserCaps } from "@/lib/user-caps";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/lib/supabase";
import { invalidateKeys } from "@/lib/qc";
import { toast } from "sonner";
import type { AppRole } from "@/lib/auth";
import { VistaHeader } from "@/components/VistaHeader";

export const Route = createFileRoute("/personas/$id")({
  component: FichaPersona,
});

function FichaPersona() {
  const { id } = Route.useParams();
  const m = miembroPorId(id);
  const { abrir } = useTareaModal();
  const caps = useUserCaps();
  const { data: tareas = [] } = useTareas();
  if (!m) return <div className="p-6">Persona no encontrada</div>;
  const activas = tareas.filter((t) => t.responsable_id === m.id && t.estado !== "completada");
  const vencidas = activas.filter((t) => urgenciaTarea(t.fecha_fin_min, t.fecha_fin_max) === "rojo");
  const precision = precisionPersona(m.id, tareas);

  return (
    <div className="p-6 space-y-6">
      <VistaHeader
        titulo={m.nombre}
        leyenda="Ficha de la persona con sus tareas asignadas, rol y carga."
      />
      <header className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarFallback className="text-lg bg-secondary">{m.iniciales}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">{m.nombre}</h1>
          <div className="text-sm text-muted-foreground">{m.rol} · {m.email}</div>
          <div className="flex gap-1.5 mt-1.5">
            {m.grupos.map((g) => (
              <Badge key={g} variant="secondary">{g}</Badge>
            ))}
          </div>
        </div>
        <div className="ml-auto text-right">
          <div className="text-2xl font-bold">{activas.length}</div>
          <div className="text-xs text-muted-foreground">activas · {vencidas.length} vencidas</div>
        </div>
      </header>

      {caps.isDirector && <PanelRoles userId={m.id} />}

      {precision != null && (
        <section className="card-soft p-4 grid gap-4 md:grid-cols-2">
          {precision != null && (
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                Precisión estimaciones
              </div>
              <div className="text-3xl font-semibold tabular-nums">
                {Math.round(precision * 100)}%
              </div>
            </div>
          )}
        </section>
      )}

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Tareas activas
        </h2>
        <div className="space-y-1">
          {activas.map((t) => (
            <button
              key={t.id}
              onClick={() => abrir(t.id)}
              className="card-soft p-3 w-full text-left text-sm hover:bg-muted/30"
            >
              {t.titulo}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

const ROLES_GESTIONABLES: AppRole[] = [
  "director",
  "pm",
  "diseno",
  "contenidos",
  "campanas",
  "seo",
  "it",
];

function PanelRoles({ userId }: { userId: string }) {
  const { data: roles = [], isLoading } = useUserRoles(userId);
  const rolesSet = new Set(roles);

  const toggle = async (role: AppRole, checked: boolean) => {
    if (checked) {
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role });
      if (error) {
        toast.error(`No se pudo añadir ${role}: ${error.message}`);
        return;
      }
      toast.success(`Rol ${role} añadido`);
    } else {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", role);
      if (error) {
        toast.error(`No se pudo quitar ${role}: ${error.message}`);
        return;
      }
      toast.success(`Rol ${role} quitado`);
    }
    invalidateKeys(["user-roles", userId], ["equipo"], ["clientes"]);
  };

  return (
    <section className="card-soft p-4 space-y-3 border-amber-200 bg-amber-50/40">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-amber-900">
            Panel de administración
          </h2>
          <p className="text-xs text-muted-foreground">
            Solo directores. Los cambios son inmediatos.
          </p>
        </div>
      </header>
      {isLoading ? (
        <div className="text-xs text-muted-foreground">Cargando roles…</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {ROLES_GESTIONABLES.map((r) => (
            <label
              key={r}
              className="flex items-center gap-2 text-sm px-2 py-1.5 rounded border border-amber-200 bg-background cursor-pointer hover:bg-amber-50"
            >
              <Checkbox
                checked={rolesSet.has(r)}
                onCheckedChange={(v) => toggle(r, !!v)}
              />
              <span className="capitalize">{r}</span>
            </label>
          ))}
        </div>
      )}
    </section>
  );
}
