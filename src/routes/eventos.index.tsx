import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { EventCard } from "@/components/EventCard";
import { events } from "@/data/events";
import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";

export const Route = createFileRoute("/eventos/")({
  head: () => ({
    meta: [
      { title: "Eventos — Ingresso Acessível" },
      { name: "description", content: "Todos os shows, festivais e eventos musicais disponíveis na Ingresso Acessível." },
    ],
  }),
  component: EventosPage,
});

type SortKey = "relevancia" | "acessibilidade" | "data" | "preco";

function EventosPage() {
  const [q, setQ] = useState("");
  const [onlyHighScore, setOnlyHighScore] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("relevancia");

  const filtered = useMemo(() => {
    let list = events.filter(
      (e) => e.name.toLowerCase().includes(q.toLowerCase()) || e.city.toLowerCase().includes(q.toLowerCase()),
    );
    if (onlyHighScore) list = list.filter((e) => e.accessibilityScore >= 90);

    list = [...list];
    if (sortKey === "acessibilidade") list.sort((a, b) => b.accessibilityScore - a.accessibilityScore);
    if (sortKey === "data") list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    if (sortKey === "preco") list.sort((a, b) => a.priceFrom - b.priceFrom);
    return list;
  }, [q, onlyHighScore, sortKey]);

  const hasActiveFilter = q.length > 0 || onlyHighScore;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <h1 className="text-4xl md:text-5xl font-extrabold">
          Todos os <span className="text-gradient">eventos</span>
        </h1>
        <p className="text-muted-foreground mt-3 max-w-2xl" role="status" aria-live="polite">
          {filtered.length} {filtered.length === 1 ? "evento encontrado" : "eventos encontrados"}, todos com nota de acessibilidade detalhada.
        </p>

        <div className="mt-8 flex flex-col md:flex-row gap-3 md:items-center">
          <div className="relative flex-1 max-w-xl">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por nome ou cidade..."
              aria-label="Buscar eventos por nome ou cidade"
              className="w-full pl-12 pr-4 py-3.5 rounded-xl glass border border-border focus:outline-none focus:ring-4 focus:ring-primary/30"
            />
          </div>

          <label className="inline-flex items-center gap-2 text-sm rounded-xl border border-border px-4 py-3 cursor-pointer glass">
            <input
              type="checkbox"
              checked={onlyHighScore}
              onChange={(e) => setOnlyHighScore(e.target.checked)}
              className="accent-[var(--primary)] w-4 h-4"
            />
            Nota de acessibilidade 90+
          </label>

          <label className="inline-flex items-center gap-2 text-sm rounded-xl border border-border px-3 py-3 glass">
            <SlidersHorizontal size={15} className="text-muted-foreground" aria-hidden />
            <span className="text-muted-foreground">Ordenar:</span>
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              aria-label="Ordenar eventos por"
              className="bg-transparent focus:outline-none text-foreground"
            >
              <option value="relevancia">Relevância</option>
              <option value="acessibilidade">Nota de acessibilidade</option>
              <option value="data">Data</option>
              <option value="preco">Menor preço</option>
            </select>
          </label>
        </div>

        {filtered.length > 0 ? (
          <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((e) => <EventCard key={e.id} event={e} />)}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-lg font-semibold">Nenhum evento encontrado{q && <> para "{q}"</>}.</p>
            <p className="text-muted-foreground mt-1.5 text-sm">
              Tente outro termo de busca {onlyHighScore && "ou remova o filtro de nota de acessibilidade"}.
            </p>
            {hasActiveFilter && (
              <button
                onClick={() => { setQ(""); setOnlyHighScore(false); }}
                className="btn-ghost mt-6 inline-flex items-center gap-2"
              >
                <X size={15} /> Limpar filtros
              </button>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
