/** Banner de onboarding para o painel de acessibilidade. Aparece uma única vez
 *  (dismissal persistido em localStorage) e some ao abrir o painel. */
import { useEffect, useState } from "react";
import { Sparkles, X } from "lucide-react";
import { useA11y } from "@/context/AccessibilityContext";

const STORAGE_KEY = "ingresso-acessivel.discovery-dismissed";

export function AccessibilityDiscoveryBanner() {
  const a = useA11y();
  // Inicia como "dismissed" para evitar flash durante hidratação
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(localStorage.getItem(STORAGE_KEY) === "1");
  }, []);

  // Some automaticamente depois que a pessoa já abriu o painel uma vez —
  // nesse ponto ela já descobriu o recurso, o banner não tem mais função.
  useEffect(() => {
    if (a.panelOpen) dismiss();
  }, [a.panelOpen]);

  function dismiss() {
    setDismissed(true);
    localStorage.setItem(STORAGE_KEY, "1");
  }

  if (dismissed) return null;

  return (
    <div role="region" aria-label="Aviso sobre recursos de acessibilidade" className="bg-primary/10 border-b border-primary/30 animate-fade-up">
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-3 flex items-center gap-3 text-sm">
        <Sparkles size={16} className="text-primary shrink-0" aria-hidden />
        <p className="flex-1 text-foreground/90">
          <strong className="font-semibold">Personalize sua experiência:</strong>{" "}
          leitor de tela, alto contraste, fontes maiores e simulação de daltonismo — tudo no botão{" "}
          <strong className="font-semibold">Acessibilidade</strong>, no canto inferior direito (atalho{" "}
          <kbd className="kbd">ALT+A</kbd>).
        </p>
        <button
          onClick={() => a.setPanelOpen(true)}
          className="hidden sm:inline-flex shrink-0 text-primary font-semibold hover:underline"
        >
          Abrir agora
        </button>
        <button onClick={dismiss} aria-label="Dispensar aviso" className="shrink-0 p-1.5 rounded-md hover:bg-primary/15 text-muted-foreground">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
