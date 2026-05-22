import { AlertTriangle } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

interface ConflictoItem {
  persona: { id: string; nombre: string };
  vacacion: { fecha_inicio: string; fecha_fin: string };
  rol?: string;
}

interface Props {
  conflictos: ConflictoItem[];
}

function fmt(iso: string) {
  try {
    return format(parseISO(iso), "d MMM yyyy", { locale: es });
  } catch {
    return iso;
  }
}

export function AvisoVacaciones({ conflictos }: Props) {
  if (!conflictos || conflictos.length === 0) return null;
  return (
    <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-amber-900 text-sm space-y-1.5">
      <div className="flex items-center gap-2 font-medium">
        <AlertTriangle className="h-4 w-4" />
        Atención: solapamiento con vacaciones
      </div>
      {conflictos.map((c, i) => (
        <div key={i} className="text-xs">
          <span className="font-medium">{c.persona.nombre}</span>
          {c.rol && <span className="text-amber-700"> ({c.rol})</span>}
          {" está de vacaciones del "}
          <strong>{fmt(c.vacacion.fecha_inicio)}</strong>
          {" al "}
          <strong>{fmt(c.vacacion.fecha_fin)}</strong>.
        </div>
      ))}
      <div className="text-xs text-amber-700 pt-0.5">
        Puedes continuar, pero considera reasignar o cambiar la fecha límite.
      </div>
    </div>
  );
}