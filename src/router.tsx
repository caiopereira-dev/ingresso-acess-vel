import { QueryClient } from "@tanstack/react-query";
import { createRouter, createHashHistory } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    // Hash history: necessário para GitHub Pages (sem servidor para reescrever rotas).
    // URLs ficam no formato /#/eventos/slug — não requer arquivo 404.html.
    history: createHashHistory(),
  });

  return router;
};
