import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { createInferHandler } from "./server/inferHandler";

function devInferApi(): Plugin {
  return {
    name: "dev-infer-api",
    configureServer(server) {
      server.middlewares.use("/api/infer", createInferHandler());
    },
  };
}

export default defineConfig({
  plugins: [react(), devInferApi()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
