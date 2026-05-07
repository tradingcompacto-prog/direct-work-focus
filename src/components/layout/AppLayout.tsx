import { Outlet } from "@tanstack/react-router";
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

export function AppLayout() {
  return (
    <BusquedaProvider>
      <TareaModalProvider>
        <CrearModalProvider>
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
