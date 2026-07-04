# Routes

Este projeto usa o **roteamento por arquivo** do TanStack Router.

- Cada arquivo `.tsx` neste diretório é uma rota.
- O layout raiz é `__root.tsx` — não remova o `<Outlet />`.
- `routeTree.gen.ts` é gerado automaticamente — não edite manualmente.
- O router usa **hash history** (URLs no formato `/#/rota`) para compatibilidade com GitHub Pages.

## Rotas do projeto

| Arquivo | URL (com hash) |
|---|---|
| `index.tsx` | `/#/` |
| `eventos.index.tsx` | `/#/eventos` |
| `eventos.$slug.tsx` | `/#/eventos/:slug` |
| `acessibilidade.tsx` | `/#/acessibilidade` |
| `meus-ingressos.tsx` | `/#/meus-ingressos` |
| `login.tsx` | `/#/login` |
