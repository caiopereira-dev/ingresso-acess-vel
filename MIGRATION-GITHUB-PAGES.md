# Migração para GitHub Pages — registro técnico completo

Este documento descreve **exatamente o que foi alterado** no projeto para torná-lo compatível com GitHub Pages, e **por que** cada alteração foi necessária. Nenhuma funcionalidade, layout ou recurso de acessibilidade foi removido — apenas a camada de infraestrutura que dependia de um servidor Node.js foi substituída por equivalentes estáticos.

## Diagnóstico: por que o projeto original não rodava no GitHub Pages

O projeto era construído com **TanStack Start**, um framework *full-stack* que faz *server-side rendering* (SSR): ele precisa de um processo Node.js (ou um runtime de borda, como Cloudflare Workers) rodando continuamente para renderizar páginas, processar rotas e executar *server functions* a cada requisição. Isso ficava explícito em três arquivos:

- `src/start.ts` — configurava o middleware de SSR do Start.
- `src/server.ts` — era o *handler* HTTP que processava cada requisição (`fetch(request, env, ctx)`).
- `vite.config.ts` — usava `@lovable.dev/vite-tanstack-config`, que embutia o plugin de SSR do Start e configurava o build via **Nitro** com alvo **Cloudflare Workers**.

**GitHub Pages serve exclusivamente arquivos estáticos** (HTML, CSS, JS, imagens) — não existe processo de servidor, não existe execução de código no momento da requisição. Por isso, qualquer parte do projeto que dependesse de SSR ou de *server functions* precisava ser removida ou substituída por um equivalente 100% client-side.

**Boa notícia confirmada durante a análise:** a lógica de negócio do projeto (catálogo de eventos, carrinho, ingressos) **já era inteiramente client-side** — eventos vêm de `src/data/events.ts` (array estático) e os ingressos comprados ficam em `localStorage` (`src/context/CartContext.tsx`). A única *server function* de exemplo do projeto (`src/lib/api/example.functions.ts`) nunca era chamada por nenhuma rota real. Ou seja: **não havia nenhum dado real de produto passando pelo servidor** — o SSR existia só na camada de infraestrutura (roteamento e renderização), não na camada de dados. Isso tornou a migração muito mais simples e segura do que pareceria a princípio.

---

## O que foi removido (e por quê)

| Arquivo | Motivo da remoção |
|---|---|
| `src/start.ts` | Configurava middleware de SSR do TanStack Start. Sem servidor, não há o que processar. |
| `src/server.ts` | *Handler* HTTP (`fetch`) que processava requisições SSR. Não existe requisição de servidor a processar no GitHub Pages. |
| `src/lib/error-capture.ts` | Capturava erros globais para que `server.ts` recuperasse o *stack trace* quando o SSR falhava. Só fazia sentido junto com `server.ts`. |
| `src/lib/error-page.ts` | Gerava uma página de erro HTML estática, usada por `server.ts`/`start.ts` em falhas catastróficas de SSR. Sem SSR, sem essa classe de falha. |
| `src/lib/config.server.ts` | Helper de variáveis de ambiente *somente de servidor* (`process.env` lido por requisição). Usado apenas por `example.functions.ts`. |
| `src/lib/api/example.functions.ts` | *Server function* de exemplo do boilerplate do Start — nunca chamada por nenhuma rota real do produto, e *server functions* não existem fora de um servidor. |
| `src/lib/lovable-error-reporting.ts` | Enviava erros para `window.__lovableEvents`, um *hook* que só existe dentro do editor/sandbox da plataforma Lovable.dev. Fora dali (inclusive no GitHub Pages) é sempre um no-op — código morto em produção. A chamada em `__root.tsx` foi removida; o `console.error(error)` que já existia ao lado continua registrando o erro normalmente. |

Nenhum desses arquivos é importado por nenhuma rota, componente ou contexto do produto (confirmado por busca textual em todo o `src/` antes da remoção) — a remoção não afeta nenhuma funcionalidade visível.

