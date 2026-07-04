# Ingresso Acessível

Plataforma de venda de ingressos para shows e festivais, com foco em **acessibilidade digital** (leitor de tela em PT-BR, alto contraste, simulação de daltonismo, modo de baixa visão) e em uma **nota pública de acessibilidade por evento**.

Stack: **React 19 + TanStack Router + Vite 7 + Tailwind CSS v4 + TypeScript**, publicado como site **100% estático** (SPA) — sem necessidade de servidor próprio.

> Esta versão foi adaptada para rodar no **GitHub Pages**. Se você procura a versão anterior (TanStack Start, com SSR), veja `MIGRATION-GITHUB-PAGES.md` para o histórico completo da migração.

---

## 1. Pré-requisitos

- **Node.js 20 ou superior** → https://nodejs.org
- **VS Code** (recomendado) → https://code.visualstudio.com
- **Git** → https://git-scm.com

```bash
node -v   # v20.x ou superior
npm -v    # 10.x ou superior
```

---

## 2. Rodar localmente

```bash
npm install
npm run dev
```

Abra `http://localhost:5173` (ou a porta que o terminal indicar).

### Outros comandos

```bash
npm run build     # gera a versão estática de produção em dist/
npm run preview   # serve a pasta dist/ localmente — útil para testar
                   # exatamente o que será publicado, antes de subir para o GitHub
npm run lint       # checa erros de lint
```

> Não existe mais `npm run start`: como o projeto não tem servidor próprio, "rodar em produção" significa simplesmente **servir os arquivos estáticos de `dist/`** — é exatamente isso que `npm run preview` faz localmente, e o que o GitHub Pages faz depois do deploy.

---

## 3. Publicar no GitHub Pages

O repositório já vem com um workflow pronto (`.github/workflows/deploy.yml`) que builda e publica o site automaticamente. Você só precisa de **dois passos manuais, uma única vez**:

### Passo 1 — Subir o projeto para um repositório no GitHub

```bash
git init
git add .
git commit -m "Versão adaptada para GitHub Pages"
git branch -M main
git remote add origin https://github.com/<seu-usuario>/<seu-repositorio>.git
git push -u origin main
```

### Passo 2 — Habilitar o GitHub Pages com origem "GitHub Actions"

No repositório, no GitHub:

1. Vá em **Settings → Pages**.
2. Em **Build and deployment → Source**, selecione **GitHub Actions**.

Pronto. A partir do próximo `push` na branch `main` (inclusive este primeiro), a aba **Actions** vai mostrar o workflow "Deploy para o GitHub Pages" rodando. Quando ele terminar (ícone verde ✅), o site estará disponível em:

```
https://<seu-usuario>.github.io/<seu-repositorio>/
```

Você **não precisa editar nenhum arquivo de configuração** para isso funcionar — o workflow detecta automaticamente o nome do repositório e ajusta o caminho base do site durante o build (veja `MIGRATION-GITHUB-PAGES.md`, seção "Caminho base (`base`)", se quiser entender como).

### Deploy manual (sem esperar um push)

Na aba **Actions** do repositório, clique no workflow "Deploy para o GitHub Pages" → **Run workflow**.

---

## 4. Estrutura do projeto

