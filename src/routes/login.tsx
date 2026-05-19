import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSending(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
        },
      });
      if (error) throw error;
      setSent(true);
      toast.success("Revisa tu email para entrar");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al enviar el enlace";
      toast.error(msg);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-foreground text-background text-base font-bold">
            S
          </div>
          <h1 className="text-xl font-semibold">Social Advisor</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Entra con tu correo del equipo
          </p>
        </div>

        {sent ? (
          <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm text-center">
            Te hemos enviado un enlace a <strong>{email}</strong>.<br />
            Ábrelo desde este dispositivo para iniciar sesión.
            <button
              type="button"
              onClick={() => { setSent(false); setEmail(""); }}
              className="block mx-auto mt-3 text-xs underline text-muted-foreground"
            >
              Usar otro correo
            </button>
          </div>
        ) : (
          <form onSubmit={enviar} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                placeholder="tu@socialadvisor.es"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
              />
            </div>
            <Button type="submit" className="w-full" disabled={sending}>
              {sending ? "Enviando…" : "Recibir enlace"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}