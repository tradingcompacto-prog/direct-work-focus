import * as React from "react";

interface VistaHeaderProps {
  titulo: React.ReactNode;
  leyenda?: React.ReactNode;
  acciones?: React.ReactNode;
}

/**
 * Cabecera estándar de cada vista: título grande + leyenda corta que
 * explica QUÉ ES esa vista. Opcionalmente, acciones a la derecha.
 */
export function VistaHeader({ titulo, leyenda, acciones }: VistaHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{titulo}</h1>
        {leyenda && (
          <p className="text-sm text-muted-foreground mt-0.5 max-w-2xl">
            {leyenda}
          </p>
        )}
      </div>
      {acciones && <div className="flex items-center gap-2">{acciones}</div>}
    </div>
  );
}