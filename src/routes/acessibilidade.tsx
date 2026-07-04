import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Layout } from "@/components/Layout";
import { useA11y } from "@/context/AccessibilityContext";
import { Eye, Contrast, Palette, Volume2, Keyboard, Sparkles } from "lucide-react";

export const Route = createFileRoute("/acessibilidade")({
  head: () => ({
    meta: [
      { title: "Acessibilidade — Ingresso Acessível" },
      { name: "description", content: "Recursos de acessibilidade desenvolvidos com base nas diretrizes WCAG 2.1 AA: leitor de tela, alto contraste, daltonismo, baixa visão e simulações." },
    ],
  }),
  component: AcessibilidadePage,
});

function AcessibilidadePage() {
  const a = useA11y();

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-16">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-semibold uppercase tracking-wider text-primary mb-4">
          <Sparkles size={14} /> Diretrizes WCAG 2.1 AA
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold">
          Acessibilidade <span className="text-gradient">de verdade</span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-3xl">
          Cada recurso é desenhado com base em diretrizes de acessibilidade reconhecidas (WCAG 2.2 e
          NBR 9050) e cada evento é auditado individualmente antes de receber sua nota pública.
          Use o painel flutuante no canto direito para ativar qualquer recurso a qualquer momento.
        </p>

        {/* Simular experiência */}
        <section className="mt-12" aria-labelledby="simular">
          <h2 id="simular" className="text-2xl font-bold mb-2">Simular Experiência Acessível</h2>
          <p className="text-muted-foreground mb-6">Veja o site na perspectiva de outras pessoas.</p>
          <div className="grid md:grid-cols-3 gap-4">
            <SimCard title="Daltonismo" desc="Veja a interface como pessoas com protanopia, deuteranopia ou tritanopia." onClick={() => a.setColorblind("deuteranopia")} active={a.colorblind !== "none"} icon={<Palette/>} />
            <SimCard title="Baixa Visão" desc="Aumenta fontes, espaçamento e botões em toda a navegação." onClick={() => a.setVisionMode(a.visionMode === "low-vision" ? "default" : "low-vision")} active={a.visionMode === "low-vision"} icon={<Eye/>} />
            <SimCard title="Cegueira (áudio)" desc="Escurece a tela e navega apenas por áudio com o leitor. Pressione Esc a qualquer momento para sair." onClick={() => { a.setVisionMode("blind-sim"); if (!a.screenReader) a.toggleScreenReader(); }} active={a.visionMode === "blind-sim"} icon={<Volume2/>} />
          </div>
          {(a.colorblind !== "none" || a.visionMode !== "default") && (
            <button onClick={() => { a.setColorblind("none"); a.setVisionMode("default"); }}
              className="mt-4 text-sm text-primary underline">Restaurar visualização padrão</button>
          )}
        </section>

        {/* Recursos */}
        <section className="mt-16" aria-labelledby="recursos">
          <h2 id="recursos" className="text-2xl font-bold mb-6">Recursos disponíveis</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { i: <Volume2/>, t: "Leitor de tela PT-BR", d: "Web Speech API com hover-to-speak, foco-to-speak, pausa, retomada e ajuste de velocidade." },
              { i: <Contrast/>, t: "Modo alto contraste", d: "Preto/branco/amarelo com contraste WCAG AAA." },
              { i: <Eye/>, t: "Baixa visão", d: "Fontes 135%, espaçamento ampliado, botões com altura mínima de 48px." },
              { i: <Palette/>, t: "Daltonismo", d: "Simulação visual + ícones e textos sempre acompanham cores." },
              { i: <Keyboard/>, t: "Navegação por teclado", d: "Foco visual evidente, skip-link, ordem lógica e atalhos rápidos." },
              { i: <Sparkles/>, t: "ARIA semântico", d: "aria-label, aria-pressed, aria-expanded, landmarks e live regions." },
            ].map((c) => (
              <div key={c.t} className="glass p-5 rounded-xl border border-border flex gap-4">
                <div className="w-11 h-11 rounded-lg bg-primary/15 text-primary flex items-center justify-center shrink-0">{c.i}</div>
                <div>
                  <h3 className="font-bold">{c.t}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{c.d}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 p-6 rounded-2xl glass border border-border" aria-labelledby="atalhos">
          <h2 id="atalhos" className="text-2xl font-bold mb-4">Atalhos de teclado</h2>
          <ul className="grid sm:grid-cols-2 gap-3 text-sm">
            <li><kbd className="kbd">ALT+R</kbd> Ativar/desativar leitor de tela</li>
            <li><kbd className="kbd">ALT+A</kbd> Abrir painel de acessibilidade</li>
            <li><kbd className="kbd">ALT+1</kbd> Ir para Eventos</li>
            <li><kbd className="kbd">ALT+2</kbd> Ir para Acessibilidade</li>
            <li><kbd className="kbd">ALT+3</kbd> Ir para Meus Ingressos</li>
            <li><kbd className="kbd">Esc</kbd> Sair do modo cegueira / fechar painel</li>
            <li><kbd className="kbd">TAB</kbd> Navegação focal sequencial</li>
          </ul>
        </section>
      </div>
    </Layout>
  );
}

function SimCard({ title, desc, onClick, active, icon }: { title: string; desc: string; onClick: () => void; active: boolean; icon: ReactNode }) {
  return (
    <button onClick={onClick} aria-pressed={active}
      className={`text-left p-5 rounded-2xl border transition glow-hover ${active ? "border-primary bg-primary/10" : "border-border glass hover:bg-muted"}`}>
      <div className="w-11 h-11 rounded-lg bg-primary/15 text-primary flex items-center justify-center mb-3">{icon}</div>
      <h3 className="font-bold">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1">{desc}</p>
    </button>
  );
}
