import * as React from "react";
import { Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { TareaModal } from "@/components/TareaModal";
import { TareaModalProvider } from "@/lib/tarea-modal-context";
import { CrearModalProvider } from "@/lib/crear-modal-context";
import { CrearModal } from "@/components/CrearModal";
import { BusquedaProvider } from "@/lib/busqueda-context";
import { BusquedaGlobal } from "@/components/BusquedaGlobal";
import { Toaster } from "@/components/ui/sonner";
import { AtajosGlobales } from "@/lib/atajos";
import { AuthProvider, useAuth } from "@/lib/auth";
import { DataSync, useDataVersion } from "@/lib/data-sync";
import { useEquipo } from "@/lib/queries";
import { useEquipoVersion } from "@/lib/equipo";

export function AppLayout() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}

function AuthGate() {
  const { loading, user } = useAuth();
  useDataVersion();
  // Re-render cuando EQUIPO o el usuario actual se hidraten.
  useEquipoVersion();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const isLogin = path === "/login";
  const isBare = path === "/carga-monitor";

  React.useEffect(() => {
    if (loading) return;
    if (!user && !isLogin) {
      navigate({ to: "/login" });
    } else if (user && isLogin) {
      navigate({ to: "/" });
    }
  }, [loading, user, isLogin, navigate]);

  // Providers SIEMPRE montados para evitar que componentes hijos exploten
  // durante la transición login → app autenticada. DataSync/EquipoSync solo
  // cuando hay usuario (tienen efectos que requieren sesión).
  return (
    <BusquedaProvider>
      <TareaModalProvider>
        <CrearModalProvider>
          {/* Montados siempre: sus hooks internos tienen `enabled: !!user`,
              así no fetchean sin sesión. Montaje condicional cambiaría el
              árbol de hooks entre renders y dispara React #310. */}
          <DataSync />
          <EquipoSync />

          {loading ? (
            <div className="flex h-screen items-center justify-center bg-background">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
            </div>
          ) : isLogin ? (
            <>
              <Outlet />
              <Toaster />
            </>
          ) : !user ? (
            <div className="flex h-screen items-center justify-center bg-background">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
            </div>
          ) : isBare ? (
            <>
              <Outlet />
              <Toaster />
            </>
          ) : (
            <>
              <div className="flex h-screen w-full overflow-hidden bg-background">
                <Sidebar />
                <div className="flex-1 flex flex-col min-w-0">
                  <TopBar />
                  <main className="flex-1 overflow-y-auto">
                    <Outlet />
                  </main>
                </div>
              </div>
              <TareaModal />
              <CrearModal />
              <BusquedaGlobal />
              <AtajosGlobales />
              <Toaster />
            </>
          )}
        </CrearModalProvider>
      </TareaModalProvider>
    </BusquedaProvider>
  );
}

/**
 * Dispara `useEquipo()` (queries.ts) para que EQUIPO se hidrate con los
 * profiles reales de Supabase nada más loguearse. Sin esto, `usuarioActual()`
 * recae siempre en el fallback hasta que el usuario visite /equipo/carga.
 */
function EquipoSync() {
  useEquipo();
  return null;
}
