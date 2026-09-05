import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // Es un JSON de gran tamaño que Vite puede dejar apuntando a un archivo
    // inexistente en su caché si intenta preprocesarlo durante `pnpm dev`.
    exclude: ["an-array-of-spanish-words"],
  },
});
