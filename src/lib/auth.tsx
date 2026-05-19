import * as React from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";

export type AppRole =
  | "director"
  | "pm"
  | "diseno"
  | "contenidos"
  | "campanas"
  | "seo"
  | "it"
  | "ejecutor";

export interface Profile {
  id: string;
  nombre: string | null;
  iniciales: string | null;
  email: string | null;
  avatar_url: string | null;
  activo: boolean | null;
}

interface AuthCtx {
  loading: boolean;
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  roles: AppRole[];
  esDirector: boolean;
  esPM: boolean;
  esEjecutor: boolean;
  tieneRol: (r: AppRole) => boolean;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

const Ctx = React.createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = React.useState(true);
  const [session, setSession] = React.useState<Session | null>(null);
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [roles, setRoles] = React.useState<AppRole[]>([]);
  const qc = useQueryClient();

  const cargarPerfilYRoles = React.useCallback(async (user: User | null) => {
    if (!user) {
      setProfile(null);
      setRoles([]);
      return;
    }
    const [{ data: p }, { data: r }] = await Promise.all([
      supabase
        .from("profiles")
        .select("id,nombre,iniciales,email,avatar_url,activo")
        .eq("id", user.id)
        .maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", user.id),
    ]);
    setProfile((p as Profile | null) ?? null);
    setRoles(((r ?? []) as { role: AppRole }[]).map((x) => x.role));
  }, []);

  React.useEffect(() => {
    let mounted = true;

    // Listener primero (recomendado por Supabase) y luego getSession.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      if (!mounted) return;
      setSession(s);
      // Defer fetch para no bloquear el callback.
      setTimeout(() => {
        cargarPerfilYRoles(s?.user ?? null);
      }, 0);
      // Invalidar caches al cambiar de usuario.
      qc.invalidateQueries();
    });

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      cargarPerfilYRoles(data.session?.user ?? null).finally(() => {
        if (mounted) setLoading(false);
      });
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [cargarPerfilYRoles, qc]);

  const value = React.useMemo<AuthCtx>(() => {
    const tieneRol = (r: AppRole) => roles.includes(r);
    const esDirector = tieneRol("director");
    const esPM = tieneRol("pm") || esDirector;
    const esEjecutor = !esDirector && !esPM;
    return {
      loading,
      user: session?.user ?? null,
      session,
      profile,
      roles,
      esDirector,
      esPM,
      esEjecutor,
      tieneRol,
      signOut: async () => {
        await supabase.auth.signOut();
      },
      refresh: async () => {
        await cargarPerfilYRoles(session?.user ?? null);
      },
    };
  }, [loading, session, profile, roles, cargarPerfilYRoles]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthCtx {
  const v = React.useContext(Ctx);
  if (!v) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return v;
}