## O que foi substituído (e por quê)

### 1. `vite.config.ts` — de wrapper SSR para config explícita de SPA

**Antes:** `defineConfig` vinha de `@lovable.dev/vite-tanstack-config`, que embutia, sem opção de desligar, o plugin de SSR do TanStack Start e o build via Nitro/Cloudflare.

**Depois:** `vite.config.ts` explícito, usando diretamente os mesmos plugins que o wrapper já usava por baixo dos panos — `@tanstack/router-plugin/vite` (gera `routeTree.gen.ts`, sem mudança de comportamento), `@vitejs/plugin-react`, `@tailwindcss/vite`, `vite-tsconfig-paths` (alias `@/*`) — **exceto** o plugin de Start e o Nitro, que foram removidos porque não têm equivalente em hospedagem estática.

**Por que era necessário:** continuar usando aquele wrapper manteria o build produzindo um pacote de *servidor*, mesmo que todo o resto do projeto fosse adaptado — é a peça de infraestrutura mais acima na cadeia, então precisava ser a primeira a mudar.

**Adicionado:** `base: process.env.VITE_BASE_PATH || "/"` — ver seção dedicada abaixo.

### 2. Bootstrap do React — de implícito (Start) para explícito (`index.html` + `src/main.tsx`)

**Antes:** o TanStack Start gerava o documento HTML e fazia a hidratação do React internamente; não existia `index.html` nem `main.tsx` no projeto-fonte.

**Depois:**
- `index.html` (novo, na raiz do projeto) — o ponto de entrada padrão de qualquer SPA Vite: `<html lang="pt-BR">`, metatags básicas (replicando as que já existiam em `head()` de `__root.tsx`, para que o "primeiro paint" já tenha título/descrição corretos mesmo antes do React montar) e `<div id="root">` + `<script type="module" src="/src/main.tsx">`.
- `src/main.tsx` (novo) — cria o router (`getRouter()`, já existente em `router.tsx`) e monta `<RouterProvider>` dentro de `#root` via `createRoot(...).render(...)`. Também faz o registro de tipos (`declare module "@tanstack/react-router" { interface Register { router: typeof router } }`) que o Start fazia automaticamente.

**Por que era necessário:** sem Start, alguém precisa explicitamente criar o elemento raiz do React e montar a aplicação — é o papel que `index.html`+`main.tsx` cumprem em qualquer app Vite padrão.

### 3. `src/routes/__root.tsx` — remoção do *shell* de SSR

**Removido:** `shellComponent: RootShell` e o componente `RootShell` (que renderizava manualmente `<html><head><HeadContent/></head><body>{children}<Scripts/></body></html>`) — eram a representação do documento HTML completo, papel que numa SPA estática pertence exclusivamente ao `index.html` (fora da árvore React).

**Removido:** `<Scripts />` — injetava as tags de script do *bundle* SSR; sem sentido numa SPA onde o único script (`main.tsx`) já está declarado diretamente em `index.html`.

**Removido:** `links: [{ rel: "stylesheet", href: appCss }]` (e o import `styles.css?url`) — era o padrão usado para o *shell* SSR injetar a folha de estilos explicitamente. Substituído pelo padrão padrão de SPA: `import "./styles.css"` direto em `main.tsx` (o Vite extrai o CSS, gera um arquivo com hash e injeta o `<link>` automaticamente no HTML final do build).

**Mantido, mas reposicionado:** `<HeadContent />` — continua sendo renderizado (agora dentro de `RootComponent`, não de um *shell*), porque ele já é uma API do **núcleo** do TanStack Router (`@tanstack/react-router`, não `@tanstack/react-start`) e funciona sincronizando `document.head` em tempo de execução no navegador, independentemente de existir SSR ou não. Isso preserva, sem reescrever nenhuma rota, o comportamento de cada página continuar definindo seu próprio `<title>`/meta tags via `head()` (ex.: o título com o nome do evento em `eventos.$slug.tsx`).

