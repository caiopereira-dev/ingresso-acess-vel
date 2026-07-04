import { Link } from "@tanstack/react-router";
import { Calendar, MapPin } from "lucide-react";
import type { EventItem } from "@/data/events";
import { AccessibilityScoreBadgeStatic } from "@/components/AccessibilityScoreBadge";

export function EventCard({ event }: { event: EventItem }) {
  return (
    <Link
      to="/eventos/$slug"
      params={{ slug: event.slug }}
      className="card-hover group block rounded-xl overflow-hidden bg-card border border-border focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.99]"
      aria-label={`Ver evento ${event.name} em ${event.city}, ${event.dateLabel}, a partir de R$ ${event.priceFrom}. Nota de acessibilidade ${event.accessibilityScore} de 100, selo ${event.accessibilitySeal}.`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={event.image}
          alt={`Imagem do evento ${event.name}`}
          loading="lazy"
          width={1280}
          height={800}
          className="w-full h-full object-cover transition-transform duration-[800ms] ease-out group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* Nota de acessibilidade como elemento visual central do card, não
            mais uma pílula discreta de texto pequeno — é o diferencial do
            produto, então é a primeira coisa que aparece. */}
        <div className="absolute top-3 left-3">
          <AccessibilityScoreBadgeStatic score={event.accessibilityScore} seal={event.accessibilitySeal} darkBacking />
        </div>

        <div className="absolute bottom-3 left-3 right-3">
          <p className="text-[12px] font-medium text-white/80 uppercase tracking-wider">{event.dateLabel}</p>
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-[15px] font-semibold leading-snug mb-1 text-foreground line-clamp-1">
          {event.name}
        </h3>
        <p className="text-[14px] text-muted-foreground line-clamp-1 mb-3">{event.subtitle}</p>

        <div className="flex items-center gap-3 text-[13px] text-muted-foreground mb-4">
          <span className="inline-flex items-center gap-1.5">
            <MapPin size={12} aria-hidden /> {event.city}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Calendar size={12} aria-hidden /> {event.dateLabel}
          </span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div>
            <p className="text-[12px] text-muted-foreground uppercase tracking-wider">A partir de</p>
            <p className="text-[15px] font-semibold text-foreground">
              R$ {event.priceFrom.toFixed(2).replace(".", ",")}
            </p>
          </div>
          <span className="text-[13px] font-medium text-primary group-hover:translate-x-0.5 transition-transform">
            Comprar →
          </span>
        </div>
      </div>
    </Link>
  );
}
