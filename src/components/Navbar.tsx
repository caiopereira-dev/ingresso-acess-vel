import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Logo } from "./Logo";

const links = [
  { to: "/", label: "Início" },
  { to: "/eventos", label: "Eventos" },
  { to: "/acessibilidade", label: "Acessibilidade" },
  { to: "/meus-ingressos", label: "Meus ingressos" },
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fecha o menu mobile com Esc e devolve o foco ao botão que o abriu —
  // mesmo padrão de teclado esperado em qualquer menu/disclosure (achado
  // da auditoria: antes não havia nenhuma forma de fechar via teclado
  // além de clicar novamente no botão).
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
        scrolled ? "glass border-b border-border" : "bg-transparent border-b border-transparent"
      }`}
      role="banner"
    >
      <nav
        aria-label="Navegação principal"
        className="max-w-6xl mx-auto px-5 md:px-8 h-14 flex items-center justify-between"
      >
        <Link to="/" aria-label="Página inicial Ingresso Acessível">
          <Logo />
        </Link>

        <ul className="hidden md:flex items-center gap-0.5">
          {links.map((l) => {
            const active = path === l.to;
            return (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className={`px-3 py-1.5 rounded-md text-[14px] font-medium transition-colors ${
                    active
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="hidden md:flex items-center gap-2">
          <Link to="/login" className="text-[14px] font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-md">
            Entrar
          </Link>
          <Link to="/eventos" className="btn-primary text-[14px] py-2 px-4">
            Ver eventos
          </Link>
        </div>

        <button
          ref={toggleRef}
          className="md:hidden p-2 rounded-md text-foreground hover:bg-muted"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {open && (
        <ul id="mobile-menu" className="md:hidden glass border-t border-border px-4 py-3 space-y-1">
          {links.map((l) => (
            <li key={l.to}>
              <Link
                to={l.to}
                onClick={() => setOpen(false)}
                className="block px-3 py-2.5 rounded-md hover:bg-muted text-sm font-medium"
              >
                {l.label}
              </Link>
            </li>
          ))}
          <li>
            <Link to="/login" onClick={() => setOpen(false)} className="block px-3 py-2.5 rounded-md hover:bg-muted text-sm font-medium">
              Entrar
            </Link>
          </li>
        </ul>
      )}
    </header>
  );
}
