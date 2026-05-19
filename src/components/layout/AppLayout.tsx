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
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const isLogin = path === "/login";

  React.useEffect(() => {
    if (loading) return;
    if (!user && !isLogin) {
      navigate({ to: "/login" });
    } else if (user && isLogin) {
      navigate({ to: "/" });
    }
  }, [loading, user, isLogin, navigate]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
      </div>
    );
  }

  // Pantalla pública /login sin layout interno.
  if (isLogin || !user) {
    return (
      <>
        <Outlet />
        <Toaster />
      </>
    );
  }

  return (
    <BusquedaProvider>
      <TareaModalProvider>
        <CrearModalProvider>
          <DataSync />
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
        </CrearModalProvider>
      </TareaModalProvider>
    </BusquedaProvider>
  );
}