```text
ingresso-acessivel/
├── index.html                  # Ponto de entrada estático (novo — ver migração)
├── public/
│   └── favicon.svg
├── .github/workflows/deploy.yml  # Build + publicação automática no GitHub Pages
├── vite.config.ts
├── package.json
├── tsconfig.json
├── components.json
├── eslint.config.js
├── .prettierrc
└── src/
    ├── main.tsx                 # Bootstrap do React (novo — ver migração)
    ├── router.tsx                # Configuração do TanStack Router (hash history)
    ├── routeTree.gen.ts          # Gerado automaticamente — não editar
    ├── styles.css                # Tailwind v4 + design tokens (oklch)
    ├── routes/
    │   ├── __root.tsx             # Layout raiz + tratamento de erro/404
    │   ├── index.tsx               # Home
    │   ├── eventos.index.tsx       # Lista de eventos
    │   ├── eventos.$slug.tsx       # Detalhe + checkout simulado
    │   ├── acessibilidade.tsx     # Página institucional de acessibilidade
    │   ├── meus-ingressos.tsx     # Ingressos comprados (QR simulado)
    │   └── login.tsx
    ├── components/
    │   ├── Navbar.tsx, Layout.tsx, Logo.tsx, EventCard.tsx
    │   ├── AccessibilityPanel.tsx      # Painel flutuante de acessibilidade
    │   ├── AccessibilityScoreBadge.tsx # Nota de acessibilidade (diferencial do produto)
    │   ├── AccessibilityDiscoveryBanner.tsx
    │   └── ui/                     # shadcn/ui (button, card, dialog, etc.)
    ├── context/
    │   ├── AccessibilityContext.tsx  # Leitor de tela, contraste, daltonismo
    │   └── CartContext.tsx            # Ingressos comprados (localStorage)
    ├── data/events.ts              # Catálogo de eventos (dados simulados)
    ├── hooks/use-focus-trap.ts
    ├── assets/                     # Imagens
    └── lib/utils.ts
```

### Sobre Tailwind v4

Continua sem `tailwind.config.js`/`postcss.config.js` — a configuração (cores, tokens, tema) está em `src/styles.css` via `@import "tailwindcss"` e `@theme`.

### Sobre as rotas (importante)

As URLs agora usam **hash routing** (formato `.../#/eventos/nome-do-evento`). Isso é intencional: o GitHub Pages não tem um servidor que possa redirecionar qualquer URL "profunda" de volta para `index.html`, então o hash garante que **recarregar a página em qualquer rota sempre funciona**, sem precisar de nenhuma página 404 de fallback. Veja a justificativa completa em `MIGRATION-GITHUB-PAGES.md`.

---

## 5. Recursos de acessibilidade implementados

Todos continuam funcionando exatamente como antes — nada foi removido ou simplificado nesta adaptação:

- Painel flutuante de acessibilidade, sempre o primeiro elemento focável após o link de pular conteúdo (atalho **ALT+A**)
- Leitor de tela simulado em PT-BR via Web Speech API (atalho **ALT+R**)
- Alto contraste, modo de baixa visão (fonte/área de toque ampliadas)
- Simulação de daltonismo (protanopia, deuteranopia, tritanopia) via filtros SVG
- Modo de simulação de cegueira, com saída de emergência por **Esc** a qualquer momento
- Navegação 100% por teclado, foco visível, *focus trap* real no painel e nos diálogos
- Skip link ("Pular para o conteúdo principal")
- Nota pública de acessibilidade por evento (0–100), com selo e explicação expansível
- `prefers-reduced-motion` respeitado

---

## 6. Solução de problemas comuns

### "node: command not found" / "npm não é reconhecido"
Node.js não instalado. Baixe em https://nodejs.org e reinicie o terminal.

### "Port 5173 is already in use"
```bash
npm run dev -- --port 3000
```

### Página em branco depois de publicar no GitHub Pages
Confira se em **Settings → Pages → Source** está selecionado **GitHub Actions** (não "Deploy from a branch"). Veja também se o workflow terminou com sucesso na aba **Actions**.

### Os links/imagens não carregam no site publicado, mas funcionam em `npm run dev`
Sintoma típico de `base` incorreto. Rode `npm run build && npm run preview` localmente — se funcionar em `preview` mas não no GitHub Pages, confira no log do workflow (aba Actions → job *build* → passo "Determinar caminho base") qual valor de `VITE_BASE_PATH` foi usado, e se ele bate com o nome real do repositório.

### Erros estranhos depois de alterar dependências
```bash
rm -rf node_modules package-lock.json
npm install
```

---

Bom desenvolvimento! 🎫
