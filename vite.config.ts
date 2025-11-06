import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  base: "/", // ✅ must be "/" when app is hosted at the root
  server: {
    port: 3081,
  },
  preview: {
    allowedHosts: ["mypadmin.bitmyanmar.info"],
  },
  build: {
    chunkSizeWarningLimit: 3000,
  },
  define: {
    global: "globalThis",
  },
});
