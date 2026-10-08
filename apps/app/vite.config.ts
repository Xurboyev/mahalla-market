import { seedDesignPlugin } from "@seed-design/vite-plugin";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    alias: { "seed-design": fileURLToPath(new URL("./src/seed-design", import.meta.url)) },
  },
  build: {
    // O'zbekistondagi eski Android qurilmalarini hisobga olib
    target: ["chrome87", "safari14"],
  },
  server: {
    proxy: { "/api": process.env.VITE_API_PROXY ?? "http://localhost:4000" },
  },
  plugins: [react(), seedDesignPlugin({ fontScaling: true })],
});
