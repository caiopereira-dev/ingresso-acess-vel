// Logo minimalista — marca "Ingresso Acessível"
export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <rect x="1" y="1" width="26" height="26" rx="7" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
        <path
          d="M9 9.5 L9 18.5 M14 7 L14 21 M19 11 L19 17"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          className="text-foreground"
        />
      </svg>
      <span className="text-[15px] font-semibold tracking-tight text-foreground">
        Ingresso<span className="text-muted-foreground font-normal"> Acessível</span>
      </span>
    </div>
  );
}
