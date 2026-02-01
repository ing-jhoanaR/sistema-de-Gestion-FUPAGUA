import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Exporta la configuración de Vite
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: "dist", // Carpeta para el frontend (React)
    emptyOutDir: true,
    sourcemap: true, // Habilitar mapas de origen para depuración
  },
  base: "./", // Importante para rutas relativas
  optimizeDeps: {
    // Aquí no necesitamos excluir Tauri, ya que estamos usando NW.js
  },
});
