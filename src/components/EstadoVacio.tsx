import * as React from "react";

interface Props {
  emoji?: string;
  titulo: string;
  hint?: string;
  cta?: React.ReactNode;
  className?: string;
}

export function EstadoVacio({ emoji = "✨", titulo, hint, cta, className }: Props) {
  return (
    <div className={`text-center py-12 px-6 ${className ?? ""}`}>
      <div className="text-4xl mb-3 select-none">{emoji}</div>
      <p className="text-sm font-medium text-foreground">{titulo}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">{hint}</p>}
      {cta && <div className="mt-4 inline-flex">{cta}</div>}
    </div>
  );
}