> **Ponto de atenção:** não há, neste ambiente, como executar `npm run build` para validar 100% esse comportamento do `<HeadContent />` fora do Start. A expectativa, com base na documentação da própria biblioteca, é que continue funcionando sem alteração. Se, depois do deploy, o título da aba não mudar ao navegar entre páginas, é a única peça desta migração que pode precisar de um ajuste manual (ver "Pontos para validar" no final deste documento).

### 4. Roteamento — `createBrowserHistory` (implícito) → `createHashHistory` (explícito)

**Antes:** o Start usa, por padrão, *browser history* (URLs "limpas", como `/eventos/nome-do-evento`) porque ele controla um servidor capaz de responder **qualquer** rota com o HTML correto.

**Depois:** `src/router.tsx` passa `history: createHashHistory()` ao `createRouter(...)`. As URLs passam a ter o formato `https://usuario.github.io/repo/#/eventos/nome-do-evento`.

**Por que era necessário:** o GitHub Pages não tem como reescrever, no servidor, uma URL profunda (`/eventos/nome-do-evento`) de volta para `index.html` — ele simplesmente devolve **404** para qualquer caminho que não corresponda a um arquivo real. Como tudo depois do `#` nunca é enviado ao servidor (é resolvido inteiramente pelo navegador), o GitHub Pages sempre serve `index.html` independentemente da rota interna, e o React Router assume a partir daí. Essa é a solução **mais robusta e com menos partes móveis** para SPA em hospedagem 100% estática sem controle sobre o servidor — em particular, evita depender da técnica alternativa (um `404.html` que redireciona para `index.html`), que é mais frágil e exige manter o `base path` sincronizado em mais de um lugar.

**Trade-off aceito conscientemente:** as URLs deixam de ser "limpas" (ganham o `#`). Nenhuns outro comportamento muda — navegação, botão voltar/avançar do navegador, *scroll restoration*, parâmetros de busca (`?id=...`) e o destaque do link ativo na Navbar continuam funcionando exatamente como antes, porque o TanStack Router abstrai o adaptador de histórico: o restante do código (`<Link to="...">`, `useNavigate()`, `useRouterState(...)`) não precisou de nenhuma alteração.

### 5. Caminho base (`base`) — resolução automática via GitHub Actions

Um site de **projeto** do GitHub Pages é publicado em `https://usuario.github.io/repositorio/` — ou seja, num subdiretório, não na raiz do domínio. Sem informar isso ao Vite, os arquivos JS/CSS gerados seriam referenciados a partir da raiz (`/assets/...`) e dariam 404 no GitHub Pages.

**Solução implementada:** `vite.config.ts` lê `base` de uma variável de ambiente (`VITE_BASE_PATH`), com `"/"` como padrão para desenvolvimento local. O workflow `.github/workflows/deploy.yml` calcula esse valor **automaticamente**, a partir do nome real do repositório (`github.event.repository.name`), antes de rodar `npm run build` — com um caso especial para sites de usuário/organização (repositórios chamados `usuario.github.io`, que são publicados na raiz do domínio, não num subdiretório).

**Por que essa abordagem, e não fixar o valor no código:** fixar `base: "/ingresso-acessivel/"` diretamente no `vite.config.ts` obrigaria a pessoa a editar esse valor manualmente caso nomeie o repositório de outra forma — na prática, o tipo de "adaptação adicional" que o pedido original explicitamente queria evitar. Calculá-lo no workflow elimina essa dependência por completo.

### 6. Outras limpezas (arquivos de configuração)

