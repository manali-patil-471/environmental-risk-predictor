import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
<<<<<<< HEAD
  server: {
    host: "::",
    port: 8080,
=======
  root: __dirname,
  server: {
    host: "127.0.0.1",
    port: 5173,
>>>>>>> 1024658 (Initial commit: backend + lovable frontend + firebase auth)
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
}));
