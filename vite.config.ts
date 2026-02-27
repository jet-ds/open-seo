import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { defineConfig, loadEnv } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import { devtools } from "@tanstack/devtools-vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const port = env.PORT ? Number(env.PORT) : 3001;

  return {
    envPrefix: ["VITE_", "BYPASS_GATEWAY_LOCAL_ONLY"],
    server: {
      port,
    },
    plugins: [
      devtools({
        consolePiping: {
          enabled: true,
          levels: ["log", "warn", "error", "info", "debug"],
        },
      }),
      cloudflare({ viteEnvironment: { name: "ssr" } }),
      tsConfigPaths(),
      tanstackStart(),
      viteReact(),
      tailwindcss(),
    ],
  };
});
