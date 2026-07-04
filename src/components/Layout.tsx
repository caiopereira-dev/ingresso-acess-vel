import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Navbar } from "./Navbar";
import { AccessibilityPanel } from "./AccessibilityPanel";
import { AccessibilityDiscoveryBanner } from "./AccessibilityDiscoveryBanner";
import { Logo } from "./Logo";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <a href="#main" className="skip-link">Pular para o conteúdo principal</a>

      {/*
        AccessibilityPanel fica FORA do #app-shell e logo após o skip-link
        por dois motivos, ambos achados da auditoria:
        1) Ordem de tabulação: antes era o ÚLTIMO elemento focável da página
           (renderizado depois do footer). Agora é o primeiro item após o
           skip-link — quem navega por teclado/leitor de tela alcança o
           controle de acessibilidade em 1-2 Tabs, não depois de toda a página.
        2) Saída de emergência do "modo cegueira": como esse botão/painel
           vive fora do #app-shell, ele nunca é afetado pelo filtro de
           brilho aplicado durante a simulação (ver styles.css e
           AccessibilityContext.tsx) — então ele continua visível e
           clicável mesmo com a tela escurecida.
      */}
      <AccessibilityPanel />

      <div id="app-shell">
        <Navbar />
        <main id="main" className="pt-16 min-h-screen">
          <AccessibilityDiscoveryBanner />
          {children}
        </main>
        <footer className="mt-24 border-t border-border">
          <div className="max-w-6xl mx-auto px-5 md:px-8 py-14 grid md:grid-cols-4 gap-10">
            <div className="md:col-span-2">
              <Logo />
              <p className="text-[14px] text-muted-foreground mt-4 max-w-sm leading-relaxed">
                A plataforma de ingressos mais acessível do Brasil. Música ao vivo, para todas as pessoas.
              </p>
            </div>
            <nav aria-label="Plataforma">
              <h4 className="text-[12px] font-semibold mb-4 uppercase tracking-wider text-muted-foreground">Plataforma</h4>
              <ul className="text-[14px] text-foreground/80 space-y-2.5">
                <li><Link to="/eventos" className="hover:text-foreground transition-colors rounded-sm">Eventos</Link></li>
                <li><Link to="/acessibilidade" className="hover:text-foreground transition-colors rounded-sm">Acessibilidade</Link></li>
                <li><Link to="/meus-ingressos" className="hover:text-foreground transition-colors rounded-sm">Meus ingressos</Link></li>
                <li>
                  <a href="mailto:suporte@ingressoacessivel.com.br" className="hover:text-foreground transition-colors rounded-sm">
                    Suporte 24/7
                  </a>
                </li>
              </ul>
            </nav>
            <div>
              <h4 className="text-[12px] font-semibold mb-4 uppercase tracking-wider text-muted-foreground">Compromisso</h4>
              <ul className="text-[14px] text-foreground/80 space-y-2.5">
                <li>Diretrizes WCAG 2.1 AA</li><li>Selo de inclusão</li><li>Equipe PCD treinada</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border py-6 text-center text-[13px] text-muted-foreground">
            © {new Date().getFullYear()} Ingresso Acessível · Música para todas as pessoas
          </div>
        </footer>
      </div>
    </>
  );
}
