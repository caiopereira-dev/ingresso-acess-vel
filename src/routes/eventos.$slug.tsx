import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { getEvent, events } from "@/data/events";
import { useRef, useState } from "react";
import { Calendar, MapPin, Check, Minus, Plus, HelpCircle, ShieldCheck } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { AccessibilityScoreBadge, AccessibilityScoreBadgeStatic } from "@/components/AccessibilityScoreBadge";
import { toast } from "sonner";

export const Route = createFileRoute("/eventos/$slug")({
  head: ({ params }) => {
    const e = getEvent(params.slug);
    return {
      meta: [
        { title: `${e?.name ?? "Evento"} — Ingresso Acessível` },
        { name: "description", content: e?.description ?? "Detalhes do evento" },
        { property: "og:title", content: e?.name ?? "Evento" },
        { property: "og:image", content: e?.image },
      ],
    };
  },
  // key={slug} força desmontagem + remontagem completa quando o evento muda.
  // Sem isso, useState (selectedTier, qty etc.) mantém valores do evento
  // anterior — event.tiers.find() retorna undefined e a UI trava.
  component: function EventDetailRoute() {
    const { slug } = Route.useParams();
    return <EventDetailPage key={slug} />;
  },
  notFoundComponent: () => (
    <Layout>
      <div className="max-w-3xl mx-auto py-24 px-4 text-center">
        <h1 className="text-3xl font-bold">Evento não encontrado</h1>
        <Link to="/eventos" className="text-primary mt-4 inline-block">Ver todos os eventos</Link>
      </div>
    </Layout>
  ),
});

function formatBRL(n: number) {
  return `R$ ${n.toFixed(2).replace(".", ",")}`;
}

