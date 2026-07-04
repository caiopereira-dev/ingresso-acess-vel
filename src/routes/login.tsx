import { createFileRoute, Link } from "@tanstack/react-router";
import type { FormEvent } from "react";
import { Layout } from "@/components/Layout";
import { useId, useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Login — Ingresso Acessível" }] }),
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const emailId = useId();
  const pwdId = useId();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // Ambiente acadêmico de demonstração: não há autenticação real (fora do
    // escopo deste Projeto Integrador). Antes isso usava window.alert(),
    // que quebra a identidade visual do produto — agora usa o mesmo
    // padrão de feedback (toast) usado no restante do app.
    toast.success("Login simulado com sucesso.", {
      description: "Ambiente de demonstração — nenhum dado é enviado a um servidor real.",
    });
  }

  return (
    <Layout>
      <div className="max-w-md mx-auto px-4 py-20">
        <h1 className="text-3xl font-extrabold text-center">
          Entre na <span className="text-gradient">Ingresso Acessível</span>
        </h1>
        <p className="text-center text-muted-foreground mt-2">Acesse seus ingressos e histórico</p>

        <form className="mt-10 glass p-7 rounded-2xl border border-border space-y-4" onSubmit={handleSubmit}>
          <label className="block" htmlFor={emailId}>
            <span className="text-sm font-semibold mb-2 block">E-mail</span>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <input
                id={emailId}
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-3 rounded-lg bg-muted border border-border focus:ring-4 focus:ring-primary/30 focus:outline-none"
              />
            </div>
          </label>

          <label className="block" htmlFor={pwdId}>
            <span className="text-sm font-semibold mb-2 block">Senha</span>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <input
                id={pwdId}
                type={showPwd ? "text" : "password"}
                required
                autoComplete="current-password"
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                className="w-full pl-10 pr-10 py-3 rounded-lg bg-muted border border-border focus:ring-4 focus:ring-primary/30 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                aria-pressed={showPwd}
                aria-label={showPwd ? "Ocultar senha" : "Mostrar senha"}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60"
              >
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>

          <button type="submit"
            className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-bold shadow-[var(--shadow-soft)] hover:scale-[1.02] active:scale-[0.99] transition">
            Entrar
          </button>

          <p className="text-center text-xs text-muted-foreground">
            Ambiente de demonstração acadêmica — login simulado, sem autenticação real.
          </p>

          <p className="text-center text-sm text-muted-foreground border-t border-border pt-4">
            Ainda não tem conta? Você pode <Link to="/eventos" className="text-primary font-semibold">explorar os eventos</Link> sem precisar entrar.
          </p>
        </form>
      </div>
    </Layout>
  );
}
