import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

// Config explícita para SPA estática (GitHub Pages), sem SSR/Nitro/Cloudflare.
// VITE_BASE_PATH é injetado pelo workflow do GitHub Actions com o nome do
// repositório (ex.: /ingresso-acessivel/). Em dev local, o fallback é "/".
export default defineConfig({
  base: process.env.VITE_BASE_PATH || "/",
  plugins: [
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    viteReact(),
    tailwindcss(),
    tsConfigPaths(),
  ],
  build: {
    outDir: "dist",
  },
  resolve: {
    dedupe: ["react", "react-dom"],
  },
});
