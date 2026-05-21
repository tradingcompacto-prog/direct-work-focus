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
  const [password, setPassword] = React.useState("");
  const [mode, setMode] = React.useState<"password" | "magic">("password");
  const [sending, setSending] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const passwordValido = password.length >= 6;

  const loginConPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailValido || !passwordValido) return;
    setSending(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      window.location.href = "/";
    } catch (err) {
      if (
        err &&
        typeof err === "object" &&
        "status" in err &&
        err.status === 400
      ) {
        toast.error("Email o contraseña incorrectos");
      } else {
        const msg =
          err instanceof Error ? err.message : "Error al iniciar sesión";
        toast.error(msg);
      }
    } finally {
      setSending(false);
    }
  };

  const enviarMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailValido) return;
    setSending(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo:
            typeof window !== "undefined"
              ? window.location.origin
              : undefined,
        },
      });
      if (error) throw error;
      setSent(true);
      toast.success("Revisa tu email para entrar");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Error al enviar el enlace";
      toast.error(msg);
    } finally {
      setSending(false);
    }
  };

  const resetearPassword = async () => {
    if (!emailValido) {
      toast.error("Introduce un email válido primero");
      return;
    }
    setSending(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo:
          typeof window !== "undefined"
            ? window.location.origin + "/login"
            : undefined,
      });
      if (error) throw error;
      toast.success(
        "Si el email existe, recibirás un enlace para resetear contraseña."
      );
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Error al enviar el enlace";
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
            Iniciar sesión en Hub
          </p>
        </div>

        {sent ? (
          <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm text-center">
            Te hemos enviado un enlace a <strong>{email}</strong>.<br />
            Ábrelo desde este dispositivo para iniciar sesión.
            <button
              type="button"
              onClick={() => {
                setSent(false);
                setEmail("");
                setPassword("");
              }}
              className="block mx-auto mt-3 text-xs underline text-muted-foreground"
            >
              Usar otro correo
            </button>
          </div>
        ) : mode === "password" ? (
          <form onSubmit={loginConPassword} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                placeholder="info@socialadvisor.es"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={6}
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={!emailValido || !passwordValido || sending}
            >
              {sending ? "Iniciando sesión…" : "Iniciar sesión"}
            </Button>

            <button
              type="button"
              onClick={resetearPassword}
              disabled={sending}
              className="block mx-auto text-xs text-muted-foreground underline hover:text-foreground transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </button>

            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">o</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setMode("magic")}
              disabled={sending}
            >
              Recibir magic link por email
            </Button>
          </form>
        ) : (
          <form onSubmit={enviarMagicLink} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email-magic">Email</Label>
              <Input
                id="email-magic"
                type="email"
                required
                placeholder="info@socialadvisor.es"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={!emailValido || sending}
            >
              {sending ? "Enviando…" : "Recibir enlace"}
            </Button>

            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">o</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setMode("password")}
              disabled={sending}
            >
              Volver a email + contraseña
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
