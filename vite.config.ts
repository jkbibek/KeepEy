import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  publicDir: "apps/electron/renderer/public",
  build: {
    outDir: "build/electron-renderer",
  },
});
