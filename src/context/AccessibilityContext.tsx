/**
 * AccessibilityContext
 * ---------------------
 * Estado global de acessibilidade da plataforma. Concentra:
 *  - Modos visuais (alto contraste, baixa visão, simulações de daltonismo, modo cegueira)
 *  - Escala de fonte
 *  - Leitor de tela com Web Speech API (PT-BR), com hover-to-speak e foco-to-speak
 *  - Atalhos globais ALT+R, ALT+1/2/3
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useNavigate } from "@tanstack/react-router";

export type ColorblindMode = "none" | "protanopia" | "deuteranopia" | "tritanopia";
export type VisionMode = "default" | "low-vision" | "blind-sim";

type Ctx = {
  highContrast: boolean;
  toggleHighContrast: () => void;
  visionMode: VisionMode;
  setVisionMode: (m: VisionMode) => void;
  colorblind: ColorblindMode;
  setColorblind: (m: ColorblindMode) => void;
  fontScale: number;
  setFontScale: (n: number) => void;
  screenReader: boolean;
  toggleScreenReader: () => void;
  speak: (text: string) => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  rate: number;
  setRate: (n: number) => void;
  panelOpen: boolean;
  setPanelOpen: (b: boolean) => void;
};

const AccessibilityContext = createContext<Ctx | null>(null);

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [highContrast, setHC] = useState(false);
  const [visionMode, setVisionMode] = useState<VisionMode>("default");
  const [colorblind, setColorblind] = useState<ColorblindMode>("none");
  const [fontScale, setFontScale] = useState(1);
  const [screenReader, setSR] = useState(false);
  const [rate, setRate] = useState(1);
  const [panelOpen, setPanelOpen] = useState(false);
  const lastSpoken = useRef<string>("");

  // Aplica classes no <html> conforme modos selecionados.
  // Importante: "a11y-blind-sim" é aplicado em #app-shell (não em <html>),
  // para que o botão flutuante de acessibilidade e seu painel continuem
  // visíveis e operáveis mesmo com a tela escurecida — essa é a saída de
  // emergência do modo. Ver Layout.tsx.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("a11y-high-contrast", highContrast);
    root.classList.toggle("a11y-low-vision", visionMode === "low-vision");
    root.classList.remove("a11y-protanopia", "a11y-deuteranopia", "a11y-tritanopia");
    if (colorblind !== "none") root.classList.add(`a11y-${colorblind}`);
    root.style.setProperty("--a11y-font-scale", String(fontScale));

    const shell = document.getElementById("app-shell");
    shell?.classList.toggle("a11y-blind-sim", visionMode === "blind-sim");
  }, [highContrast, visionMode, colorblind, fontScale]);

  // ====== Web Speech API ======
  const speak = useCallback(
    (text: string) => {
      if (!screenReader || typeof window === "undefined" || !("speechSynthesis" in window)) return;
      const clean = text?.trim();
      if (!clean || clean === lastSpoken.current) return;
      lastSpoken.current = clean;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(clean);
      u.lang = "pt-BR";
      u.rate = rate;
      window.speechSynthesis.speak(u);
    },
    [screenReader, rate],
  );

  const stop = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    lastSpoken.current = "";
  }, []);
  const pause = useCallback(() => window.speechSynthesis?.pause(), []);
  const resume = useCallback(() => window.speechSynthesis?.resume(), []);

  const toggleScreenReader = useCallback(() => {
    setSR((prev) => {
      const next = !prev;
      if (!next) window.speechSynthesis?.cancel();
      else {
        const u = new SpeechSynthesisUtterance("Leitor de tela ativado. Use TAB para navegar ou passe o mouse sobre os elementos.");
        u.lang = "pt-BR";
        u.rate = rate;
        window.speechSynthesis.speak(u);
      }
      return next;
    });
  }, [rate]);

  const toggleHighContrast = useCallback(() => setHC((v) => !v), []);

  // ====== Hover-to-speak e Focus-to-speak globais ======
  useEffect(() => {
    if (!screenReader) return;
    const getText = (el: Element | null): string => {
      if (!el) return "";
      const e = el as HTMLElement;
      return (
        e.getAttribute("aria-label") ||
        e.getAttribute("data-speak") ||
        e.getAttribute("alt") ||
        e.getAttribute("title") ||
        e.innerText?.slice(0, 250) ||
        ""
      );
    };
    const onOver = (ev: MouseEvent) => {
      const t = (ev.target as HTMLElement).closest(
        "a, button, [role=button], h1, h2, h3, [data-speak], img, nav",
      );
      const text = getText(t);
      if (text) speak(text);
    };
    const onFocus = (ev: FocusEvent) => {
      const text = getText(ev.target as Element);
      if (text) speak(text);
    };
    document.addEventListener("mouseover", onOver);
    document.addEventListener("focusin", onFocus);
    return () => {
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("focusin", onFocus);
    };
  }, [screenReader, speak]);

  const navigate = useNavigate();

  // Anuncia, por voz, como saio do modo cegueira no momento em que é ativado —
  // a pessoa não precisa enxergar nada na tela para saber que Esc (ou Alt+A)
  // resolve. Corrige a "armadilha de navegação" identificada na auditoria.
  useEffect(() => {
    if (visionMode !== "blind-sim" || !screenReader) return;
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(
      "Modo de simulação de cegueira ativado. A tela foi escurecida. Pressione Escape a qualquer momento para sair e restaurar a visualização normal.",
    );
    u.lang = "pt-BR";
    u.rate = rate;
    window.speechSynthesis.speak(u);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visionMode]);

  // ====== Atalhos globais ======
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Esc sempre sai do modo cegueira, com ou sem Alt, de qualquer lugar da
      // página — é a saída de emergência independente de onde está o foco.
      if (e.key === "Escape" && visionMode === "blind-sim") {
        e.preventDefault();
        setVisionMode("default");
        return;
      }
      if (!e.altKey) return;
      const k = e.key.toLowerCase();
      if (k === "r") { e.preventDefault(); toggleScreenReader(); }
      if (k === "1") { e.preventDefault(); navigate({ to: "/eventos" }); }
      if (k === "2") { e.preventDefault(); navigate({ to: "/acessibilidade" }); }
      if (k === "3") { e.preventDefault(); navigate({ to: "/meus-ingressos" }); }
      if (k === "a") { e.preventDefault(); setPanelOpen(true); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggleScreenReader, visionMode, navigate]);

  const value = useMemo<Ctx>(
    () => ({
      highContrast, toggleHighContrast,
      visionMode, setVisionMode,
      colorblind, setColorblind,
      fontScale, setFontScale,
      screenReader, toggleScreenReader,
      speak, stop, pause, resume,
      rate, setRate,
      panelOpen, setPanelOpen,
    }),
    [highContrast, visionMode, colorblind, fontScale, screenReader, rate, panelOpen,
     toggleHighContrast, setVisionMode, setColorblind, setFontScale,
     toggleScreenReader, speak, stop, pause, resume, setRate, setPanelOpen],
  );

  return <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>;
}

export function useA11y() {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) throw new Error("useA11y deve ser usado dentro de AccessibilityProvider");
  return ctx;
}
