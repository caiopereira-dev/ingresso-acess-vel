import { useEffect, useRef } from "react";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * useFocusTrap
 * -------------
 * Implementa o padrão de modal das WAI-ARIA Authoring Practices:
 *  - ao abrir, guarda o elemento que tinha foco e move o foco para dentro do modal;
 *  - Tab/Shift+Tab ficam confinados aos elementos focáveis do modal (focus trap real);
 *  - Esc dispara onClose;
 *  - ao fechar, o foco retorna para o elemento que abriu o modal.
 *
 * Corrige um problema real encontrado na auditoria: `aria-modal="true"` estava
 * declarado sem nenhum comportamento de modal por trás, o que é pior do que não
 * declarar — informa tecnologia assistiva algo que o código não cumpria.
 */
export function useFocusTrap(active: boolean, onClose: () => void) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;

    const container = containerRef.current;
    const focusables = () =>
      container ? Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)) : [];

    // Foco inicial: primeiro elemento focável do modal (geralmente o botão fechar).
    const first = focusables()[0];
    first?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;

      const items = focusables();
      if (items.length === 0) return;
      const firstEl = items[0];
      const lastEl = items[items.length - 1];

      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      // Devolve o foco para quem abriu o modal.
      previouslyFocused.current?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return containerRef;
}
