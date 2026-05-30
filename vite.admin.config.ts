import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  root: "apps/web-admin",
  plugins: [react()],
  publicDir: "public",
  resolve: {
    alias: {
      "@db": fileURLToPath(new URL("./db", import.meta.url)),
    },
  },
  server: {
    fs: {
      allow: [fileURLToPath(new URL(".", import.meta.url))],
    },
  },
  build: {
    outDir: "../../build/web-admin",
    emptyOutDir: true,
  },
});
