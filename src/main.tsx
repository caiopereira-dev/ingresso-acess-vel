import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { getRouter } from "./router";

// CSS global — Vite extrai e injeta o <link> no index.html do build.
import "./styles.css";

const router = getRouter();

// Registro de tipos do router para <Link>, useNavigate(), etc.
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error('Elemento "#root" não encontrado em index.html.');

createRoot(rootElement).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
