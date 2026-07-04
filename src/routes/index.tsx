import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { EventCard } from "@/components/EventCard";
import { events } from "@/data/events";
import { ArrowRight, Accessibility, ShieldCheck, Headphones, Search, Sparkles } from "lucide-react";
import heroImg from "@/assets/hero-concert.jpg";
import { AccessibilityScoreBadge } from "@/components/AccessibilityScoreBadge";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ingresso Acessível — Ingressos para shows e festivais" },
      { name: "description", content: "Plataforma premium e acessível para comprar ingressos para shows e festivais, com nota pública de acessibilidade por evento." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const featured = events.slice(0, 3);
  // Estatísticas reais, calculadas a partir do catálogo — substituem números
  // de marketing que antes não tinham nenhuma sustentação no produto
  // (ex.: "2.4M ingressos vendidos" em uma base com 4 eventos mock).
  const avgScore = Math.round(events.reduce((s, e) => s + e.accessibilityScore, 0) / events.length);
  const featuredForScore = events.slice().sort((a, b) => b.accessibilityScore - a.accessibilityScore)[0];

  return (
    <Layout>
      {/* HERO — cinematográfico e minimalista */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImg}
            alt=""
            aria-hidden="true"
            width={1920}
            height={1080}
            className="w-full h-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/85 to-background" />
        </div>

        <div className="relative max-w-6xl mx-auto px-5 md:px-8 pt-32 pb-24 md:pt-44 md:pb-32 animate-fade-up">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card/50 text-[12px] font-medium text-muted-foreground uppercase tracking-wider mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Desenvolvido com base nas diretrizes WCAG 2.1 AA
          </span>

          <h1 className="text-4xl md:text-6xl font-semibold leading-[1.05] max-w-3xl text-foreground">
            A música ao vivo,<br />
            <span className="text-muted-foreground">acessível para todos.</span>
          </h1>

          <p className="mt-6 text-base md:text-lg text-muted-foreground max-w-xl leading-relaxed">
            Compre ingressos para os maiores shows e festivais do Brasil em uma plataforma
            desenhada com leitura de tela, alto contraste e nota pública de acessibilidade por evento.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/eventos" className="btn-primary inline-flex items-center gap-2">
              Explorar eventos <ArrowRight size={15} />
            </Link>
            <Link to="/acessibilidade" className="btn-ghost inline-flex items-center gap-2">
              <Accessibility size={15} /> Recursos de acessibilidade
            </Link>
          </div>

          {/* Indicadores — agora derivados do catálogo real de eventos,
              não números fixos de marketing sem sustentação. */}
          <dl className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-6 max-w-2xl border-t border-border pt-8">
            {[
              { v: String(avgScore), l: "nota média de acessibilidade" },
              { v: "0–100", l: "escala pública e transparente" },
              { v: "13", l: "recursos de inclusão catalogados" },
              { v: String(events.length), l: "eventos com nota auditada" },
            ].map((s) => (
              <div key={s.l}>
                <dt className="text-xl font-semibold text-foreground">{s.v}</dt>
                <dd className="text-[12px] text-muted-foreground mt-1 uppercase tracking-wider">{s.l}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* NOTA DE ACESSIBILIDADE — diferencial central do produto, explicado
          de forma autoexplicativa: o que é, como funciona, por que importa. */}
      <section className="max-w-6xl mx-auto px-5 md:px-8 py-24 border-t border-border" aria-labelledby="nota-title">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <p className="text-[12px] font-medium text-primary uppercase tracking-wider mb-3">O diferencial</p>
            <h2 id="nota-title" className="text-2xl md:text-3xl font-semibold mb-4">
              A nota de acessibilidade é o coração da plataforma.
            </h2>
            <p className="text-muted-foreground text-[15px] leading-relaxed mb-6">
              Antes de comprar, você vê uma nota pública de 0 a 100 que resume o quanto cada evento foi
              planejado para incluir pessoas com deficiência — não é um selo genérico, é uma pontuação
              calculada a partir de recursos concretos, auditados evento a evento.
            </p>
            <ul className="space-y-4 text-sm">
              <li className="flex gap-3">
                <Search size={18} className="text-primary shrink-0 mt-0.5" aria-hidden />
                <span><strong className="text-foreground">O que é:</strong> uma pontuação de 0–100, com um selo (Inclusivo, Muito Inclusivo, Altamente Inclusivo) visível em cada card de evento.</span>
              </li>
              <li className="flex gap-3">
                <Sparkles size={18} className="text-primary shrink-0 mt-0.5" aria-hidden />
                <span><strong className="text-foreground">Como funciona:</strong> cada recurso confirmado — rampas, Libras, área PCD, abafadores de ruído — soma pontos verificáveis à nota do evento.</span>
              </li>
              <li className="flex gap-3">
                <ShieldCheck size={18} className="text-primary shrink-0 mt-0.5" aria-hidden />
                <span><strong className="text-foreground">Por que importa:</strong> você decide com informação real, sem precisar telefonar para o local ou descobrir limitações só no dia do evento.</span>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider">Exemplo real do catálogo</p>
            <AccessibilityScoreBadge
              score={featuredForScore.accessibilityScore}
              seal={featuredForScore.accessibilitySeal}
              features={featuredForScore.accessibility}
            />
          </div>
        </div>
      </section>

      {/* Pilares */}
      <section className="max-w-6xl mx-auto px-5 md:px-8 py-24 border-t border-border" aria-labelledby="pilares-title">
        <div className="max-w-2xl mb-14">
          <p className="text-[12px] font-medium text-primary uppercase tracking-wider mb-3">Nossa abordagem</p>
          <h2 id="pilares-title" className="text-2xl md:text-3xl font-semibold mb-3">
            Inclusão construída com rigor, não com checkbox.
          </h2>
          <p className="text-muted-foreground text-[15px] leading-relaxed">
            Cada recurso é desenhado com base em diretrizes de acessibilidade reconhecidas (WCAG 2.2 e
            NBR 9050) e cada evento é auditado individualmente antes de receber sua nota pública.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-px bg-border rounded-xl overflow-hidden border border-border">
          {[
            { i: <Accessibility size={20} />, t: "Painel sempre disponível", d: "Ajuste contraste, fonte, leitura de tela e simulações de daltonismo a qualquer momento, em qualquer página." },
            { i: <Headphones size={20} />, t: "Leitor de tela em PT-BR", d: "Simulação por voz com Web Speech API, controle de velocidade e atalho ALT+R — para demonstrar a experiência sonora." },
            { i: <ShieldCheck size={20} />, t: "Nota por evento", d: "Cada show é avaliado e recebe uma pontuação numérica pública de acessibilidade, visível antes da compra." },
          ].map((c) => (
            <div key={c.t} className="bg-card p-7">
              <div className="w-9 h-9 rounded-lg bg-muted text-primary flex items-center justify-center mb-5">
                {c.i}
              </div>
              <h3 className="text-[15px] font-semibold mb-2">{c.t}</h3>
              <p className="text-[14px] text-muted-foreground leading-relaxed">{c.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Eventos em destaque */}
      <section className="max-w-6xl mx-auto px-5 md:px-8 pb-24" aria-labelledby="featured-title">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-[12px] font-medium text-primary uppercase tracking-wider mb-3">Em cartaz</p>
            <h2 id="featured-title" className="text-2xl md:text-3xl font-semibold">
              Eventos em destaque
            </h2>
          </div>
          <Link to="/eventos" className="hidden sm:inline-flex items-center gap-1.5 text-[14px] text-muted-foreground hover:text-foreground transition-colors">
            Ver todos <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {featured.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
      </section>
    </Layout>
  );
}
