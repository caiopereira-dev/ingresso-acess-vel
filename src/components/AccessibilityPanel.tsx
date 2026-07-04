/**
 * Painel flutuante de acessibilidade — FAB + drawer lateral.
 * Focus trap real (useFocusTrap), Esc fecha e devolve foco, aria-modal
 * com comportamento de modal real, .kbd centralizado em styles.css.
 */
import type { ReactNode } from "react";
import { Accessibility, X, Volume2, VolumeX, Eye, Contrast, Type, Palette, Pause, Play, Square } from "lucide-react";
import { useA11y, type ColorblindMode, type VisionMode } from "@/context/AccessibilityContext";
import { useFocusTrap } from "@/hooks/use-focus-trap";

export function AccessibilityPanel() {
  const a = useA11y();
  const panelRef = useFocusTrap(a.panelOpen, () => a.setPanelOpen(false));

  return (
    <>
      {/* SVG filters para simulação de daltonismo */}
      <svg aria-hidden="true" className="absolute w-0 h-0">
        <defs>
          <filter id="cb-protanopia"><feColorMatrix values="0.567 0.433 0 0 0  0.558 0.442 0 0 0  0 0.242 0.758 0 0  0 0 0 1 0" /></filter>
          <filter id="cb-deuteranopia"><feColorMatrix values="0.625 0.375 0 0 0  0.7 0.3 0 0 0  0 0.3 0.7 0 0  0 0 0 1 0" /></filter>
          <filter id="cb-tritanopia"><feColorMatrix values="0.95 0.05 0 0 0  0 0.433 0.567 0 0  0 0.475 0.525 0 0  0 0 0 1 0" /></filter>
        </defs>
      </svg>

      {/* FAB integrado, sem brilho */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 items-end">
        <button
          onClick={a.toggleScreenReader}
          aria-label={a.screenReader ? "Desativar leitor de tela (ALT+R)" : "Ativar leitor de tela (ALT+R)"}
          aria-pressed={a.screenReader}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors border ${
            a.screenReader
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card text-foreground border-border hover:bg-muted"
          }`}
        >
          {a.screenReader ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>
        <button
          onClick={() => a.setPanelOpen(true)}
          aria-label="Abrir painel de acessibilidade (ALT+A)"
          aria-haspopup="dialog"
          aria-expanded={a.panelOpen}
          aria-controls="a11y-panel-dialog"
          className="h-11 px-4 rounded-full bg-card text-foreground border border-border hover:bg-muted flex items-center gap-2 text-[13px] font-medium shadow-[var(--shadow-soft)] transition-colors"
        >
          <Accessibility size={16} />
          <span>Acessibilidade</span>
        </button>
      </div>

      {a.panelOpen && (
        <div
          id="a11y-panel-dialog"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="a11y-panel-title"
          className="fixed inset-0 z-50 flex justify-end"
        >
          <button
            aria-label="Fechar painel"
            onClick={() => a.setPanelOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <div className="relative w-full max-w-md glass h-full overflow-y-auto p-6 animate-fade-up border-l border-border">
            <div className="flex items-center justify-between mb-6">
              <h2 id="a11y-panel-title" className="text-xl font-bold flex items-center gap-2">
                <Accessibility size={22} className="text-primary" /> Acessibilidade
              </h2>
              <button onClick={() => a.setPanelOpen(false)} aria-label="Fechar painel de acessibilidade" className="p-2 rounded-lg hover:bg-muted">
                <X size={20} />
              </button>
            </div>

            <Section icon={<Volume2 size={18} />} title="Leitor de Tela (PT-BR)">
              <p className="text-xs text-muted-foreground mb-2 -mt-1">
                Simulação por voz para demonstrar a experiência de navegação sonora. Não substitui
                leitores de tela reais (NVDA, JAWS, VoiceOver) — se você já usa um, mantenha este
                recurso desligado para evitar duas vozes simultâneas.
              </p>
              <ToggleRow active={a.screenReader} onClick={a.toggleScreenReader} label="Ativar leitor de tela" hint="Atalho ALT+R" />
              {a.screenReader && (
                <>
                  <div className="flex items-center gap-2 mt-3">
                    <button onClick={a.pause} className="btn-mini"><Pause size={14}/> Pausar</button>
                    <button onClick={a.resume} className="btn-mini"><Play size={14}/> Retomar</button>
                    <button onClick={a.stop} className="btn-mini"><Square size={14}/> Parar</button>
                  </div>
                  <label className="block mt-4 text-sm">
                    Velocidade da fala: <span className="font-semibold">{a.rate.toFixed(1)}x</span>
                    <input
                      type="range" min={0.5} max={2} step={0.1}
                      value={a.rate}
                      onChange={(e) => a.setRate(parseFloat(e.target.value))}
                      className="w-full mt-2 accent-[var(--primary)]"
                      aria-label="Velocidade da fala"
                    />
                  </label>
                </>
              )}
            </Section>

            <Section icon={<Type size={18} />} title="Tamanho da Fonte">
              <div className="flex items-center gap-2" role="group" aria-label="Tamanho da fonte">
                {[0.9, 1, 1.15, 1.3, 1.5].map((s) => (
                  <button
                    key={s}
                    onClick={() => a.setFontScale(s)}
                    aria-pressed={a.fontScale === s}
                    className={`flex-1 py-2 rounded-lg border text-sm font-semibold transition ${
                      a.fontScale === s ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"
                    }`}
                  >
                    {Math.round(s * 100)}%
                  </button>
                ))}
              </div>
            </Section>

            <Section icon={<Eye size={18} />} title="Modos de Visão">
              <div role="radiogroup" aria-label="Modos de visão" className="space-y-2">
                <VisionBtn current={a.visionMode} onSelect={a.setVisionMode} mode="default" label="Padrão" />
                <VisionBtn current={a.visionMode} onSelect={a.setVisionMode} mode="low-vision" label="Baixa visão (fonte+espaçamento+botões grandes)" />
                <VisionBtn current={a.visionMode} onSelect={a.setVisionMode} mode="blind-sim" label="Simular cegueira (tela escura, áudio apenas)" hint="Pressione Esc a qualquer momento para sair" />
              </div>
            </Section>

            <Section icon={<Contrast size={18} />} title="Alto Contraste">
              <ToggleRow active={a.highContrast} onClick={a.toggleHighContrast} label="Modo alto contraste" hint="Cores reforçadas, conforme WCAG" />
            </Section>

            <Section icon={<Palette size={18} />} title="Daltonismo">
              <div role="radiogroup" aria-label="Simulação de daltonismo" className="space-y-2">
                <CbBtn current={a.colorblind} onSelect={a.setColorblind} mode="none" label="Nenhum" />
                <CbBtn current={a.colorblind} onSelect={a.setColorblind} mode="protanopia" label="Protanopia (vermelho)" />
                <CbBtn current={a.colorblind} onSelect={a.setColorblind} mode="deuteranopia" label="Deuteranopia (verde)" />
                <CbBtn current={a.colorblind} onSelect={a.setColorblind} mode="tritanopia" label="Tritanopia (azul)" />
              </div>
            </Section>

            <div className="mt-6 p-4 rounded-xl bg-muted/40 text-xs text-muted-foreground border border-border">
              <p className="font-semibold text-foreground mb-1">Atalhos de teclado</p>
              <ul className="space-y-1.5">
                <li><kbd className="kbd">ALT+R</kbd> Leitor de tela</li>
                <li><kbd className="kbd">ALT+A</kbd> Painel de acessibilidade</li>
                <li><kbd className="kbd">ALT+1</kbd> Eventos</li>
                <li><kbd className="kbd">ALT+2</kbd> Acessibilidade</li>
                <li><kbd className="kbd">ALT+3</kbd> Meus Ingressos</li>
                <li><kbd className="kbd">Esc</kbd> Fecha este painel / sai do modo cegueira</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Section({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <section className="mb-5">
      <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">
        {icon} {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function ToggleRow({ active, onClick, label, hint }: { active: boolean; onClick: () => void; label: string; hint?: string }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`w-full flex items-center justify-between p-3 rounded-lg border transition ${
        active ? "bg-primary/15 border-primary" : "border-border hover:bg-muted"
      }`}
    >
      <span className="text-left">
        <span className="block text-sm font-medium">{label}</span>
        {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
      </span>
      <span className={`w-10 h-6 rounded-full relative transition ${active ? "bg-primary" : "bg-muted"}`}>
        <span className={`absolute top-0.5 ${active ? "left-5" : "left-0.5"} w-5 h-5 rounded-full bg-white transition-all`} />
      </span>
    </button>
  );
}

function VisionBtn({ current, onSelect, mode, label, hint }: { current: VisionMode; onSelect: (m: VisionMode) => void; mode: VisionMode; label: string; hint?: string }) {
  const active = current === mode;
  return (
    <button onClick={() => onSelect(mode)} role="radio" aria-checked={active}
      className={`w-full text-left p-3 rounded-lg border text-sm transition ${active ? "bg-primary/15 border-primary font-semibold" : "border-border hover:bg-muted"}`}>
      {label}
      {hint && <span className="block text-xs text-muted-foreground font-normal mt-0.5">{hint}</span>}
    </button>
  );
}

function CbBtn({ current, onSelect, mode, label }: { current: ColorblindMode; onSelect: (m: ColorblindMode) => void; mode: ColorblindMode; label: string }) {
  const active = current === mode;
  return (
    <button onClick={() => onSelect(mode)} role="radio" aria-checked={active}
      className={`w-full text-left p-3 rounded-lg border text-sm transition ${active ? "bg-primary/15 border-primary font-semibold" : "border-border hover:bg-muted"}`}>
      {label}
    </button>
  );
}