function EventDetailPage() {
  const { slug } = Route.useParams();
  const event = getEvent(slug);
  const nav = useNavigate();
  const { addPurchase } = useCart();
  const [selectedTier, setTier] = useState(event?.tiers[0].id ?? "");
  const [qty, setQty] = useState(1);
  const [faqOpen, setFaqOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const tierBtnRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  if (!event) return <Layout><div className="py-20 text-center">Evento não encontrado</div></Layout>;

  // Com key={slug} no wrapper, selectedTier é sempre reinicializado com
  // o primeiro tier deste evento. O fallback ?? event.tiers[0] é uma
  // defesa extra para o caso de um tier ter sido removido do catálogo
  // após uma compra que deixou o ID em localStorage.
  const tier = event.tiers.find((t) => t.id === selectedTier) ?? event.tiers[0];
  const total = tier.price * qty;

  // Navegação por teclado dentro do grupo de tipos de ingresso (padrão
  // WAI-ARIA Authoring Practices para radiogroup): setas movem a seleção
  // entre as opções disponíveis, pulando as esgotadas.
  function moveTier(currentId: string, dir: 1 | -1) {
    const avail = event!.tiers.filter((t) => t.available);
    if (avail.length === 0) return;
    const idx = avail.findIndex((t) => t.id === currentId);
    const nextIdx = (idx + dir + avail.length) % avail.length;
    const next = avail[nextIdx];
    setTier(next.id);
    tierBtnRefs.current.get(next.id)?.focus();
  }

  const handleConfirmBuy = () => {
    const ticket = addPurchase({
      eventId: event.id,
      eventName: event.name,
      eventDate: event.dateLabel,
      venue: event.venue,
      tierName: tier.name,
      price: tier.price,
      qty,
      buyerName: "Usuário Demo",
    });
    setConfirming(false);
    toast.success("Ingresso confirmado!", {
      description: `${qty}x ${tier.name} para ${event.name}. Você já pode vê-lo em Meus Ingressos.`,
    });
    nav({ to: "/meus-ingressos", search: { id: ticket.id } });
  };

  return (
    <Layout>
      {/* HERO */}
      <section className="relative h-[55vh] min-h-[420px] overflow-hidden">
        <img src={event.image} alt={`Imagem do evento ${event.name}`} width={1280} height={800}
          className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20" />
        <div className="relative max-w-7xl mx-auto h-full px-4 md:px-8 flex flex-col justify-end pb-10">
          <div className="mb-4 w-fit">
            <AccessibilityScoreBadgeStatic score={event.accessibilityScore} seal={event.accessibilitySeal} darkBacking />
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold">{event.name}</h1>
          <p className="mt-2 text-lg md:text-xl text-muted-foreground">{event.subtitle}</p>
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <span className="flex items-center gap-2"><Calendar size={16} /> {event.dateLabel}</span>
            <span className="flex items-center gap-2"><MapPin size={16} /> {event.venue} · {event.city}</span>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 grid lg:grid-cols-3 gap-10">
        {/* Conteúdo principal */}
        <div className="lg:col-span-2 space-y-12">
          <section aria-labelledby="sobre">
            <h2 id="sobre" className="text-2xl font-bold mb-3">Sobre o evento</h2>
            <p className="text-muted-foreground leading-relaxed">{event.description}</p>
          </section>

          <section aria-labelledby="lineup">
            <h2 id="lineup" className="text-2xl font-bold mb-4">Line-up</h2>
            <div className="flex flex-wrap gap-2">
              {event.lineup.map((a) => (
                <span key={a} className="px-4 py-2 rounded-full glass border border-border text-sm font-medium">{a}</span>
              ))}
            </div>
          </section>

          <section aria-labelledby="estrutura">
            <h2 id="estrutura" className="text-2xl font-bold mb-4">Programação e estrutura</h2>
            <ul className="space-y-2">
              {event.schedule.map((s, i) => (
                <li key={i} className="flex items-center gap-4 p-4 rounded-xl glass border border-border">
                  <span className="font-mono font-bold text-primary w-16">{s.time}</span>
                  <span className="flex-1 font-medium">{s.act}</span>
                  <span className="text-sm text-muted-foreground">{s.stage}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* MAPA — cores agora usam var(--token) em vez de oklch() fixo:
              o mapa passa a responder ao modo de alto contraste, que antes
              não tinha nenhum efeito sobre ele (achado da auditoria). */}
          <section aria-labelledby="mapa">
            <h2 id="mapa" className="text-2xl font-bold mb-4">Mapa do evento · Rotas acessíveis</h2>
            <div className="relative aspect-[16/9] glass rounded-2xl border border-border overflow-hidden p-6">
              <svg viewBox="0 0 800 450" className="w-full h-full" role="img" aria-label="Mapa esquemático do evento com áreas acessíveis destacadas">
                <rect width="800" height="450" fill="var(--card)" />
                {/* palco */}
                <rect x="300" y="40" width="200" height="60" fill="var(--primary)" rx="8" />
                <text x="400" y="78" textAnchor="middle" fill="var(--primary-foreground)" fontSize="18" fontWeight="700">PALCO PRINCIPAL</text>
                {/* área PCD */}
                <rect x="320" y="130" width="160" height="50" fill="var(--success)" rx="6" />
                <text x="400" y="160" textAnchor="middle" fill="var(--success-foreground)" fontSize="13" fontWeight="700">♿ ÁREA PCD ELEVADA</text>
                {/* pista */}
                <rect x="200" y="200" width="400" height="160" fill="var(--muted)" rx="8" stroke="var(--border)" strokeWidth="2"/>
                <text x="400" y="290" textAnchor="middle" fill="var(--foreground)" fontSize="14">Pista</text>
                {/* rampas */}
                <path d="M 100 380 L 200 320" stroke="var(--warning)" strokeWidth="6" strokeDasharray="8 4" />
                <text x="100" y="410" fill="var(--foreground)" fontSize="11">🟡 Rampa</text>
                {/* banheiros */}
                <rect x="640" y="220" width="80" height="40" fill="var(--accent)" rx="6"/>
                <text x="680" y="245" textAnchor="middle" fill="var(--accent-foreground)" fontSize="11" fontWeight="700">🚻 WC PNE</text>
                {/* entrada */}
                <rect x="350" y="400" width="100" height="30" fill="var(--foreground)" rx="4"/>
                <text x="400" y="420" textAnchor="middle" fill="var(--background)" fontSize="12" fontWeight="700">⚡ Entrada PCD</text>
              </svg>
            </div>
            <ul className="mt-4 grid sm:grid-cols-2 gap-2 text-sm">
              {event.mapAreas.map((m) => (
                <li key={m.name} className="flex items-center gap-2 p-3 rounded-lg glass border border-border">
                  <Check size={16} className="text-success" aria-hidden /> {m.name}
                </li>
              ))}
            </ul>
          </section>

          {/* ACESSIBILIDADE DO EVENTO — a nota agora é o elemento central
              da seção (expansível, com explicação de "o que é / por que
              importa"), não mais uma pílula pequena ao lado do título. */}
          <section aria-labelledby="ac-evento" className="scroll-mt-24" id="acessibilidade-do-evento">
            <h2 id="ac-evento" className="text-2xl font-bold mb-4">Acessibilidade do Evento</h2>

            <div className="mb-6">
              <AccessibilityScoreBadge score={event.accessibilityScore} seal={event.accessibilitySeal} features={event.accessibility} />
            </div>

            <p className="text-muted-foreground mb-6">Recursos disponíveis e auditados antes da venda dos ingressos.</p>

            <div className="grid sm:grid-cols-2 gap-3">
              {event.accessibility.map((f) => (
                <div key={f.label} className="p-4 rounded-xl glass border border-border flex gap-3">
                  <span className="text-2xl" aria-hidden>{f.icon}</span>
                  <div>
                    <h3 className="font-semibold text-sm">{f.label}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{f.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Renomeado de "Assistente de Acessibilidade" para o que de fato
                é: uma lista de perguntas frequentes. O nome anterior prometia
                interatividade (um assistente) que o recurso não entrega. */}
            <button
              onClick={() => setFaqOpen((v) => !v)}
              aria-expanded={faqOpen}
              aria-controls="ac-faq"
              className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-secondary text-secondary-foreground font-semibold hover:bg-secondary/80 transition-colors"
            >
              <HelpCircle size={18} /> Perguntas frequentes sobre acessibilidade
            </button>
            {faqOpen && (
              <div id="ac-faq" className="mt-4 p-5 rounded-xl glass border border-primary/40 animate-fade-up" role="region" aria-label="Perguntas frequentes sobre acessibilidade neste evento">
                <details className="mb-2"><summary className="cursor-pointer py-2 font-medium">Tem intérprete de Libras?</summary>
                  <p className="text-sm text-muted-foreground pl-4">Sim, intérpretes posicionados próximos ao palco principal durante todos os shows.</p></details>
                <details className="mb-2"><summary className="cursor-pointer py-2 font-medium">Como funciona a área PCD?</summary>
                  <p className="text-sm text-muted-foreground pl-4">Plataforma elevada exclusiva com visão privilegiada. Cada cadeirante tem direito a 1 acompanhante.</p></details>
                <details><summary className="cursor-pointer py-2 font-medium">Há abafadores para pessoas neurodivergentes?</summary>
                  <p className="text-sm text-muted-foreground pl-4">Sim, abafadores gratuitos disponíveis nos pontos de apoio sinalizados.</p></details>
              </div>
            )}
          </section>
        </div>

        {/* SIDEBAR DE COMPRA */}
        <aside className="lg:sticky lg:top-24 h-fit" aria-label="Comprar ingresso">
          <div className="glass rounded-2xl border border-border p-6">
            <h2 className="text-xl font-bold mb-4">Comprar ingresso</h2>

            <p id="tier-label" className="text-sm font-semibold mb-2">Tipo de ingresso</p>
            <div role="radiogroup" aria-labelledby="tier-label" className="space-y-2 mb-5">
              {event.tiers.map((t) => (
                <button
                  key={t.id}
                  ref={(el) => { if (el) tierBtnRefs.current.set(t.id, el); else tierBtnRefs.current.delete(t.id); }}
                  disabled={!t.available}
                  onClick={() => setTier(t.id)}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowDown" || e.key === "ArrowRight") { e.preventDefault(); moveTier(t.id, 1); }
                    if (e.key === "ArrowUp" || e.key === "ArrowLeft") { e.preventDefault(); moveTier(t.id, -1); }
                  }}
                  role="radio"
                  aria-checked={selectedTier === t.id}
                  tabIndex={selectedTier === t.id ? 0 : -1}
                  className={`w-full text-left p-4 rounded-xl border transition disabled:opacity-40 disabled:cursor-not-allowed ${
                    selectedTier === t.id ? "border-primary bg-primary/10" : "border-border hover:bg-muted"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.description}</p>
                    </div>
                    <p className="font-bold text-gradient">{formatBRL(t.price)}</p>
                  </div>
                  {!t.available && <p className="text-xs text-destructive mt-1">Esgotado</p>}
                </button>
              ))}
            </div>

            <label htmlFor="qty-display" className="block text-sm font-semibold mb-2">Quantidade</label>
            <div className="flex items-center gap-3 mb-5">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={qty <= 1}
                aria-label="Diminuir quantidade"
                className="w-10 h-10 rounded-lg border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
              ><Minus size={16}/></button>
              <span id="qty-display" className="text-xl font-bold w-10 text-center" aria-live="polite">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(8, q + 1))}
                disabled={qty >= 8}
                aria-label="Aumentar quantidade"
                className="w-10 h-10 rounded-lg border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
              ><Plus size={16}/></button>
              {qty >= 8 && <span className="text-xs text-muted-foreground">Limite por compra</span>}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-border mb-4">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-2xl font-extrabold text-gradient">{formatBRL(total)}</span>
            </div>

            {!confirming ? (
              <button onClick={() => setConfirming(true)}
                className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg shadow-[var(--shadow-soft)] hover:scale-[1.02] active:scale-[0.99] transition-transform">
                Finalizar compra
              </button>
            ) : (
              // Tela de revisão antes da confirmação final — aumenta a
              // sensação de controle sobre uma ação que, de outra forma,
              // acontecia em um único clique sem chance de revisão.
              <div role="alertdialog" aria-label="Confirmar compra" className="rounded-xl border border-primary/50 bg-primary/10 p-4 animate-scale-in">
                <p className="text-sm font-semibold mb-1">Confirmar compra?</p>
                <p className="text-sm text-muted-foreground mb-4">
                  {qty}x {tier.name} · {formatBRL(total)}
                </p>
                <div className="flex gap-2">
                  <button onClick={handleConfirmBuy} className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90">
                    Confirmar
                  </button>
                  <button onClick={() => setConfirming(false)} className="flex-1 py-2.5 rounded-lg border border-border hover:bg-muted font-semibold">
                    Voltar
                  </button>
                </div>
              </div>
            )}

            <p className="text-xs text-muted-foreground text-center mt-3 flex items-center justify-center gap-1.5">
              <ShieldCheck size={14} aria-hidden /> Pagamento simulado · ambiente demonstrativo
            </p>
          </div>
        </aside>
      </div>

      {/* Relacionados */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <h2 className="text-2xl font-bold mb-6">Outros eventos</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {events.filter((e) => e.id !== event.id).slice(0, 3).map((e) => (
            <Link key={e.id} to="/eventos/$slug" params={{ slug: e.slug }}
              className="glass rounded-xl border border-border overflow-hidden glow-hover focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={`Ver evento ${e.name} em ${e.city}`}>
              <img src={e.image} alt="" width={400} height={250} loading="lazy" className="w-full aspect-[16/10] object-cover"/>
              <div className="p-4">
                <p className="font-semibold">{e.name}</p>
                <p className="text-xs text-muted-foreground">{e.city}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
}
