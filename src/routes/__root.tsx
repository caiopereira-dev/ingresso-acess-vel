import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useMatches,
  HeadContent,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { AccessibilityProvider } from "@/context/AccessibilityContext";
import { CartProvider } from "@/context/CartContext";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Página não encontrada</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          A página que você está procurando não existe ou foi movida.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Voltar para o início
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Esta página não carregou
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Algo deu errado do nosso lado. Você pode tentar novamente ou voltar para o início.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Tentar novamente
          </button>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Voltar para o início
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Ingresso Acessível — Ingressos para shows e festivais" },
      { name: "description", content: "Plataforma premium e acessível de venda de ingressos para shows, festivais e eventos musicais no Brasil." },
      { property: "og:title", content: "Ingresso Acessível — Música para todas as pessoas" },
      { property: "og:description", content: "Compre ingressos com nota de acessibilidade por evento, leitor de tela, alto contraste e simulação de daltonismo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

// RootComponent: núcleo da árvore React. HeadContent sincroniza title/meta
// de cada rota via head(). O useEffect abaixo é uma garantia extra para o
// modo SPA puro (sem SSR/Start) — alguns builds de TanStack Router não
// propagam head() para document.title automaticamente em hash history;
// o efeito resolve isso lendo os metadados da rota ativa.
function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const matches = useMatches();

  useEffect(() => {
    const withTitle = [...matches]
      .reverse()
      .find((m) => m.meta?.some((x: Record<string, unknown>) => "title" in x));
    const titleEntry = withTitle?.meta?.find(
      (x: Record<string, unknown>) => "title" in x,
    ) as { title?: string } | undefined;
    if (titleEntry?.title) document.title = titleEntry.title;
  }, [matches]);

  return (
    <QueryClientProvider client={queryClient}>
      <HeadContent />
      <AccessibilityProvider>
        <CartProvider>
          <Outlet />
          <Toaster position="top-center" closeButton />
        </CartProvider>
      </AccessibilityProvider>
    </QueryClientProvider>
  );
}
