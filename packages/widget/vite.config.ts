import { defineConfig } from "vite";
import preact from "@preact/preset-vite";

export default defineConfig({
  plugins: [preact()],
  build: {
    lib: { entry: "src/main.tsx", name: "ShiplogWidget", fileName: "shiplog" },
    rollupOptions: { external: [], output: { compact: true } }
  }
});
