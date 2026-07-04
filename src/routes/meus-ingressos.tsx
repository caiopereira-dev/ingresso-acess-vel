import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { useCart } from "@/context/CartContext";
import { Calendar, MapPin, Ticket, CheckCircle2 } from "lucide-react";
import { useEffect, useRef } from "react";

export const Route = createFileRoute("/meus-ingressos")({
  // Antes o "id" vinha de search params sem nenhuma validação/tipo (usava
  // um cast "as never" em eventos.$slug.tsx só para silenciar o TS, e o
  // valor nunca era lido aqui). Agora é tipado e efetivamente usado para
  // destacar o ingresso recém-comprado — fecha o ciclo de feedback que
  // começa no toast de confirmação da página do evento.
  validateSearch: (search: Record<string, unknown>) => ({
    id: typeof search.id === "string" ? search.id : undefined,
  }),
  head: () => ({
    meta: [{ title: "Meus Ingressos — Ingresso Acessível" }],
  }),
  component: MeusIngressosPage,
});

// QR Code simulado via padrão visual determinístico
function FakeQR({ value }: { value: string }) {
  const cells = 21;
  const seed = Array.from(value).reduce((a, c) => a + c.charCodeAt(0), 0);
  const grid: boolean[][] = [];
  for (let y = 0; y < cells; y++) {
    grid[y] = [];
    for (let x = 0; x < cells; x++) {
      const v = Math.sin(seed + x * 7 + y * 13) * 10000;
      grid[y][x] = (v - Math.floor(v)) > 0.5;
    }
  }
  // 3 marcadores de canto
  const finder = (cx: number, cy: number) => {
    for (let y = 0; y < 7; y++) for (let x = 0; x < 7; x++) {
      const edge = x === 0 || y === 0 || x === 6 || y === 6;
      const inner = x >= 2 && x <= 4 && y >= 2 && y <= 4;
      grid[cy + y][cx + x] = edge || inner;
    }
  };
  finder(0, 0); finder(cells - 7, 0); finder(0, cells - 7);
  return (
    <svg viewBox={`0 0 ${cells} ${cells}`} className="w-44 h-44 bg-white rounded-xl p-2" role="img" aria-label="QR Code do ingresso">
      {grid.flatMap((row, y) => row.map((on, x) => on ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="black"/> : null))}
    </svg>
  );
}

function MeusIngressosPage() {
  const { tickets } = useCart();
  const { id: justPurchasedId } = Route.useSearch();
  const highlightRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (justPurchasedId) highlightRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [justPurchasedId]);

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-12">
        <h1 className="text-4xl md:text-5xl font-extrabold">
          Meus <span className="text-gradient">Ingressos</span>
        </h1>
        <p className="text-muted-foreground mt-3">Apresente o QR Code na entrada do evento.</p>

        {tickets.length === 0 ? (
          <div className="mt-16 text-center glass rounded-2xl border border-border p-12">
            <Ticket size={48} className="mx-auto text-muted-foreground mb-4" aria-hidden />
            <h2 className="text-xl font-bold mb-2">Você ainda não tem ingressos</h2>
            <p className="text-muted-foreground mb-6">Explore os eventos disponíveis e garanta o seu.</p>
            <Link to="/eventos" className="inline-flex px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold">
              Ver eventos
            </Link>
          </div>
        ) : (
          <ul className="mt-10 space-y-6">
            {tickets.map((t) => {
              const justPurchased = t.id === justPurchasedId;
              return (
                <li
                  key={t.id}
                  ref={justPurchased ? highlightRef : undefined}
                  className={`glass rounded-2xl border overflow-hidden grid md:grid-cols-[1fr_auto] transition-shadow ${
                    justPurchased ? "border-primary ring-2 ring-primary/40" : "border-border"
                  }`}
                >
                  <div className="p-6">
                    {justPurchased && (
                      <p className="flex items-center gap-1.5 text-[12px] font-semibold text-primary mb-2">
                        <CheckCircle2 size={14} aria-hidden /> Comprado agora
                      </p>
                    )}
                    <p className="text-xs text-primary font-bold uppercase tracking-wider">{t.tierName} · {t.qty}x</p>
                    <h2 className="text-2xl font-bold mt-1">{t.eventName}</h2>
                    <div className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                      <p className="flex items-center gap-2"><Calendar size={15}/> {t.eventDate}</p>
                      <p className="flex items-center gap-2"><MapPin size={15}/> {t.venue}</p>
                    </div>
                    <div className="mt-5 flex flex-wrap gap-4 text-xs">
                      <span className="px-3 py-1.5 rounded-full bg-muted">ID {t.id}</span>
                      <span className="px-3 py-1.5 rounded-full bg-muted">Total R$ {(t.price * t.qty).toFixed(2).replace(".", ",")}</span>
                      <span className="px-3 py-1.5 rounded-full bg-success text-success-foreground font-bold">CONFIRMADO</span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-secondary to-primary/30 flex items-center justify-center p-6 border-l border-border">
                    <FakeQR value={t.qrCode} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Layout>
  );
}
