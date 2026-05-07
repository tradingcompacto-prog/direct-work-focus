import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonTabla({ filas = 6, columnas = 5 }: { filas?: number; columnas?: number }) {
  return (
    <div className="card-soft p-3 space-y-2">
      {Array.from({ length: filas }).map((_, i) => (
        <div key={i} className="flex gap-3 items-center">
          {Array.from({ length: columnas }).map((__, j) => (
            <Skeleton
              key={j}
              className={`h-4 ${j === 0 ? "w-1/3" : j === columnas - 1 ? "w-12 ml-auto" : "flex-1"}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonCards({ n = 6 }: { n?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className="card-soft p-4 space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}
