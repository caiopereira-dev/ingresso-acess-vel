/**
 * Duas variantes da nota de acessibilidade (0–100) de um evento:
 * - AccessibilityScoreBadgeStatic — visual puro, seguro dentro de <Link>.
 * - AccessibilityScoreBadge — expansível (<details>), com explicação inline.
 */
import type { AccessibilityFeature, EventItem } from "@/data/events";

type Tone = "high" | "mid" | "entry";

const TONE_BY_SEAL: Record<EventItem["accessibilitySeal"], Tone> = {
  "Altamente Inclusivo": "high",
  "Muito Inclusivo": "mid",
  Inclusivo: "entry",
};

const TONE_STYLES: Record<Tone, { ring: string; bg: string; fg: string; border: string }> = {
  high: { ring: "var(--score-high)", bg: "bg-[var(--score-high)]/15", fg: "text-[var(--score-high)]", border: "border-[var(--score-high)]/40" },
  mid: { ring: "var(--score-mid)", bg: "bg-[var(--score-mid)]/15", fg: "text-[var(--score-mid)]", border: "border-[var(--score-mid)]/40" },
  entry: { ring: "var(--score-entry)", bg: "bg-[var(--score-entry)]/15", fg: "text-[var(--score-entry)]", border: "border-[var(--score-entry)]/40" },
};

function ScoreRing({ score, tone, size }: { score: number; tone: Tone; size: number }) {
  const stroke = size >= 64 ? 5 : 3.5;
  const r = size / 2 - stroke;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true" className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={TONE_STYLES[tone].ring} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 0.6s cubic-bezier(0.16,1,0.3,1)" }}
      />
    </svg>
  );
}

function ScoreCore({ score, seal, size }: { score: number; seal: EventItem["accessibilitySeal"]; size: "sm" | "lg" }) {
  const tone = TONE_BY_SEAL[seal];
  const dim = size === "lg" ? 76 : 40;
  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: dim, height: dim }}>
      <ScoreRing score={score} tone={tone} size={dim} />
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`font-bold leading-none ${TONE_STYLES[tone].fg} ${size === "lg" ? "text-xl" : "text-[13px]"}`}>
          {score}
        </span>
        {size === "lg" && <span className="text-[11px] text-muted-foreground leading-none mt-0.5">/100</span>}
      </div>
    </div>
  );
}

/** Badge estático — seguro para usar dentro de um <Link> (EventCard). */
export function AccessibilityScoreBadgeStatic({
  score, seal, darkBacking = false,
}: { score: number; seal: EventItem["accessibilitySeal"]; darkBacking?: boolean }) {
  const tone = TONE_BY_SEAL[seal];
  const skin = darkBacking
    ? "bg-black/55 backdrop-blur-md border-white/15"
    : `${TONE_STYLES[tone].bg} ${TONE_STYLES[tone].border}`;
  return (
    <div
      className={`flex items-center gap-2 rounded-full pl-1 pr-3 py-1 border ${skin}`}
      aria-label={`Nota de acessibilidade: ${score} de 100 — selo ${seal}`}
    >
      <ScoreCore score={score} seal={seal} size="sm" />
      <span className={`text-[12px] font-semibold ${darkBacking ? "text-white" : TONE_STYLES[tone].fg}`}>{seal}</span>
    </div>
  );
}

/** Badge expansível com explicação — use fora de elementos interativos. */
export function AccessibilityScoreBadge({
  score, seal, features = [],
}: { score: number; seal: EventItem["accessibilitySeal"]; features?: AccessibilityFeature[] }) {
  const tone = TONE_BY_SEAL[seal];
  const sample = features.slice(0, 4);

  return (
    <details className="group rounded-2xl border border-border bg-card/60 open:bg-card transition-colors">
      <summary
        className={`list-none flex items-center gap-4 p-4 rounded-2xl cursor-pointer select-none [&::-webkit-details-marker]:hidden`}
      >
        <ScoreCore score={score} seal={seal} size="lg" />
        <div className="flex-1">
          <p className={`text-sm font-bold ${TONE_STYLES[tone].fg}`}>{seal}</p>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            Nota de acessibilidade do evento — toque para entender o que isso significa
          </p>
        </div>
        <span
          aria-hidden="true"
          className="text-muted-foreground text-xs border border-border rounded-full w-6 h-6 flex items-center justify-center shrink-0 transition-transform group-open:rotate-180"
        >
          ▾
        </span>
      </summary>

      <div className="px-4 pb-4 pt-1 text-sm text-muted-foreground space-y-3 border-t border-border/70 mt-1">
        <p>
          A <strong className="text-foreground">nota de acessibilidade</strong> resume, em uma escala de 0 a 100,
          o quanto este evento foi planejado para incluir pessoas com deficiência — mobilidade reduzida,
          baixa visão, surdez ou neurodivergência. Ela é calculada a partir dos recursos físicos e de
          atendimento confirmados pelo organizador do evento, como os listados abaixo.
        </p>
        {sample.length > 0 && (
          <ul className="grid sm:grid-cols-2 gap-2">
            {sample.map((f) => (
              <li key={f.label} className="flex items-start gap-2 text-[13px]">
                <span aria-hidden="true">{f.icon}</span>
                <span className="text-foreground/90">{f.label}</span>
              </li>
            ))}
          </ul>
        )}
        <p className="text-[12px]">
          Por que importa: com a nota visível antes da compra, você decide com informação real — sem
          precisar telefonar para o local ou descobrir limitações só no dia do evento.
        </p>
      </div>
    </details>
  );
}