- **`package.json`**: removidas as dependências `@tanstack/react-start` e `@lovable.dev/vite-tanstack-config` (substituídas, ver acima) e a dependência de build `nitro` (alvo de build server-side, sem uso sem o Start). Nome do pacote atualizado de `tanstack_start_ts` para `ingresso-acessivel`. Nenhum script mudou de comportamento esperado (`dev`, `build`, `preview`, `lint`, `format`); `build` agora produz um `dist/` puramente estático.
- **`eslint.config.js`**: removida a regra `no-restricted-imports` que bania o pacote `server-only` — essa regra só fazia sentido para impedir o uso incorreto de uma convenção específica do TanStack Start (`*.server.ts`), convenção que não existe mais no projeto.
- **`.gitignore`**: removidas entradas específicas de Nitro/Cloudflare (`.output`, `.vinxi`, `.tanstack/**`, `.nitro`, `.wrangler/`, `.dev.vars`) que não se aplicam mais.
- **`public/favicon.svg`** (novo): ícone reaproveitando exatamente a geometria do `Logo.tsx` existente (mesmo `viewBox`, mesmo desenho das três barras) — não foi criada nenhuma identidade visual nova.

---

## O que **não** foi alterado (de propósito)

Tudo o que já era compatível com hospedagem estática foi mantido sem nenhuma modificação:

- Todas as rotas (`src/routes/*.tsx`) — zero alterações de lógica, layout ou conteúdo.
- Todos os componentes (`Navbar`, `Layout`, `EventCard`, `AccessibilityPanel`, `AccessibilityScoreBadge` etc.).
- `AccessibilityContext.tsx` e `CartContext.tsx` — já usavam apenas `localStorage` e Web APIs do navegador; nenhuma dependência de servidor.
- `data/events.ts` — catálogo de eventos simulado, já estático.
- `styles.css` — design tokens, paleta, modo de alto contraste, tudo preservado.
- `components.json`, `tsconfig.json`, `.prettierrc`, `bunfig.toml` — sem relação com SSR, mantidos como estavam.

---

## Pontos para validar ao rodar `npm install` / `npm run build` (não executados neste ambiente)

Este projeto foi adaptado em um ambiente sem acesso à internet, portanto **não foi possível rodar `npm install`, `npm run dev`, `npm run build` ou `npm run lint` de fato** para validar a migração de ponta a ponta. Recomendo fortemente rodar, antes do primeiro push:

```bash
npm install
npm run build
npm run preview
```

e navegar pelo site testando cada rota, o painel de acessibilidade e a compra simulada. Dois pontos específicos merecem atenção (e têm solução de contorno pronta, caso necessário):

1. **Exportação do plugin `@tanstack/router-plugin/vite`**: o `vite.config.ts` importa `{ tanstackRouter }`. Se o `npm run dev` reclamar que esse nome não existe, verifique a documentação da versão instalada do pacote — versões diferentes já usaram nomes como `TanStackRouterVite`. Basta ajustar o nome do import; a forma de uso (`tanstackRouter({ target: "react", autoCodeSplitting: true })`) permanece a mesma.
2. **`<HeadContent />` fora do Start**: se o `<title>` da aba não atualizar ao trocar de rota (ex.: ao entrar em `/eventos/nome-do-evento`), adicione este efeito em `src/routes/__root.tsx` como reforço, dentro de `RootComponent`:
   ```tsx
   const matches = useMatches();
   useEffect(() => {
     const withTitle = [...matches].reverse().find((m) => m.meta?.some((x) => "title" in x));
     const titleMeta = withTitle?.meta?.find((x) => "title" in x) as { title?: string } | undefined;
     if (titleMeta?.title) document.title = titleMeta.title;
   }, [matches]);
   ```
   (requer `import { useMatches } from "@tanstack/react-router"` e `import { useEffect } from "react"`).

3. **Não há `package-lock.json` commitado neste projeto** — por isso o workflow usa `npm install` (não `npm ci`) e o cache de dependências do `actions/setup-node` está desativado (esse cache exige um lockfile para calcular a chave). Isso não impede o deploy de funcionar, só o torna um pouco mais lento. Recomendado, mas opcional: rode `npm install` localmente uma vez, comite o `package-lock.json` gerado, e então troque `npm install` por `npm ci` e reative `cache: npm` no workflow para builds mais rápidos e deterministicos.

Fora esses três pontos, a migração não depende de nenhum comportamento "incerto" — é composição direta de APIs já documentadas do TanStack Router e padrões padrão do Vite.
