import * as React from "react";
import type { Post, EstadoPost } from "./mock-contenido";

const overrides = new Map<string, EstadoPost>();
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function aplicarOverridesPosts(posts: Post[]): Post[] {
  if (overrides.size === 0) return posts;
  return posts.map((p) => {
    const o = overrides.get(p.id);
    return o ? { ...p, estado: o } : p;
  });
}

export function moverPost(id: string, destino: EstadoPost) {
  overrides.set(id, destino);
  emit();
}

export function usePostsOverridesVersion() {
  const [v, setV] = React.useState(0);
  React.useEffect(() => {
    const l = () => setV((x) => x + 1);
    listeners.add(l);
    return () => { listeners.delete(l); };
  }, []);
  return v;
}
